// Slide-out "Add widget" drawer. Categorized list of all widgets in the
// catalog with a search box, an "already added" state, and a floating preview
// (see WidgetPreview) shown on hover.

import SearchIcon from "@mui/icons-material/Search";
import { Box, Chip, InputAdornment, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRef, useState } from "react";

import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";

import { WIDGET_CATALOG, type WidgetCategory, type WidgetDef } from "./lib";
import { WidgetPreview } from "./widget-preview";

const CATEGORY_ORDER: WidgetCategory[] = [
  "KPIs",
  "Status",
  "Charts",
  "Tables",
  "Other",
];

// How long the pointer must dwell on an item before its preview appears.
const HOVER_DELAY_MS = 150;

type HoverProps = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
};

function WidgetListItem({
  widget,
  added,
  selected,
  onToggle,
  hoverProps,
}: {
  widget: WidgetDef;
  added: boolean;
  selected: boolean;
  onToggle: () => void;
  hoverProps: HoverProps;
}) {
  return (
    <Box
      role="button"
      aria-pressed={selected}
      aria-disabled={added || undefined}
      {...hoverProps}
      onClick={added ? undefined : onToggle}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        textAlign: "left",
        width: "100%",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.08)
          : "background.paper",
        borderRadius: 1,
        p: 1.25,
        cursor: added ? "not-allowed" : "pointer",
        opacity: added ? 0.6 : 1,
        transition: "border-color 120ms, background 120ms",
        ...(!added && {
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, selected ? 0.12 : 0.04),
          },
        }),
        ...theme.applyStyles("dark", {
          borderColor: selected
            ? theme.vars.palette.primary.light
            : theme.vars.palette.divider,
          ...(!added && {
            "&:hover": {
              borderColor: theme.vars.palette.primary.light,
              bgcolor: alpha(theme.palette.primary.main, selected ? 0.12 : 0.04),
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
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontWeight: 600, fontSize: 14, color: "text.primary" }}
        >
          {widget.name}
        </Typography>
      </Box>
      {added && (
        <Chip
          size="small"
          label="Added"
          icon={<MaterialSymbol name="check" size={16} />}
          sx={{ flexShrink: 0 }}
        />
      )}
    </Box>
  );
}

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
  // Widgets staged to add; only committed (via onApply) when Apply is clicked.
  const [pending, setPending] = useState<string[]>([]);
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

  const matches = (w: { name: string; desc: string }) =>
    (w.name + " " + w.desc).toLowerCase().includes(q.toLowerCase());

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

  const toggle = (type: string) =>
    setPending((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  const handleClose = () => {
    clearHoverTimer();
    setPending([]);
    setQ("");
    setHovered(null);
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
        label:
          pending.length === 0
            ? "Add widget"
            : `Add ${pending.length} widget${pending.length === 1 ? "" : "s"}`,
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
                {items.map((w) => (
                  <WidgetListItem
                    key={w.type}
                    widget={w}
                    added={existingTypes.includes(w.type)}
                    selected={pending.includes(w.type)}
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
