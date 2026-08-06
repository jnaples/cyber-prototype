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
  InputAdornment,
  ListItemText,
  ListSubheader,
  MenuItem,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import type { DateRange } from "@mui/x-date-pickers-pro/models";
import { usePickerActionsContext } from "@mui/x-date-pickers/hooks";
import type { PickersActionBarProps } from "@mui/x-date-pickers/PickersActionBar";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";

import { Drawer } from "@/components/drawer";
import { Select } from "@/components/select";
import { TextField } from "@/components/text-field";

import {
  CONTENT_CATEGORY_OPTIONS,
  ORGANIZATION_OPTIONS,
  POLICY_OPTIONS,
  RESULT_OPTIONS,
  ROAMING_RELAY_OPTIONS,
  SITE_OPTIONS,
  THREAT_CATEGORY_OPTIONS,
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

// Sentinel row value for the "Select all" item (same trick as Query Logs).
const SELECT_ALL_VALUE = "__select_all__";

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  searchable = true,
  allLabel,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  /** The Query Logs treatment: search box + Select all + rule. On by default. */
  searchable?: boolean;
  /** Empty-state text; defaults to "All {label}". Set it where the label is
   *  singular and wouldn't read right (e.g. Result -> "All Results"). */
  allLabel?: string;
}) {
  const [search, setSearch] = useState("");
  const allSelected = options.length > 0 && selected.length === options.length;
  const someSelected = selected.length > 0 && !allSelected;
  const visibleOptions = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const next = typeof value === "string" ? value.split(",") : value;
    if (next.includes(SELECT_ALL_VALUE)) {
      onChange(allSelected ? [] : [...options]);
      return;
    }
    onChange(next);
  };

  return (
    <FormControl fullWidth size="small">
      <FormLabel>{label}</FormLabel>
      <Select
        multiple
        displayEmpty
        value={selected}
        onChange={handleChange}
        onClose={() => setSearch("")}
        MenuProps={{
          autoFocus: !searchable,
          slotProps: { paper: { sx: { maxHeight: 400 } } },
        }}
        renderValue={(sel) =>
          sel.length === 0 || allSelected ? (
            <Typography
              component="span"
              variant="body1"
              sx={{ color: "text.secondary" }}
            >
              {allLabel ?? `All ${label}`}
            </Typography>
          ) : (
            sel.join(", ")
          )
        }
      >
        {searchable && (
          <ListSubheader sx={{ px: 2, py: 1 }}>
            <TextField
              size="small"
              autoFocus
              fullWidth
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Escape") e.stopPropagation();
              }}
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
          </ListSubheader>
        )}
        {searchable && (
          <MenuItem value={SELECT_ALL_VALUE}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              sx={{ p: 0.5, mr: 1 }}
            />
            <ListItemText primary="Select all" />
          </MenuItem>
        )}
        {searchable && <Divider />}
        {visibleOptions.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox
              size="small"
              checked={selected.includes(option)}
              sx={{ p: 0.5, mr: 1 }}
            />
            <ListItemText primary={option} />
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
        <MultiSelect
          label="Organizations"
          options={ORGANIZATION_OPTIONS}
          selected={draft.organizations}
          onChange={(v) => setGroup("organizations", v)}
        />
        <MultiSelect
          label="Sites"
          options={SITE_OPTIONS}
          selected={draft.sites}
          onChange={(v) => setGroup("sites", v)}
        />
        <MultiSelect
          label="Roaming Clients / Relays"
          options={ROAMING_RELAY_OPTIONS}
          selected={draft.roamingRelays}
          onChange={(v) => setGroup("roamingRelays", v)}
        />
        <MultiSelect
          label="Users"
          options={USER_OPTIONS}
          selected={draft.users}
          onChange={(v) => setGroup("users", v)}
        />
      </FilterGroup>

      <Divider />

      <FilterGroup title="Traffic">
        <MultiSelect
          label="Result"
          options={RESULT_OPTIONS}
          selected={draft.results}
          onChange={(v) => setGroup("results", v)}
          allLabel="All Results"
          // Only ever three options — no need for search / Select all.
          searchable={false}
        />
        <MultiSelect
          label="Policy"
          options={POLICY_OPTIONS}
          selected={draft.policies}
          onChange={(v) => setGroup("policies", v)}
          allLabel="All Policies"
        />
        <MultiSelect
          label="Content Categories"
          options={CONTENT_CATEGORY_OPTIONS}
          selected={draft.categories}
          onChange={(v) => setGroup("categories", v)}
        />
        <MultiSelect
          label="Threat Categories"
          options={THREAT_CATEGORY_OPTIONS}
          selected={draft.threatCategories}
          onChange={(v) => setGroup("threatCategories", v)}
        />
      </FilterGroup>
    </Drawer>
  );
}
