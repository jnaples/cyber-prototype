import { useMemo, useState } from "react";
import {
  addMinutes,
  endOfDay,
  format as fnsFormat,
  isSameMinute,
  set as setDateParts,
  startOfDay,
  subDays,
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
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
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
const ANCHOR_DISPLAY_FORMAT = "MMM d, yyyy h:mm:ss a";

// Format used inside the popover by the editable Start / End DateTimeFields.
const STEPPER_FIELD_FORMAT = "MMM d, yyyy, h:mm:ss a";

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
  minDate,
  maxDate,
}: {
  label: string;
  value: Date | null;
  onChange: (next: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const step = (dir: 1 | -1) => {
    if (!value) return;
    onChange(addMinutes(value, dir));
  };
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <FormLabel sx={{ display: "block" }}>{label}</FormLabel>
      <Box sx={{ position: "relative" }}>
        <DateTimeField
          value={value}
          onChange={onChange}
          format={STEPPER_FIELD_FORMAT}
          size="small"
          minDate={minDate}
          maxDate={maxDate}
          sx={{ width: "100%" }}
          slotProps={{
            textField: {
              fullWidth: true,
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

  const openPicker = () => {
    setDraftStart(currentValue[0] ?? null);
    setDraftEnd(currentValue[1] ?? null);
    setOpen(true);
  };

  const displayValue = useMemo(
    () => getDisplayValue(currentValue),
    [currentValue],
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
  };

  const handleRangeChange = (range: DateRange<Date>) => {
    const [newStart, newEnd] = range;
    setDraftStart(newStart ? withTimeOf(newStart, draftStart) : null);
    setDraftEnd(newEnd ? withTimeOf(newEnd, draftEnd) : null);
  };

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
            sx={{ p: 0, mt: 1, borderRadius: 1, minWidth: POPOVER_MIN_WIDTH }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 2,
                px: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <StepperField
                label="Start"
                value={draftStart}
                onChange={setDraftStart}
                minDate={minDate}
                maxDate={maxDate}
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
                label="End"
                value={draftEnd}
                onChange={setDraftEnd}
                minDate={minDate}
                maxDate={maxDate}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <DateRangeCalendar
                value={[draftStart, draftEnd]}
                onChange={handleRangeChange}
                calendars={2}
                minDate={minDate}
                maxDate={maxDate}
                currentMonthCalendarPosition={2}
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
