// Quick Filters drawer: a time-range dropdown plus multi-select dropdowns
// (checkboxes inside) for the other dimensions. Selections stage in a draft
// and commit to the page on Apply.

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import type { DateRange } from "@mui/x-date-pickers-pro/models";
import { usePickerActionsContext } from "@mui/x-date-pickers/hooks";
import type { PickersActionBarProps } from "@mui/x-date-pickers/PickersActionBar";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";

import { Drawer } from "@/components/drawer";

import {
  CATEGORY_OPTIONS,
  DEPLOYMENT_TYPE_OPTIONS,
  ORGANIZATION_OPTIONS,
  RESULT_OPTIONS,
  SITE_OPTIONS,
  TIME_RANGE_OPTIONS,
  type DashboardFilters,
  type TimeRangeKey,
} from "./dashboard-filters";

// Custom footer for the date range picker: Cancel (left), Reset + Done (right).
// Done commits the selected range and closes; Cancel reverts; Reset clears.
function PickerActionBar({ className }: PickersActionBarProps) {
  const { setValue, acceptValueChanges, cancelValueChanges } =
    usePickerActionsContext<DateRange<Date>>();
  // Reset only unselects the days — it must NOT close the picker (which the
  // built-in `clearValue` action does).
  const handleReset = () =>
    setValue([null, null], { changeImportance: "set" });
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
      <Button
        variant="text"
        color="primary"
        onClick={cancelValueChanges}
        sx={linkSx}
      >
        Cancel
      </Button>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="text"
          color="primary"
          onClick={handleReset}
          sx={linkSx}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={acceptValueChanges}
          sx={linkSx}
        >
          Done
        </Button>
      </Box>
    </Box>
  );
}

// Checkbox-group keys (everything except the single-select time range).
type GroupKey =
  | "organizations"
  | "results"
  | "sites"
  | "deploymentTypes"
  | "categories";

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <FormControl fullWidth size="small">
      <FormLabel>{label}</FormLabel>
      <Select
        multiple
        displayEmpty
        value={selected}
        onChange={handleChange}
        renderValue={(sel) =>
          sel.length === 0 ? (
            <Typography
              component="span"
              variant="body1"
              sx={{ color: "text.secondary" }}
            >
              All
            </Typography>
          ) : (
            sel.join(", ")
          )
        }
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox size="small" checked={selected.includes(option)} />
            <ListItemText
              primary={option}
              slotProps={{ primary: { variant: "body2" } }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function QuickFilters({
  open,
  onClose,
  filters,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: DashboardFilters;
  onApply: (next: DashboardFilters) => void;
}) {
  const [draft, setDraft] = useState<DashboardFilters>(filters);
  // Custom date range (prototype: not persisted to DashboardFilters).
  const [customRange, setCustomRange] = useState<DateRange<Date>>([null, null]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Re-seed the draft from the applied filters whenever the drawer opens
  // (adjust-state-during-render rather than an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(filters);
  }

  const handleTimeRangeChange = (next: TimeRangeKey) => {
    if (next === "custom" && draft.timeRange !== "custom") {
      setPickerOpen(true);
    }
    setDraft((d) => ({ ...d, timeRange: next }));
  };

  const setGroup = (key: GroupKey, values: string[]) =>
    setDraft((d) => ({ ...d, [key]: values }));

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={380}
      title="Quick Filters"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{ label: "Apply", onClick: handleApply }}
    >
      <MultiSelect
        label="Organizations"
        options={ORGANIZATION_OPTIONS}
        selected={draft.organizations}
        onChange={(v) => setGroup("organizations", v)}
      />

      <FormControl fullWidth size="small">
        <FormLabel>Time range</FormLabel>
        {draft.timeRange === "custom" ? (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              value={customRange}
              onChange={(value) => setCustomRange(value)}
              open={pickerOpen}
              onOpen={() => setPickerOpen(true)}
              onClose={() => {
                setPickerOpen(false);
                // An empty/incomplete custom range is never a valid state —
                // fall back to the Last 24 hours default.
                if (!customRange[0] || !customRange[1]) {
                  setCustomRange([null, null]);
                  setDraft((d) => ({ ...d, timeRange: "24h" }));
                }
              }}
              calendars={2}
              minDate={startOfDay(subDays(new Date(), 90))}
              maxDate={endOfDay(new Date())}
              closeOnSelect={false}
              // No calendar icon — clicking the field opens the calendar to
              // reselect. The field is read-only so dates can't be typed.
              disableOpenPicker
              slots={{ actionBar: PickerActionBar }}
              slotProps={{
                field: { readOnly: true },
                textField: {
                  size: "small",
                  fullWidth: true,
                  onClick: () => setPickerOpen(true),
                  sx: { cursor: "pointer" },
                },
              }}
            />
          </LocalizationProvider>
        ) : (
          <Select
            value={draft.timeRange}
            onChange={(e) =>
              handleTimeRangeChange(e.target.value as TimeRangeKey)
            }
          >
            {TIME_RANGE_OPTIONS.flatMap((option) =>
              option.value === "custom"
                ? [
                    <Divider key="custom-divider" />,
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>,
                  ]
                : (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ),
            )}
          </Select>
        )}
      </FormControl>

      <MultiSelect
        label="Result"
        options={RESULT_OPTIONS}
        selected={draft.results}
        onChange={(v) => setGroup("results", v)}
      />
      <MultiSelect
        label="Site / Network"
        options={SITE_OPTIONS}
        selected={draft.sites}
        onChange={(v) => setGroup("sites", v)}
      />
      <MultiSelect
        label="Deployment type"
        options={DEPLOYMENT_TYPE_OPTIONS}
        selected={draft.deploymentTypes}
        onChange={(v) => setGroup("deploymentTypes", v)}
      />
      <MultiSelect
        label="Top categories"
        options={CATEGORY_OPTIONS}
        selected={draft.categories}
        onChange={(v) => setGroup("categories", v)}
      />
    </Drawer>
  );
}
