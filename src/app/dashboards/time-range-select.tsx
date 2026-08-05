// Standalone time-range selector: a secondary text button whose label is the
// active range, opening a menu of the preset options. Used in the Dashboards
// V2 toolbar. "Custom" is intentionally not offered here — the custom date
// range lives in the Quick Filters drawer.

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

import { TIME_RANGE_OPTIONS, type TimeRangeKey } from "./dashboard-filters";

const PRESET_OPTIONS = TIME_RANGE_OPTIONS.filter((o) => o.value !== "custom");

export function TimeRangeSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: TimeRangeKey;
  onChange: (next: TimeRangeKey) => void;
  disabled?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleChange = (next: TimeRangeKey) => {
    setAnchorEl(null);
    onChange(next);
  };

  const activeLabel =
    PRESET_OPTIONS.find((o) => o.value === value)?.label ?? "Last 24 hours";

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        disabled={disabled}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />}
        sx={{ pr: 0, whiteSpace: "nowrap" }}
      >
        {activeLabel}
        {/* Rule between the label and the chevron, full button height. */}
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            alignSelf: "stretch",
            my: "-4px",
            py: "4px",
            ml: 1,
            px: 0.75,
            borderLeft: "1px solid",
            borderColor: "inherit",
          }}
        >
          <MaterialSymbol
            name={anchorEl ? "expand_less" : "expand_more"}
            size={20}
          />
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {PRESET_OPTIONS.map((o) => (
          <MenuItem
            key={o.value}
            selected={o.value === value}
            onClick={() => handleChange(o.value)}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
