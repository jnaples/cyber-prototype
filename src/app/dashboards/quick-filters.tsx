// Quick Filters drawer: a time-range dropdown plus multi-select dropdowns
// (checkboxes inside) for the other dimensions. Selections stage in a draft
// and commit to the page on Apply.

import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import type { DateRange } from "@mui/x-date-pickers-pro/models";
import { usePickerActionsContext } from "@mui/x-date-pickers/hooks";
import type { PickersActionBarProps } from "@mui/x-date-pickers/PickersActionBar";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { SearchableMultiSelect } from "@/components/searchable-multi-select";
import { Select } from "@/components/select";

import {
  ORGANIZATION_OPTIONS,
  RESULT_OPTIONS,
  ROAMING_RELAY_OPTIONS,
  SITE_OPTIONS,
  TIME_RANGE_OPTIONS,
  USER_OPTIONS,
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

// A labeled section of the drawer (overline heading + its controls).
function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography
        variant="overline"
        sx={{ display: "block", color: "text.secondary", lineHeight: 1.5 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

// Checkbox-group keys (everything except the single-select time range).
type GroupKey =
  | "organizations"
  | "results"
  | "policies"
  | "sites"
  | "roamingRelays"
  | "users"
  | "categories"
  | "threatCategories";

export function QuickFilters({
  open,
  onClose,
  filters,
  onApply,
  hideTimeRange = false,
}: {
  open: boolean;
  onClose: () => void;
  filters: DashboardFilters;
  onApply: (next: DashboardFilters) => void;
  /** Hide the Time range control (e.g. when it lives in the page toolbar). */
  hideTimeRange?: boolean;
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
      title="Filters"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{ label: "Apply", onClick: handleApply }}
    >
      {!hideTimeRange && (
        <>
          <FilterGroup title="Time">
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
                    option.value === "custom" ? (
                      [
                        <Divider key="custom-divider" />,
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>,
                      ]
                    ) : (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ),
                  )}
                </Select>
              )}
            </FormControl>
          </FilterGroup>
          <Divider />
        </>
      )}

      <FilterGroup title="Source">
        <SearchableMultiSelect
          label="Organizations"
          options={ORGANIZATION_OPTIONS}
          selected={draft.organizations}
          onChange={(v) => setGroup("organizations", v)}
        />
        <SearchableMultiSelect
          label="Sites"
          options={SITE_OPTIONS}
          selected={draft.sites}
          onChange={(v) => setGroup("sites", v)}
        />
        <SearchableMultiSelect
          label="Roaming Clients / Relays"
          options={ROAMING_RELAY_OPTIONS}
          selected={draft.roamingRelays}
          onChange={(v) => setGroup("roamingRelays", v)}
        />
        <SearchableMultiSelect
          label="Users"
          options={USER_OPTIONS}
          selected={draft.users}
          onChange={(v) => setGroup("users", v)}
        />
      </FilterGroup>

      <Divider />

      <FilterGroup title="Traffic">
        <SearchableMultiSelect
          label="Result"
          options={RESULT_OPTIONS}
          selected={draft.results}
          onChange={(v) => setGroup("results", v)}
          allLabel="All Results"
          // Only ever three options — no need for search / Select all.
          searchable={false}
        />
      </FilterGroup>
    </Drawer>
  );
}
