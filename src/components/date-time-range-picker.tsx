import { useMemo, useRef, useState } from "react";
import {
  endOfDay,
  format as fnsFormat,
  isSameMinute,
  startOfDay,
  subDays,
} from "date-fns";
import { Box, InputAdornment, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateTimeRangePicker as MuiDateTimeRangePicker } from "@mui/x-date-pickers-pro/DateTimeRangePicker";
import type { PickersShortcutsItem } from "@mui/x-date-pickers-pro";
import type { DateRange } from "@mui/x-date-pickers-pro/models";

export type DateTimeRangePickerShortcut = PickersShortcutsItem<DateRange<Date>>;

export type DateTimeRangePickerValue = DateRange<Date>;

export type DateTimeRangePickerProps = {
  shortcuts?: DateTimeRangePickerShortcut[];
  disabled?: boolean;
  defaultValue?: DateTimeRangePickerValue;
  value?: DateTimeRangePickerValue;
  onChange?: (value: DateTimeRangePickerValue) => void;
  minDate?: Date;
  maxDate?: Date;
};

const FORMAT = "MMM d, yyyy h:mm:ss a";

function getDisplayValue(range: DateTimeRangePickerValue): string {
  const [start, end] = range;
  if (!start || !end) return "";
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  if (isSameMinute(start, todayStart) && isSameMinute(end, todayEnd)) {
    return "Today";
  }
  const yesterday = subDays(now, 1);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);
  if (
    isSameMinute(start, yesterdayStart) &&
    isSameMinute(end, yesterdayEnd)
  ) {
    return "Yesterday";
  }
  return `${fnsFormat(start, FORMAT)} – ${fnsFormat(end, FORMAT)}`;
}

export function DateTimeRangePicker({
  shortcuts,
  disabled,
  defaultValue,
  value,
  onChange,
  minDate,
  maxDate,
}: DateTimeRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<DateTimeRangePickerValue>(
    defaultValue ?? [null, null],
  );
  const anchorRef = useRef<HTMLDivElement>(null);

  const currentValue = value ?? internalValue;
  const displayValue = useMemo(
    () => getDisplayValue(currentValue),
    [currentValue],
  );

  const handleChange = (newValue: DateTimeRangePickerValue) => {
    if (value === undefined) setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TextField
        ref={anchorRef}
        fullWidth
        size="small"
        value={displayValue}
        disabled={disabled}
        onClick={disabled ? undefined : () => setOpen(true)}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  date_range
                </span>
              </InputAdornment>
            ),
          },
        }}
      />
      <Box sx={{ display: "none" }}>
        <MuiDateTimeRangePicker
          views={["day", "hours", "minutes", "seconds"]}
          timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
          format={FORMAT}
          disabled={disabled}
          value={currentValue}
          onChange={handleChange}
          minDate={minDate}
          maxDate={maxDate}
          open={open}
          onClose={() => setOpen(false)}
          slotProps={{
            popper: { anchorEl: () => anchorRef.current as HTMLElement },
            ...(shortcuts ? { shortcuts: { items: shortcuts } } : {}),
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
