// "Manage widgets" drawer (v2). Unlike the Add panel, every catalog widget is
// shown with a checkbox reflecting whether it's currently on the dashboard —
// checking adds, unchecking removes. Apply commits the full desired set.

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Checkbox,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRef, useState } from "react";
import type React from "react";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

import { WIDGET_CATALOG, type WidgetCategory, type WidgetDef } from "../lib";
import { WidgetPreview } from "../widget-preview";

// How long the pointer must dwell on a row before its preview appears.
const HOVER_DELAY_MS = 150;

type HoverProps = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
};

const CATEGORY_ORDER: WidgetCategory[] = [
  "KPIs",
  "Status",
  "Charts",
  "Tables",
  "Other",
];

const ALL_TYPES = WIDGET_CATALOG.map((w) => w.type);

function WidgetRow({
  widget,
  checked,
  onToggle,
  hoverProps,
}: {
  widget: WidgetDef;
  checked: boolean;
  onToggle: () => void;
  hoverProps: HoverProps;
}) {
  return (
    <Box
      role="button"
      aria-pressed={checked}
      {...hoverProps}
      onClick={onToggle}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        textAlign: "left",
        border: "1px solid",
        borderColor: checked ? "primary.main" : "divider",
        bgcolor: checked
          ? alpha(theme.palette.primary.main, 0.08)
          : "background.paper",
        borderRadius: 1,
        p: 1.25,
        cursor: "pointer",
        transition: "border-color 120ms, background 120ms",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, checked ? 0.12 : 0.04),
        },
        ...theme.applyStyles("dark", {
          borderColor: checked
            ? theme.vars.palette.primary.light
            : theme.vars.palette.divider,
        }),
      })}
    >
      <Checkbox
        size="small"
        checked={checked}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggle}
        sx={{ p: 0.5, "& .MuiSvgIcon-root": { fontSize: 20 } }}
      />
      <Box
        sx={(theme) => ({
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
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
        <MaterialSymbol name={widget.icon} size={18} />
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: 14, color: "text.primary" }}>
        {widget.name}
      </Typography>
    </Box>
  );
}

export function ManagePanel({
  open,
  onClose,
  dashboardTypes,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  /** Widget types currently on the dashboard. */
  dashboardTypes: string[];
  /** Commit the desired set of widget types. */
  onApply: (types: string[]) => void;
}) {
  const [q, setQ] = useState("");
  // The desired on-dashboard set, seeded from the current dashboard each open.
  const [selected, setSelected] = useState<string[]>(dashboardTypes);
  // Currently hovered widget (drives the floating preview).
  const [hovered, setHovered] = useState<{ type: string; anchorY: number } | null>(
    null,
  );
  const hoverTimer = useRef<number | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const hoverProps = (type: string): HoverProps => ({
    onMouseEnter: (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const anchorY = rect.top + rect.height / 2;
      clearHoverTimer();
      hoverTimer.current = window.setTimeout(() => {
        setHovered({ type, anchorY });
      }, HOVER_DELAY_MS);
    },
    onMouseLeave: () => {
      clearHoverTimer();
      setHovered(null);
    },
  });

  // Re-seed when the drawer transitions to open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelected(dashboardTypes);
      setQ("");
    }
  }

  const matches = (w: { name: string; desc: string }) =>
    (w.name + " " + w.desc).toLowerCase().includes(q.toLowerCase());

  const toggle = (type: string) =>
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  const selectAll = () => setSelected(ALL_TYPES);
  const clearAll = () => setSelected([]);

  const handleClose = () => {
    clearHoverTimer();
    setHovered(null);
    setQ("");
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width={380}
      title="Manage widgets"
      subheader={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {selected.length} of {ALL_TYPES.length} selected
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={selectAll}
              sx={(theme) => ({
                fontWeight: 600,
                fontSize: 14,
                color:
                  selected.length === ALL_TYPES.length
                    ? "text.disabled"
                    : "primary.main",
                ...(selected.length === ALL_TYPES.length
                  ? {}
                  : theme.applyStyles("dark", {
                      color: theme.vars.palette.primary.light,
                    })),
                pointerEvents:
                  selected.length === ALL_TYPES.length ? "none" : "auto",
              })}
            >
              Select all
            </Link>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={clearAll}
              sx={(theme) => ({
                fontWeight: 600,
                fontSize: 14,
                color: selected.length === 0 ? "text.disabled" : "primary.main",
                ...(selected.length === 0
                  ? {}
                  : theme.applyStyles("dark", {
                      color: theme.vars.palette.primary.light,
                    })),
                pointerEvents: selected.length === 0 ? "none" : "auto",
              })}
            >
              Clear all
            </Link>
          </Box>
        </Box>
      }
      secondaryAction={{ label: "Cancel", onClick: handleClose }}
      primaryAction={{
        label: "Save",
        sx: { minWidth: 0 },
        onClick: () => {
          onApply(selected);
          handleClose();
        },
      }}
    >
      <TextField
        size="small"
        fullWidth
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search widgets"
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
          const items = WIDGET_CATALOG.filter((w) => w.cat === cat && matches(w));
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
                {items.map((w) => (
                  <WidgetRow
                    key={w.type}
                    widget={w}
                    checked={selected.includes(w.type)}
                    onToggle={() => toggle(w.type)}
                    hoverProps={hoverProps(w.type)}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {hovered && (
        <WidgetPreview
          key={hovered.type}
          type={hovered.type}
          anchorY={hovered.anchorY}
        />
      )}
    </Drawer>
  );
}
