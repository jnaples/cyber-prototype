// "Generate Report" drawer — opened from the Templates preview. Collects the
// one-off run's scope (organization / sites / clients / users) and date
// range, then hands off to the (prototype) generate action.

import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Divider,
  FormLabel,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Typography,
} from "@mui/material";
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
import { MSP_ORGANIZATIONS } from "@/data/organizations";

import { ROAMING_CLIENTS, SITES, USERS } from "./scope-options";

// Every client organization, as the org switcher and the scheduler list them.
const ORGANIZATIONS = MSP_ORGANIZATIONS;

// The hint names the filter it's blocking, e.g. "…for specific Sites."
const needsOrg = (label: string) =>
  `Select an Organization for specific ${label}.`;

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

// Wraps a scope filter so a disabled one still shows the "pick an org" hint
// (disabled controls don't fire hover events themselves).
function ScopeFilter({
  disabled,
  label,
  children,
}: {
  disabled: boolean;
  /** The filter's own label, so the hint can name it. */
  label: string;
  children: React.ReactElement;
}) {
  return (
    <ArrowTooltip title={disabled ? needsOrg(label) : ""}>
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
  reportTitle,
}: {
  open: boolean;
  onClose: () => void;
  /** Fired when the run is kicked off (the drawer closes itself first). */
  onGenerate: () => void;
  /** The report being run — named under the title, as the DoH drawer names
   *  its deployment. */
  reportTitle?: string;
}) {
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
      setOrganization("");
      setSites([]);
      setClients([]);
      setUsers([]);
      setTimeRange("24h");
      setDateRange([null, null]);
    }
  }

  const canGenerate = organization !== "";
  const hasRange = Boolean(dateRange[0] && dateRange[1]);
  // Clearing the range drops back to the default, where an incomplete range
  // lands too.
  const clearRange = () => {
    setDateRange([null, null]);
    setTimeRange("24h");
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Run Report"
      subheader={reportTitle}
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      primaryAction={{
        label: "Run Now",
        onClick: () => {
          onClose();
          onGenerate();
        },
        disabled: !canGenerate,
        tooltip: canGenerate ? "" : "Select an organization first.",
      }}
    >
      {/* The run picks up whatever branding is configured, so the settings are
          one click away rather than a surprise on the finished report. */}
      <Box>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          Reports use branding from Branding settings.
        </Typography>
        <Typography variant="body2" component="div">
          <Link
            href="/msp/branding"
            target="_blank"
            rel="noopener"
            underline="hover"
            sx={{ fontWeight: 700 }}
          >
            View Branding
          </Link>
        </Typography>
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
      <ScopeFilter disabled={!organization} label="Sites">
        <SearchableMultiSelect
          label="Sites"
          options={SITES}
          selected={sites}
          onChange={setSites}
          disabled={!organization}
        />
      </ScopeFilter>
      <ScopeFilter disabled={!organization} label="Roaming Clients">
        <SearchableMultiSelect
          label="Roaming Clients"
          options={ROAMING_CLIENTS}
          selected={clients}
          onChange={setClients}
          disabled={!organization}
        />
      </ScopeFilter>
      <ScopeFilter disabled={!organization} label="Users">
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
                  // The picker's own `clearable` is suppressed on a read-only
                  // field, so the ✕ is hand-rolled here to match the app's
                  // Select: hidden until the field is hovered or focused.
                  slotProps: {
                    input: {
                      endAdornment: hasRange ? (
                        <InputAdornment
                          position="end"
                          className="range-clear"
                          sx={{ visibility: "hidden", ml: 0 }}
                        >
                          <IconButton
                            size="small"
                            aria-label="Clear"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              clearRange();
                            }}
                            sx={{ color: "text.disabled", p: 0.25 }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    },
                  },
                  sx: {
                    cursor: "pointer",
                    "&:hover .range-clear, &:focus-within .range-clear": {
                      visibility: "visible",
                    },
                  },
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
