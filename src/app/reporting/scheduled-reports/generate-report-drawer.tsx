// "Generate Report" drawer — opened from the Templates preview. Collects the
// one-off run's name, scope (organization / sites / clients / users) and date
// range, then hands off to the (prototype) generate action.

import { Box, Divider, FormLabel, MenuItem } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import type { DateRange } from "@mui/x-date-pickers-pro/models";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";

import {
  TIME_RANGE_OPTIONS,
  type TimeRangeKey,
} from "@/app/dashboards/dashboard-filters";
import { ArrowTooltip } from "@/components/arrow-tooltip";
import { Drawer } from "@/components/drawer";
import { SearchableMultiSelect } from "@/components/searchable-multi-select";
import { Select } from "@/components/select";
import { TextField } from "@/components/text-field";

const ORGANIZATIONS = [
  "Acme Manufacturing",
  "Globex Financial",
  "Initech Software",
  "Umbrella Health",
];
const SITES = [
  "Headquarters",
  "Austin Office",
  "Berlin Hub",
  "Boston Lab",
  "Chicago HQ",
  "London Branch",
];
const ROAMING_CLIENTS = [
  "z-ktrojanowski",
  "YOGA-BSMITH",
  "px-home",
  "LOWES-MACBOOK-07",
  "LOWES-SURFACE-09",
];
const USERS = ["Kaya Trojanowski", "Bob Smith", "Priya Xu", "Dana Lowe"];

const NEEDS_ORG = "Select an Organization to enable this filter.";

// Label with the required asterisk, matching the rest of the app's forms.
function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel sx={{ display: "block", mb: 0.5 }}>
      {children}
      <Box component="span" sx={{ ml: 0.25 }}>
        *
      </Box>
    </FormLabel>
  );
}

// e.g. "e.g. August Activity Snapshot" — follows whatever month it is today.
const monthPlaceholder = () =>
  `e.g. ${new Date().toLocaleString(undefined, { month: "long" })} Activity Snapshot`;

// Wraps a scope filter so a disabled one still shows the "pick an org" hint
// (disabled controls don't fire hover events themselves).
function ScopeFilter({
  disabled,
  children,
}: {
  disabled: boolean;
  children: React.ReactElement;
}) {
  return (
    <ArrowTooltip title={disabled ? NEEDS_ORG : ""}>
      <Box
        component="span"
        sx={{ display: "block", cursor: disabled ? "not-allowed" : undefined }}
      >
        {children}
      </Box>
    </ArrowTooltip>
  );
}

export function GenerateReportDrawer({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  /** Fired when the run is kicked off (the drawer closes itself first). */
  onGenerate: () => void;
}) {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [sites, setSites] = useState<string[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("24h");
  const [dateRange, setDateRange] = useState<DateRange<Date>>([null, null]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Re-seed each time the drawer opens (adjust-state-during-render rather than
  // an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName("");
      setOrganization("");
      setSites([]);
      setClients([]);
      setUsers([]);
      setTimeRange("24h");
      setDateRange([null, null]);
    }
  }

  const canGenerate = name.trim() !== "" && organization !== "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Generate Report"
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: "Generate",
        onClick: () => {
          onClose();
          onGenerate();
        },
        disabled: !canGenerate,
        tooltip: canGenerate ? "" : "Add a report name and organization first.",
      }}
    >
      <Box>
        <RequiredLabel>Report name</RequiredLabel>
        <TextField
          fullWidth
          autoFocus
          placeholder={monthPlaceholder()}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Box>

      <Box>
        <RequiredLabel>Organization</RequiredLabel>
        <Select
          fullWidth
          displayEmpty
          value={organization}
          onChange={(e) => {
            setOrganization(e.target.value);
            // The scope filters list that org's resources — start them over.
            setSites([]);
            setClients([]);
            setUsers([]);
          }}
          renderValue={(v) =>
            v ? (
              v
            ) : (
              <Box component="span" sx={{ color: "text.disabled" }}>
                Select organization
              </Box>
            )
          }
        >
          {ORGANIZATIONS.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Scope filters only make sense once an organization is picked. */}
      <ScopeFilter disabled={!organization}>
        <SearchableMultiSelect
          label="Sites"
          options={SITES}
          selected={sites}
          onChange={setSites}
          disabled={!organization}
        />
      </ScopeFilter>
      <ScopeFilter disabled={!organization}>
        <SearchableMultiSelect
          label="Roaming Clients"
          options={ROAMING_CLIENTS}
          selected={clients}
          onChange={setClients}
          disabled={!organization}
        />
      </ScopeFilter>
      <ScopeFilter disabled={!organization}>
        <SearchableMultiSelect
          label="Users"
          options={USERS}
          selected={users}
          onChange={setUsers}
          disabled={!organization}
        />
      </ScopeFilter>

      <Box>
        <FormLabel sx={{ display: "block", mb: 0.5 }}>
          Reporting Period
        </FormLabel>
        {timeRange === "custom" ? (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              value={dateRange}
              onChange={(v) => setDateRange(v)}
              open={pickerOpen}
              onOpen={() => setPickerOpen(true)}
              onClose={() => {
                setPickerOpen(false);
                // An incomplete range is never valid — fall back to the default.
                if (!dateRange[0] || !dateRange[1]) {
                  setDateRange([null, null]);
                  setTimeRange("24h");
                }
              }}
              calendars={2}
              minDate={startOfDay(subDays(new Date(), 90))}
              maxDate={endOfDay(new Date())}
              closeOnSelect={false}
              disableOpenPicker
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
            fullWidth
            value={timeRange}
            onChange={(e) => {
              const next = e.target.value as TimeRangeKey;
              if (next === "custom") setPickerOpen(true);
              setTimeRange(next);
            }}
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
      </Box>
    </Drawer>
  );
}
