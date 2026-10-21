// Audit Logs — who changed what, and when.
//
// The filter bar follows Query Logs: unlabelled selectors in the page header,
// a window, then Apply. Which columns the grid shows depends on the audit log
// type, since a policy change and a subscription change describe different
// things; the Changes column carries the before and after of each field.

import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { GridColDef } from "@mui/x-data-grid";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { DataTable } from "@/components/data-table";
import { DateTimeRangePicker } from "@/components/date-time-range-picker";
import type {
  DateTimeRangePickerShortcut,
  DateTimeRangePickerValue,
} from "@/components/date-time-range-picker";
import { EmptyState } from "@/components/empty-state";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { Select } from "@/components/select";
import { TabbedDataCard } from "@/components/tabbed-data-card";

import {
  AUDIT_ROWS,
  COLUMNS_BY_TYPE,
  EVENTS_BY_TYPE,
  LOG_TYPES,
  ORGANIZATIONS,
  PEOPLE,
  type AuditRow,
  type Change,
} from "./data";

/** The presets beside the calendars, in the order the app lists them. */
const SHORTCUTS: DateTimeRangePickerShortcut[] = [
  {
    label: "Today",
    getValue: () => [startOfDay(new Date()), endOfDay(new Date())],
  },
  {
    label: "Yesterday",
    getValue: () => {
      const day = subDays(new Date(), 1);
      return [startOfDay(day), endOfDay(day)];
    },
  },
  {
    label: "This Week",
    getValue: () => [startOfWeek(new Date()), endOfDay(new Date())],
  },
  {
    label: "Last Week",
    getValue: () => {
      const week = subWeeks(new Date(), 1);
      return [startOfWeek(week), endOfWeek(week)];
    },
  },
  {
    label: "This Month",
    getValue: () => [startOfMonth(new Date()), endOfDay(new Date())],
  },
  {
    label: "Last Month",
    getValue: () => {
      const month = subMonths(new Date(), 1);
      return [startOfMonth(month), endOfMonth(month)];
    },
  },
  {
    label: "Last 30 days",
    getValue: () => [startOfDay(subDays(new Date(), 29)), endOfDay(new Date())],
  },
  {
    label: "Last 90 days",
    getValue: () => [startOfDay(subDays(new Date(), 89)), endOfDay(new Date())],
  },
];

/** The window the filters open on. */
const DEFAULT_RANGE: DateTimeRangePickerValue = [
  startOfDay(subDays(new Date(), 89)),
  endOfDay(new Date()),
];

/** Why a filter is disabled before an organization is chosen. */
const ORG_FIRST = "Select an Organization first.";

/** What an unset filter reads as — the muted treatment Query Logs uses. */
const placeholder = (text: string) => (
  <Box component="span" sx={{ color: "text.disabled" }}>
    {text}
  </Box>
);

/** A filter in the bar. Like Query Logs, the field states what it is in its
 *  own resting value rather than carrying a label. */
function Field({ children }: { children: React.ReactNode }) {
  return (
    <FormControl size="small" fullWidth>
      {children}
    </FormControl>
  );
}

const stamp = (iso: string) =>
  new Date(iso)
    .toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    })
    .toLowerCase()
    .replace(",", "");

/** The before and after of each field a change touched, two to a row. */
function ChangesCell({ changes }: { changes: Change[] }) {
  return (
    <Box
      sx={{
        width: "100%",
        py: 1,
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        columnGap: 2,
        rowGap: 1.5,
      }}
    >
      {changes.map((change) => (
        <Box key={change.label}>
          <Typography
            variant="overline"
            sx={{ display: "block", lineHeight: 1.4, color: "text.secondary" }}
          >
            {change.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color:
                change.value === "None" ? "text.secondary" : "text.primary",
              fontStyle: change.value === "None" ? "italic" : "normal",
              wordBreak: "break-word",
            }}
          >
            {change.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function AuditLogsPage() {
  // Everything below the organization waits for one to be chosen.
  const [organization, setOrganization] = useState("");
  const [logType, setLogType] = useState("");
  const [event, setEvent] = useState("");
  const [performedBy, setPerformedBy] = useState<string[]>([]);
  const [range, setRange] = useState<DateTimeRangePickerValue>(DEFAULT_RANGE);
  // Nothing is fetched until Apply, so the grid opens empty.
  const [applied, setApplied] = useState<string | null>(null);

  const events = logType ? (EVENTS_BY_TYPE[logType] ?? []) : [];
  const rows = applied
    ? AUDIT_ROWS.filter(
        (row) =>
          row.type === applied &&
          (performedBy.length === 0 || performedBy.includes(row.performedBy)) &&
          (!event || row.event === event),
      )
    : [];

  const clear = () => {
    setOrganization("");
    setLogType("");
    setEvent("");
    setPerformedBy([]);
    setApplied(null);
  };

  // The middle columns depend on what's being audited.
  const columns: GridColDef[] = [
    {
      field: "time",
      headerName: "Time (America/New_York)",
      width: 220,
      valueFormatter: (value: string) => stamp(value),
    },
    { field: "performedBy", headerName: "Performed By", width: 180 },
    {
      field: "event",
      headerName: "Event",
      width: 140,
      renderCell: (params) => (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          <Chip
            size="small"
            label={params.value as string}
            sx={(theme: Theme) => ({
              borderRadius: "6px",
              bgcolor: theme.vars.palette.Alert.infoStandardBg,
              color: theme.vars.palette.Alert.infoColor,
              "& .MuiChip-label": { color: "inherit" },
            })}
          />
        </Box>
      ),
    },
    ...(applied ? (COLUMNS_BY_TYPE[applied] ?? []) : []).map((column) => ({
      field: column.field,
      headerName: column.headerName,
      width: 200,
      valueFormatter: (value: string) => value || "—",
    })),
    {
      field: "changes",
      headerName: "Changes",
      flex: 1,
      minWidth: 420,
      sortable: false,
      renderCell: (params) => (
        <ChangesCell changes={(params.row as AuditRow).changes} />
      ),
    },
  ];

  return (
    <PageShell
      fill
      header={
        <PageHeader title="Audit Logs">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              <Field>
                <Select
                  displayEmpty
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value as string)}
                  renderValue={(selected) =>
                    (selected as string) || placeholder("Select Organization")
                  }
                >
                  {ORGANIZATIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Field>

              <Field>
                <Select
                  displayEmpty
                  value={logType}
                  onChange={(e) => {
                    setLogType(e.target.value as string);
                    setEvent("");
                  }}
                  renderValue={(selected) =>
                    (selected as string) || placeholder("Select Audit Log Type")
                  }
                >
                  {LOG_TYPES.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Field>

              {/* The shared range picker: a rail of presets beside two
                  months, the way CyberSight picks its window. */}
              <DateTimeRangePicker
                shortcuts={SHORTCUTS}
                value={range}
                onChange={setRange}
              />

              {/* MUI drops pointer events on a disabled control, so the
                  tooltip wraps it rather than sitting on it. */}
              <ArrowTooltip
                title={logType ? "" : "Select an audit log type first."}
              >
                <Box sx={{ width: "100%" }}>
                  <Field>
                    <Select
                      displayEmpty
                      disabled={!logType}
                      value={event}
                      onChange={(e) => setEvent(e.target.value as string)}
                      renderValue={(selected) =>
                        (selected as string) || placeholder("All Events")
                      }
                    >
                      {events.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </Field>
                </Box>
              </ArrowTooltip>

              {/* Several people at once, each shown as a chip that can be
                  taken off again. */}
              <ArrowTooltip title={organization ? "" : ORG_FIRST}>
                <Box sx={{ width: "100%" }}>
                  <Field>
                    <Select
                      multiple
                      displayEmpty
                      disabled={!organization}
                      value={performedBy}
                      onChange={(e) =>
                        setPerformedBy(
                          typeof e.target.value === "string"
                            ? e.target.value.split(",")
                            : (e.target.value as string[]),
                        )
                      }
                      renderValue={(selected) => {
                        const people = selected as string[];
                        if (people.length === 0)
                          return placeholder("All Users");
                        return (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {people.map((person) => (
                              <Chip
                                key={person}
                                size="small"
                                label={person}
                                onMouseDown={(mouse) => mouse.stopPropagation()}
                                onDelete={() =>
                                  setPerformedBy((was) =>
                                    was.filter((name) => name !== person),
                                  )
                                }
                              />
                            ))}
                          </Box>
                        );
                      }}
                    >
                      {PEOPLE.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Checkbox
                            size="small"
                            checked={performedBy.includes(option)}
                            sx={{ p: 0.5, mr: 1 }}
                          />
                          <ListItemText primary={option} />
                        </MenuItem>
                      ))}
                    </Select>
                  </Field>
                </Box>
              </ArrowTooltip>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                size="small"
                disabled={!organization || !logType}
                onClick={() => setApplied(logType)}
              >
                Apply
              </Button>
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={clear}
                startIcon={<MaterialSymbol name="close" size={16} />}
              >
                Clear
              </Button>
            </Box>
          </Box>
        </PageHeader>
      }
    >
      <TabbedDataCard fill>
        <DataTable
          rows={rows}
          columns={columns}
          fillHeight
          checkboxSelection={false}
          showFilters={false}
          showDefaultView={false}
          initialPageSize={50}
          // A change can touch half a dozen fields, so rows take the height
          // their Changes cell needs.
          getRowHeight={() => "auto"}
          noRowsOverlay={() => (
            <EmptyState
              title="No audit entries yet"
              description="Choose an audit log type and apply the filters to see what changed."
            />
          )}
        />
      </TabbedDataCard>
    </PageShell>
  );
}
