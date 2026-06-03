import { useMemo, useState } from "react";
import {
  addMinutes,
  endOfDay,
  endOfMonth,
  format as fnsFormat,
  isSameMinute,
  parse as fnsParse,
  set as setDateParts,
  startOfDay,
  subDays,
  subMonths,
} from "date-fns";
import {
  Box,
  Button,
  ClickAwayListener,
  FormLabel,
  IconButton,
  InputAdornment,
  Paper,
  Popper,
  Stack,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateRangeCalendar } from "@mui/x-date-pickers-pro/DateRangeCalendar";
import { TimeField } from "@mui/x-date-pickers/TimeField";
import type { DateRange } from "@mui/x-date-pickers-pro/models";

export type CustomDateTimeRangePickerValue = DateRange<Date>;

export type CustomDateTimeRangePickerProps = {
  disabled?: boolean;
  defaultValue?: CustomDateTimeRangePickerValue;
  value?: CustomDateTimeRangePickerValue;
  onChange?: (value: CustomDateTimeRangePickerValue) => void;
  minDate?: Date;
  maxDate?: Date;
  defaultOpen?: boolean;
  onCancel?: () => void;
};

// Width of the popover paper. Sized to fit the two-month DateRangeCalendar
// without wrapping; adjust together with the calendar width.
const POPOVER_MIN_WIDTH = 660;

// Format used in the read-only anchor TextField (what the user sees when
// the popover is closed).
const ANCHOR_DISPLAY_FORMAT = "MMM d, yyyy h:mm a";

// Format used inside the popover by the editable Start / End TimeFields
// (time-only; the date portion is selected from the calendar below).
const STEPPER_TIME_FORMAT = "h:mm a";

// Formats we try when parsing text pasted into a TimeField. Listed
// from most-specific to least so a more precise match wins first.
const TIME_PASTE_FORMATS = [
  "h:mm:ss a",
  "hh:mm:ss a",
  "h:mm a",
  "hh:mm a",
  "HH:mm:ss",
  "H:mm:ss",
  "HH:mm",
  "H:mm",
];

function parsePastedTime(text: string, baseDate: Date | null): Date | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  // date-fns parses "AM"/"PM" case-sensitively; normalize what users paste.
  const normalized = trimmed.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  const base = baseDate ?? new Date();
  for (const fmt of TIME_PASTE_FORMATS) {
    const parsed = fnsParse(normalized, fmt, base);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function getDisplayValue(range: CustomDateTimeRangePickerValue): string {
  const [start, end] = range;
  if (!start || !end) return "";
  const now = new Date();
  if (
    isSameMinute(start, startOfDay(now)) &&
    isSameMinute(end, endOfDay(now))
  ) {
    return "Today";
  }
  const y = subDays(now, 1);
  if (isSameMinute(start, startOfDay(y)) && isSameMinute(end, endOfDay(y))) {
    return "Yesterday";
  }
  return `${fnsFormat(start, ANCHOR_DISPLAY_FORMAT)} – ${fnsFormat(end, ANCHOR_DISPLAY_FORMAT)}`;
}

function withTimeOf(target: Date, source: Date | null): Date {
  if (!source) return target;
  return setDateParts(target, {
    hours: source.getHours(),
    minutes: source.getMinutes(),
    seconds: source.getSeconds(),
    milliseconds: source.getMilliseconds(),
  });
}

function StepperField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | null;
  onChange: (next: Date | null) => void;
}) {
  const step = (dir: 1 | -1) => {
    if (!value) return;
    onChange(addMinutes(value, dir));
  };
  // Allow pasting a whole time string ("05:12:45 PM", "17:12", etc.) by
  // intercepting paste, parsing across known formats, and dispatching the
  // resulting Date through onChange. If parsing fails we leave the default
  // segmented-paste behavior alone.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    const parsed = parsePastedTime(text, value);
    if (!parsed) return;
    e.preventDefault();
    e.stopPropagation();
    onChange(parsed);
  };
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <FormLabel sx={{ display: "block" }}>{label}</FormLabel>
      <Box sx={{ position: "relative" }}>
        <TimeField
          value={value}
          onChange={onChange}
          format={STEPPER_TIME_FORMAT}
          size="small"
          sx={{ width: "100%" }}
          slotProps={{
            textField: {
              fullWidth: true,
              onPaste: handlePaste,
              slotProps: {
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack sx={{ ml: -1 }}>
                        <IconButton
                          size="small"
                          onClick={() => step(1)}
                          sx={{ p: 0, height: 16 }}
                          aria-label="increment"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            keyboard_arrow_up
                          </span>
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => step(-1)}
                          sx={{ p: 0, height: 16 }}
                          aria-label="decrement"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            keyboard_arrow_down
                          </span>
                        </IconButton>
                      </Stack>
                    </InputAdornment>
                  ),
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}

export function CustomDateTimeRangePicker({
  disabled,
  defaultValue,
  value,
  onChange,
  minDate,
  maxDate,
  defaultOpen,
  onCancel,
}: CustomDateTimeRangePickerProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [internalValue, setInternalValue] =
    useState<CustomDateTimeRangePickerValue>(defaultValue ?? [null, null]);
  const currentValue = value ?? internalValue;
  const [draftStart, setDraftStart] = useState<Date | null>(
    currentValue[0] ?? null,
  );
  const [draftEnd, setDraftEnd] = useState<Date | null>(
    currentValue[1] ?? null,
  );
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [resetKey, setResetKey] = useState(0);
  // Tracks which month is "current" inside the DateRangeCalendar. With
  // `currentMonthCalendarPosition={2}`, the right calendar shows this month
  // and the left calendar shows the previous month. We need this so we can
  // disable the back arrow when navigating further would put the leftmost
  // month entirely outside [minDate, maxDate]. MUI X's built-in
  // `usePreviousMonthDisabled` only checks `currentMonth - 1`, not the
  // leftmost-after-navigation month (`currentMonth - 2`).
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    () => currentValue[1] ?? currentValue[0] ?? new Date(),
  );

  // Leftmost month after pressing the back arrow once.
  const prevDisabledOverride =
    minDate !== undefined && endOfMonth(subMonths(visibleMonth, 2)) < minDate;

  const openPicker = () => {
    setDraftStart(currentValue[0] ?? null);
    setDraftEnd(currentValue[1] ?? null);
    setOpen(true);
  };

  // While the popover is open, mirror the user's in-progress draft selection
  // so the anchor input updates live as days/times are clicked. Cancel still
  // reverts (drafts are discarded); Apply commits the draft to `value`.
  const displayValue = useMemo(
    () =>
      open
        ? getDisplayValue([draftStart, draftEnd])
        : getDisplayValue(currentValue),
    [open, draftStart, draftEnd, currentValue],
  );

  const handleApply = () => {
    const next: CustomDateTimeRangePickerValue = [draftStart, draftEnd];
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  const handleReset = () => {
    setDraftStart(null);
    setDraftEnd(null);
    setVisibleMonth(new Date());
    // Force-remount the DateRangeCalendar so its internal range-position
    // state (start vs end) resets and no day stays highlighted.
    setResetKey((k) => k + 1);
  };

  const handleRangeChange = (range: DateRange<Date>) => {
    const [newStart, newEnd] = range;
    setDraftStart(newStart ? withTimeOf(newStart, draftStart) : null);
    setDraftEnd(newEnd ? withTimeOf(newEnd, draftEnd) : null);
  };

  // The DateRangeCalendar treats any value change as a potential date
  // change and may re-position its visible months. Feeding it values
  // normalized to start-of-day means a time-only edit (the steppers) no
  // longer alters what it sees as the value, so the calendar stays put.
  const startKey = draftStart ? startOfDay(draftStart).getTime() : 0;
  const endKey = draftEnd ? startOfDay(draftEnd).getTime() : 0;
  const calendarValue = useMemo<DateRange<Date>>(
    () => [
      draftStart ? startOfDay(draftStart) : null,
      draftEnd ? startOfDay(draftEnd) : null,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startKey, endKey],
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TextField
        ref={setAnchorEl}
        fullWidth
        size="small"
        value={displayValue}
        disabled={disabled}
        onClick={disabled ? undefined : openPicker}
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
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ zIndex: (t) => t.zIndex.modal }}
      >
        <ClickAwayListener onClickAway={() => open && handleCancel()}>
          <Paper
            elevation={8}
            sx={{ p: 0, borderRadius: 1, minWidth: POPOVER_MIN_WIDTH }}
          >
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <DateRangeCalendar
                key={resetKey}
                value={calendarValue}
                onChange={handleRangeChange}
                onMonthChange={setVisibleMonth}
                calendars={2}
                minDate={minDate}
                maxDate={maxDate}
                currentMonthCalendarPosition={2}
                disableAutoMonthSwitching
                slotProps={
                  prevDisabledOverride
                    ? { previousIconButton: { disabled: true } }
                    : undefined
                }
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 2,
                px: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <StepperField
                label="Start time"
                value={draftStart}
                onChange={setDraftStart}
              />
              <Box sx={{ pt: 3, color: "text.secondary" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  arrow_forward
                </span>
              </Box>
              <StepperField
                label="End time"
                value={draftEnd}
                onChange={setDraftEnd}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 2,
                px: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                variant="text"
                color="primary"
                onClick={handleCancel}
                sx={{ fontWeight: 700, letterSpacing: "0.46px" }}
              >
                Cancel
              </Button>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleReset}
                  sx={{ fontWeight: 700, letterSpacing: "0.46px" }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApply}
                  sx={{ fontWeight: 700, letterSpacing: "0.46px" }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </LocalizationProvider>
  );
}
