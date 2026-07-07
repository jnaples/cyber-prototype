// Slide-out "Add content" drawer. Categorized list of all widgets in the
// catalog with a search box and an "already added" count badge.

import SearchIcon from "@mui/icons-material/Search";
import { Box, Chip, InputAdornment, TextField, Typography } from "@mui/material";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

import { WIDGET_CATALOG, type WidgetCategory } from "./lib";

const CATEGORY_ORDER: WidgetCategory[] = [
  "KPIs",
  "Status",
  "Charts",
  "Tables",
  "Other",
];

export function AddPanel({
  open,
  onClose,
  onApply,
  existingTypes = [],
}: {
  open: boolean;
  onClose: () => void;
  onApply: (types: string[]) => void;
  /** Widget types already on the dashboard — shown as "Added" and disabled. */
  existingTypes?: string[];
}) {
  const [q, setQ] = useState("");
  // Widgets staged to add; only committed (via onAdd) when Apply is clicked.
  const [pending, setPending] = useState<string[]>([]);
  const matches = (w: { name: string; desc: string }) =>
    (w.name + " " + w.desc).toLowerCase().includes(q.toLowerCase());

  const handleClose = () => {
    setPending([]);
    setQ("");
    onClose();
  };

  const handleApply = () => {
    onApply(pending);
    handleClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width={380}
      title="Add widget"
      subheader={
        pending.length > 0
          ? `${pending.length} widget${pending.length === 1 ? "" : "s"} selected`
          : undefined
      }
      secondaryAction={{ label: "Cancel", onClick: handleClose }}
      primaryAction={{
        label: "Apply",
        onClick: handleApply,
        disabled: pending.length === 0,
        tooltip:
          pending.length === 0 ? "Select a widget to add first" : undefined,
      }}
    >
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        Pick a widget to add to your dashboard.
      </Typography>

      <TextField
        size="small"
        fullWidth
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        {CATEGORY_ORDER.map((cat) => {
          const items = WIDGET_CATALOG.filter(
            (w) => w.cat === cat && matches(w),
          );
          if (!items.length) return null;
          return (
            <Box key={cat}>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", display: "block" }}
              >
                {cat}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {items.map((w) => {
                  const added = existingTypes.includes(w.type);
                  const selected = pending.includes(w.type);
                  return (
                    <Box
                      key={w.type}
                      role="button"
                      aria-pressed={selected}
                      aria-disabled={added || undefined}
                      onClick={
                        added
                          ? undefined
                          : () =>
                              setPending((prev) =>
                                prev.includes(w.type)
                                  ? prev.filter((t) => t !== w.type)
                                  : [...prev, w.type],
                              )
                      }
                      sx={(theme) => ({
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        textAlign: "left",
                        width: "100%",
                        border: "1px solid",
                        borderColor: selected ? "primary.main" : "divider",
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        p: 1.25,
                        cursor: added ? "not-allowed" : "pointer",
                        opacity: added ? 0.6 : 1,
                        transition: "border-color 120ms, background 120ms",
                        ...(!added && {
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "rgba(53,39,253,.04)",
                          },
                        }),
                        ...theme.applyStyles("dark", {
                          borderColor: selected
                            ? theme.vars.palette.primary.light
                            : theme.vars.palette.divider,
                          ...(!added && {
                            "&:hover": {
                              borderColor: theme.vars.palette.primary.light,
                              bgcolor: "rgba(53,39,253,.04)",
                            },
                          }),
                        }),
                      })}
                    >
                      <Box
                        sx={(theme) => ({
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: "rgba(53,39,253,.1)",
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          ...theme.applyStyles("dark", {
                            color: theme.vars.palette.primary.light,
                          }),
                        })}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 18 }}
                        >
                          {w.icon}
                        </span>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "text.primary",
                          }}
                        >
                          {w.name}
                        </Typography>
                      </Box>
                      {added && (
                        <Chip
                          size="small"
                          label="Added"
                          icon={
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 16 }}
                            >
                              check
                            </span>
                          }
                          sx={{ flexShrink: 0 }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
}
