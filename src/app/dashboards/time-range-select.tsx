// Standalone time-range selector: a dropdown with a calendar adornment that
// swaps to a MUI date-range picker when "Custom" is chosen (same behavior as
// the Quick Filters drawer). Used in the Dashboards V2 toolbar.

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { Box, Button, InputAdornment, MenuItem, Select } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import type { DateRange } from "@mui/x-date-pickers-pro/models";
import { usePickerActionsContext } from "@mui/x-date-pickers/hooks";
import type { PickersActionBarProps } from "@mui/x-date-pickers/PickersActionBar";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";

import { TIME_RANGE_OPTIONS, type TimeRangeKey } from "./dashboard-filters";

// Custom footer for the date range picker: Cancel (left), Reset + Done (right).
function PickerActionBar({ className }: PickersActionBarProps) {
  const { setValue, acceptValueChanges, cancelValueChanges } =
    usePickerActionsContext<DateRange<Date>>();
  const handleReset = () => setValue([null, null], { changeImportance: "set" });
  const linkSx = {
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.46px",
  };
  return (
    <Box
      className={className}
      sx={{
        gridColumn: "1 / -1",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Button variant="text" color="primary" onClick={cancelValueChanges} sx={linkSx}>
        Cancel
      </Button>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="text" color="primary" onClick={handleReset} sx={linkSx}>
          Reset
        </Button>
        <Button variant="contained" color="primary" onClick={acceptValueChanges} sx={linkSx}>
          Done
        </Button>
      </Box>
    </Box>
  );
}

export function TimeRangeSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: TimeRangeKey;
  onChange: (next: TimeRangeKey) => void;
  disabled?: boolean;
}) {
  const [customRange, setCustomRange] = useState<DateRange<Date>>([null, null]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleChange = (next: TimeRangeKey) => {
    if (next === "custom" && value !== "custom") setPickerOpen(true);
    onChange(next);
  };

  if (value === "custom") {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateRangePicker
          value={customRange}
          onChange={(v) => setCustomRange(v)}
          open={pickerOpen}
          onOpen={() => setPickerOpen(true)}
          onClose={() => {
            setPickerOpen(false);
            // An empty/incomplete range is never valid — fall back to 24h.
            if (!customRange[0] || !customRange[1]) {
              setCustomRange([null, null]);
              onChange("24h");
            }
          }}
          calendars={2}
          minDate={startOfDay(subDays(new Date(), 90))}
          maxDate={endOfDay(new Date())}
          closeOnSelect={false}
          disableOpenPicker
          disabled={disabled}
          slots={{ actionBar: PickerActionBar }}
          slotProps={{
            field: { readOnly: true },
            textField: {
              size: "small",
              onClick: () => setPickerOpen(true),
              sx: { cursor: "pointer", minWidth: 240 },
            },
          }}
        />
      </LocalizationProvider>
    );
  }

  return (
    <Select
      size="small"
      value={value}
      disabled={disabled}
      onChange={(e) => handleChange(e.target.value as TimeRangeKey)}
      startAdornment={
        <InputAdornment position="start">
          <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
        </InputAdornment>
      }
      sx={{ minWidth: 160 }}
    >
      {TIME_RANGE_OPTIONS.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </Select>
  );
}
