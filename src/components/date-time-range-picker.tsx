import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateTimeRangePicker as MuiDateTimeRangePicker } from "@mui/x-date-pickers-pro/DateTimeRangePicker";
import type { PickersShortcutsItem } from "@mui/x-date-pickers-pro";
import type { DateRange } from "@mui/x-date-pickers-pro/models";

export type DateTimeRangePickerShortcut = PickersShortcutsItem<DateRange<Date>>;

export type DateTimeRangePickerProps = {
  shortcuts?: DateTimeRangePickerShortcut[];
  disabled?: boolean;
};

export function DateTimeRangePicker({
  shortcuts,
  disabled,
}: DateTimeRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDateTimeRangePicker
        views={["day", "hours", "minutes", "seconds"]}
        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
        format="MMM d, yyyy h:mm:ss a"
        disabled={disabled}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          field: { openPickerButtonPosition: "start" },
          openPickerButton: { size: "small" },
          openPickerIcon: { fontSize: "small" },
          textField: {
            size: "small",
            onClick: disabled ? undefined : () => setOpen(true),
          },
          ...(shortcuts ? { shortcuts: { items: shortcuts } } : {}),
        }}
      />
    </LocalizationProvider>
  );
}
