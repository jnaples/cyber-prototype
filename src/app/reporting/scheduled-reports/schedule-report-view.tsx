// "Schedule Report" builder — opened from the Report Manager "Schedule
// Report" action. Two-column layout: a stepped form on the left (reports,
// organizations, recipients, schedule, branding) and a live Email / PDF-cover
// preview on the right. Header carries the Cancel / Create schedule actions.

import {
  alpha,
  Autocomplete,
  Box,
  Divider,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import type { DateRange } from "@mui/x-date-pickers-pro/models";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { useEffect, useRef, useState } from "react";

import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { useOrgScope } from "@/hooks/use-org-scope";
import { Drawer } from "@/components/drawer";
import { MaterialSymbol } from "@/components/material-symbol";
import { SearchableMultiSelect } from "@/components/searchable-multi-select";
import { ROAMING_CLIENTS, SITES, USERS } from "./scope-options";
import { SearchableSelect } from "@/components/searchable-select";
import { Select } from "@/components/select";
import { TextField } from "@/components/text-field";
import { MSP_ORGANIZATIONS } from "@/data/organizations";

import type { ScheduleEditState } from "./schedule-edit-state";
import { REPORTS } from "./reports";
import { SampleReportsModal } from "./sample-reports-modal";
import { cyberSightLocked } from "./entitlements";
import type { NewSchedule } from "./created-schedules";

const PORTAL_USERS = [
  {
    name: "Dana Mori",
    email: "dana.mori@acmemfg.com",
    org: "Acme Retail Group",
  },
  {
    name: "Priya Natarajan",
    email: "priya.n@acmemfg.com",
    org: "Acme Retail Group",
  },
  {
    name: "Tom Villanueva",
    email: "tom.v@globexfin.com",
    org: "Summit Financial Advisors",
  },
  {
    name: "Kim Doyle",
    email: "kim.doyle@globexfin.com",
    org: "Summit Financial Advisors",
  },
  {
    name: "Sofia Reyes",
    email: "s.reyes@initech.io",
    org: "Lakeside Law Group",
  },
  {
    name: "Marcus Bell",
    email: "marcus.b@initech.io",
    org: "Lakeside Law Group",
  },
  {
    name: "Elena Duarte",
    email: "e.duarte@riversidedental.com",
    org: "Riverside Dental Group",
  },
  {
    name: "Nathan Cole",
    email: "n.cole@riversidedental.com",
    org: "Riverside Dental Group",
  },
  {
    name: "Marcus Hall",
    email: "m.hall@coastalpm.com",
    org: "Coastal Property Mgmt",
  },
  {
    name: "Yuki Tanaka",
    email: "y.tanaka@coastalpm.com",
    org: "Coastal Property Mgmt",
  },
  {
    name: "Renee Alvarez",
    email: "r.alvarez@coastalpm.com",
    org: "Coastal Property Mgmt",
  },
  {
    name: "Grace Kim",
    email: "g.kim@brightfuturepeds.com",
    org: "Bright Future Pediatrics",
  },
  {
    name: "Omar Haddad",
    email: "o.haddad@brightfuturepeds.com",
    org: "Bright Future Pediatrics",
  },
  {
    name: "Derek Salas",
    email: "d.salas@vanguardauto.com",
    org: "Vanguard Auto Repair",
  },
  {
    name: "Bianca Rossi",
    email: "b.rossi@northwindtraders.com",
    org: "Northwind Traders",
  },
  {
    name: "Peter Osei",
    email: "p.osei@northwindtraders.com",
    org: "Northwind Traders",
  },
  {
    name: "Hannah Vogel",
    email: "h.vogel@northwindtraders.com",
    org: "Northwind Traders",
  },
  // The MSP's own staff — they work across every organization, so they carry
  // no single one.
  { name: "Joe Naples", email: "joe.naples@mspdash.com" },
  { name: "Alicia Braun", email: "alicia.braun@mspdash.com" },
  { name: "Devon Okafor", email: "devon.okafor@mspdash.com" },
  { name: "Rina Patel", email: "rina.patel@mspdash.com" },
  { name: "Sam Whitfield", email: "sam.whitfield@mspdash.com" },
];

// Recipients are listed under the organization they belong to; anyone who
// isn't tied to one reaches more than one, so they group together.
const orgOfRecipient = (email: string) =>
  PORTAL_USERS.find((u) => u.email === email)?.org ||
  "Multi-Organization Access";

// The client organizations the rest of the app lists — these were sites, which
// is a different thing entirely.
const ORGS = MSP_ORGANIZATIONS;

// A custom report is built to order in the Custom Report builder, so there's
// nothing here to put on a schedule.
const SCHEDULABLE_REPORTS = REPORTS.filter(
  (r) => r.key !== "custom" && r.key !== "traffic",
);

// The report list reads product by product — Filtering first, then CyberSight
// — with the titles alphabetical inside each.
const PRODUCT_ORDER = ["Filtering", "CyberSight"];

const productOfReport = (title: string) =>
  SCHEDULABLE_REPORTS.find((r) => r.title === title)?.products?.[0] ?? "Other";

const REPORT_TITLES_BY_PRODUCT = SCHEDULABLE_REPORTS.map((r) => r.title).sort(
  (a, b) => {
    const rank = (title: string) => {
      const index = PRODUCT_ORDER.indexOf(productOfReport(title));
      return index === -1 ? PRODUCT_ORDER.length : index;
    };
    return rank(a) - rank(b) || a.localeCompare(b);
  },
);

// v3 only: whether the report is scheduled or run once.
type Delivery = "scheduled" | "one-time";

// Reporting periods for a one-time run, grouped by span so the list reads in
// steps: days, weeks, months, then rolling windows. Custom sits below a rule.
const REPORTING_PERIOD_GROUPS: string[][] = [
  ["Today", "Yesterday"],
  ["This Week", "Last Week"],
  ["This Month", "Last Month"],
  ["Last 30 days", "Last 90 days"],
];

const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly"] as const;

// The zones an MSP schedules against — US business zones first, then the
// international ones their clients sit in.
// A weekly schedule picks its days; the labels are the short forms the
// product asked for (Thursday reads "Tr", Sunday "Sn").
const WEEK_DAYS = [
  { value: "Mon", label: "M", name: "Monday" },
  { value: "Tue", label: "T", name: "Tuesday" },
  { value: "Wed", label: "W", name: "Wednesday" },
  { value: "Thu", label: "Tr", name: "Thursday" },
  { value: "Fri", label: "F", name: "Friday" },
  { value: "Sat", label: "S", name: "Saturday" },
  { value: "Sun", label: "Sn", name: "Sunday" },
];

// Step 4 (white-label branding) is parked while branding lives in MSP >
// Branding. Flip to true to bring the step back.
const SHOW_BRANDING_STEP = false;

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Section wrapper — overline "STEP n — TITLE" then content.
function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ display: "block", color: "text.secondary" }}
      >
        Step {n} - {title}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  );
}

// Only days every month has, so a monthly schedule always has a date to land
// on.
const MONTH_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

// 1 -> "1st", 22 -> "22nd". The teens are all "th".
const ordinal = (n: number) => {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? "th" : { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th";
  return `${n}${suffix}`;
};

export function ScheduleReportView({
  onCancel,
  onSave,
  edit,
  isEdit = Boolean(edit),
  autoFocusName = false,
  initialReports,
  variant = "drawer",
  open = true,
  deliveryChoice = true,
  showReportType,
  primaryLabel,
  drawerTitle,
  initialDelivery,
}: {
  onCancel: () => void;
  /** Receives the finished schedule and which mode produced it — a one-time
   *  run isn't saved, it just starts generating. */
  onSave: (schedule: NewSchedule, mode: "scheduled" | "one-time") => void;
  /** Seeds the form from an existing schedule. */
  edit?: ScheduleEditState;
  /** Editing an existing schedule rather than creating one. A clone seeds from
   *  `edit` but is still a create. Defaults to whether `edit` was given. */
  isEdit?: boolean;
  /** Put the cursor in Schedule name on open — a clone lands there to rename. */
  autoFocusName?: boolean;
  /** Report keys to preselect — set when opened from a Library preview. */
  initialReports?: string[];
  /** "drawer" is v2's simplified flow; "drawer-v3" is a second variation,
   *  free to diverge from it. */
  variant?: "drawer" | "drawer-v3";
  /** Drawer variant only: whether the drawer is open. */
  open?: boolean;
  /** Show the Report type selector. Off in v3's card drawers, where the
   *  subheader already names the report the card carried in. */
  showReportType?: boolean;
  /** Overrides the primary action's label. */
  primaryLabel?: string;
  /** Overrides the drawer's title. */
  drawerTitle?: string;
  /** Which mode a drawer opens in when it isn't offering the choice. */
  initialDelivery?: Delivery;
  /** v3 only: offer the Scheduled / One-Time choice. Off when the caller has
   *  already said which it wants — Schedule Report opens straight into the
   *  schedule form. */
  deliveryChoice?: boolean;
}) {
  // Editing seeds every step the grid row can account for; otherwise nothing is
  // chosen unless a Library preview sent a report along. Branding stays default.
  const [selectedReports, setSelectedReports] = useState<string[]>(
    edit?.reports ?? initialReports ?? [],
  );
  // Drilled into one organization from the header? The report is for that one,
  // so the form opens on it.
  const { organization: scopedOrg } = useOrgScope();

  const [scheduleName, setScheduleName] = useState(edit?.scheduleName ?? "");
  // Cloning opens on a copy that needs renaming, so the cursor waits there.
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!autoFocusName) return;
    const id = window.setTimeout(() => nameRef.current?.select(), 0);
    return () => window.clearTimeout(id);
  }, [autoFocusName]);
  const [selectedOrg, setSelectedOrg] = useState(
    edit?.organization ?? scopedOrg ?? "",
  );
  const [portalUsers, setPortalUsers] = useState<string[]>(
    edit?.portalUsers ?? [],
  );
  const [externalEmail, setExternalEmail] = useState("");
  const [externalEmails, setExternalEmails] = useState<string[]>(
    edit?.externalEmails ?? [],
  );
  const [emailError, setEmailError] = useState("");
  // v3 only: a report is either put on a schedule or run once.
  // A one-off run is the common case, so the drawer opens on it.
  // A one-off run is the common case, so the drawer opens on it — unless the
  // caller asked for a schedule outright.
  const [delivery, setDelivery] = useState<Delivery>(
    initialDelivery ?? (deliveryChoice ? "one-time" : "scheduled"),
  );
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [dateRange, setDateRange] = useState<DateRange<Date>>([null, null]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [scopeSites, setScopeSites] = useState<string[]>([]);
  const [scopeClients, setScopeClients] = useState<string[]>([]);
  const [scopeUsers, setScopeUsers] = useState<string[]>([]);
  const [showRecipients, setShowRecipients] = useState(false);
  const [showScope, setShowScope] = useState(false);
  // v3's One-Time mode: run the report once instead of scheduling it.
  const oneTime = delivery === "one-time";
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number] | "">(
    (FREQUENCIES as readonly string[]).includes(edit?.frequency ?? "")
      ? (edit?.frequency as (typeof FREQUENCIES)[number])
      : "",
  );
  // Recipients follow the organization: its own people, plus the MSP staff
  // who aren't tied to one. Before an organization is picked, everyone shows.
  const scopedRecipients = PORTAL_USERS.filter(
    (u) => !selectedOrg || !u.org || u.org === selectedOrg,
  ).map((u) => u.email);
  // Switching organizations drops anyone the new one can't reach (adjusting
  // state during render rather than in an effect).
  const [lastOrg, setLastOrg] = useState(selectedOrg);
  if (selectedOrg !== lastOrg) {
    setLastOrg(selectedOrg);
    setPortalUsers((prev) => prev.filter((e) => scopedRecipients.includes(e)));
  }

  const [weekDay, setWeekDay] = useState("Mon");
  // Monthly picks a date; only its day-of-month drives the schedule.
  const [monthDay, setMonthDay] = useState(1);
  const [samplesOpen, setSamplesOpen] = useState(false);
  // Eastern — where most of the MSP's clients run.
  const [whitelabel, setWhitelabel] = useState(true);
  const [companyName, setCompanyName] = useState("Brightwave IT");
  const [replyTo, setReplyTo] = useState("reports@brightwaveit.com");

  const recipientCount = portalUsers.length + externalEmails.length;
  const selectedReportDefs = SCHEDULABLE_REPORTS.filter((r) =>
    selectedReports.includes(r.key),
  );

  // Required to save: a name, a report, an organization and a recipient. An
  // empty subject falls back to the generated one.
  const isComplete = oneTime
    ? selectedReports.length > 0 && selectedOrg !== "" && reportingPeriod !== ""
    : scheduleName.trim() !== "" &&
      selectedReports.length > 0 &&
      selectedOrg !== "" &&
      recipientCount > 0 &&
      frequency !== "";

  // Editing an existing schedule saves only what changed, so the form's
  // current shape is compared against the one it opened with.
  const formState = JSON.stringify({
    scheduleName,
    selectedReports: [...selectedReports].sort(),
    selectedOrg,
    portalUsers: [...portalUsers].sort(),
    externalEmails: [...externalEmails].sort(),
    frequency,
    weekDay,
    monthDay,
    whitelabel,
    companyName,
    replyTo,
  });
  const [openedWith] = useState(formState);
  const isDirty = formState !== openedWith;

  // The report is for one organization; a Filtering-only client can't run the
  // CyberSight reports, so those options explain themselves instead.
  const reportOrg = selectedOrg || scopedOrg;
  const reportLocked = (title: string) =>
    cyberSightLocked(
      reportOrg,
      SCHEDULABLE_REPORTS.find((r) => r.title === title)?.products,
    );

  const canSave = isComplete && (!isEdit || isDirty);
  const saveTooltip = !isComplete
    ? "Please fill out all required fields."
    : isEdit && !isDirty
      ? "No changes to save."
      : "";

  // One-Time mirrors the Run Report drawer: pick a scope and a window, no
  // steps and nothing to name, since the run isn't saved.
  // The branding note, and in v3 the Scheduled / One-Time choice. Sits
  // above whichever body the mode calls for, so switching keeps it in view.
  const brandingBlock = (
    // The note belongs with the title, so they group rather than sitting a
    // full step apart.
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
      {variant === "drawer-v3" && deliveryChoice && (
        // Same toggle treatment as the Library's product filter.
        <ToggleButtonGroup
          exclusive
          size="small"
          value={delivery}
          onChange={(_event, next: Delivery | null) => {
            if (next) setDelivery(next);
          }}
          sx={{
            mt: 1.5,
            "& .MuiToggleButton-root": { py: "4px", px: "12px" },
          }}
        >
          <ToggleButton value="one-time">One-Time</ToggleButton>
          <ToggleButton value="scheduled">Scheduled</ToggleButton>
        </ToggleButtonGroup>
      )}
    </Box>
  );

  // Who the report goes to. Step 2 shows these outright; One-Time keeps
  // them behind an Add recipients link, since both are optional there.
  const recipientFields = (
    <>
      <SearchableMultiSelect
        label="Internal recipients"
        optional={oneTime}
        options={scopedRecipients}
        selected={portalUsers}
        onChange={setPortalUsers}
        // Emailing every portal user isn't a shortcut worth
        // offering — recipients are picked deliberately.
        selectAll={false}
        groupBy={orgOfRecipient}
        allLabel="Select internal recipients"
        chips
      />

      <Box>
        <FormLabel
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 0.5,
          }}
        >
          <Box component="span" sx={{ display: "inline-flex", gap: 0.5 }}>
            External recipients
            <ArrowTooltip title="Send emails to recipients who don't have DNSFilter accounts. Their email addresses must be valid.">
              <Box
                component="span"
                sx={(theme) => ({
                  display: "inline-flex",
                  color: "primary.main",
                  ...theme.applyStyles("dark", {
                    color: theme.vars.palette.primary.light,
                  }),
                })}
              >
                <MaterialSymbol name="info" size={20} />
              </Box>
            </ArrowTooltip>
          </Box>
          {oneTime && (
            <Typography
              component="span"
              variant="body2"
              sx={{ ml: "auto", color: "text.secondary", fontWeight: 400 }}
            >
              Optional
            </Typography>
          )}
        </FormLabel>
        <Autocomplete<string, true, false, true>
          multiple
          freeSolo
          options={[] as string[]}
          value={externalEmails}
          inputValue={externalEmail}
          onInputChange={(_e, v) => {
            setExternalEmail(v);
            if (emailError) setEmailError("");
          }}
          onChange={(_e, values) => {
            const next = (values as string[])
              .map((v) => v.trim())
              .filter(Boolean);
            const invalid = next.find((v) => !isEmail(v));
            if (invalid) {
              setEmailError(`"${invalid}" is not a valid email address.`);
              return;
            }
            setEmailError("");
            setExternalEmails([...new Set(next)]);
          }}
          // Let MUI render the chips so they keep their delete
          // button and tag sizing; just restyle them to match the
          // dashboard's active-filter chips.
          slotProps={{
            chip: {
              size: "small",
              sx: {
                borderRadius: (t) => t.spacing(1),
                "& .MuiChip-deleteIcon": {
                  color: "text.disabled",
                  "&:hover": { color: "text.secondary" },
                },
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              error={Boolean(emailError)}
              helperText={emailError}
              // 14px: the size the app's other helper copy reads at.
              sx={{ "& .MuiFormHelperText-root": { fontSize: 14 } }}
            />
          )}
        />
      </Box>
    </>
  );

  const oneTimeForm = (
    <>
      <SearchableSelect
        label="Organization"
        required
        placeholder="Select organization"
        options={ORGS}
        value={selectedOrg}
        onChange={setSelectedOrg}
      />
      {/* Narrowing below the organization only makes sense once one is set. */}
      <SearchableMultiSelect
        label="Sites"
        optional
        summarize
        options={SITES}
        selected={scopeSites}
        onChange={setScopeSites}
        disabled={selectedOrg === ""}
        disabledTooltip="Select an Organization for specific Sites."
      />
      <SearchableMultiSelect
        label="Roaming Clients"
        optional
        summarize
        options={ROAMING_CLIENTS}
        selected={scopeClients}
        onChange={setScopeClients}
        disabled={selectedOrg === ""}
        disabledTooltip="Select an Organization for specific Roaming Clients."
      />
      <SearchableMultiSelect
        label="Users"
        optional
        summarize
        options={USERS}
        selected={scopeUsers}
        onChange={setScopeUsers}
        disabled={selectedOrg === ""}
        disabledTooltip="Select an Organization for specific Users."
      />
      <Box>
        <FormLabel sx={{ display: "block", mb: 0.5 }}>
          Reporting Period
          <Box component="span" sx={{ ml: 0.25 }}>
            *
          </Box>
        </FormLabel>
        {reportingPeriod === "Custom" ? (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              value={dateRange}
              onChange={(value) => setDateRange(value)}
              open={pickerOpen}
              onOpen={() => setPickerOpen(true)}
              onClose={() => {
                setPickerOpen(false);
                // An incomplete range is no range — fall back to the
                // placeholder rather than leaving half a window set.
                if (!dateRange[0] || !dateRange[1]) {
                  setDateRange([null, null]);
                  setReportingPeriod("");
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
                  // The picker suppresses its own `clearable` on a read-only
                  // field, so the ✕ is hand-rolled to match the app's Select:
                  // hidden until the field is hovered or focused.
                  slotProps: {
                    input: {
                      endAdornment:
                        dateRange[0] && dateRange[1] ? (
                          <InputAdornment
                            position="end"
                            className="range-clear"
                            sx={{ visibility: "hidden", ml: 0 }}
                          >
                            <IconButton
                              size="small"
                              aria-label="Clear"
                              onMouseDown={(event) => event.stopPropagation()}
                              onClick={(event) => {
                                event.stopPropagation();
                                setDateRange([null, null]);
                                setReportingPeriod("");
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
            displayEmpty
            size="small"
            value={reportingPeriod}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "Custom") setPickerOpen(true);
              setReportingPeriod(next);
            }}
            renderValue={(value) =>
              value ? (
                (value as string)
              ) : (
                <Box component="span" sx={{ color: "text.disabled" }}>
                  Select reporting period
                </Box>
              )
            }
          >
            {REPORTING_PERIOD_GROUPS.flatMap((group, i) => [
              ...(i > 0 ? [<Divider key={`period-rule-${i}`} />] : []),
              ...group.map((period) => (
                <MenuItem key={period} value={period}>
                  {period}
                </MenuItem>
              )),
            ])}
            <Divider />
            <MenuItem value="Custom">Custom</MenuItem>
          </Select>
        )}
      </Box>

      {/* Mailing a one-off run is optional, so the fields stay folded away
          until someone asks for them. */}
      {showRecipients ? (
        <>
          {/* A rule sets the recipients apart from the run's own scope. */}
          <Divider sx={{ mt: 1 }} />
          {recipientFields}
        </>
      ) : (
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={() => setShowRecipients(true)}
          sx={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.25,
            fontSize: 14,
          }}
        >
          Share via email
          <ArrowDropDownIcon sx={{ fontSize: 20 }} />
        </Link>
      )}
    </>
  );

  // The stepped form itself. The page wraps it in a card beside the live
  // preview; the drawer variant shows it on its own.
  const form = (
    <>
      {/* STEP 1 — Reports */}
      <Step n={1} title="Report Details">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* A one-time run isn't saved, so it needs no name. */}
          <Box sx={{ display: oneTime ? "none" : "block" }}>
            <FormLabel sx={{ display: "block", mb: 0.5 }}>
              Schedule name
              <Box component="span" sx={{ ml: 0.25 }}>
                *
              </Box>
            </FormLabel>
            <TextField
              fullWidth
              size="small"
              // The drawer takes focus as it opens, so a clone puts the cursor
              // in the name itself once that's done.
              inputRef={nameRef}
              placeholder="e.g. Monthly Timeline"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              helperText="Recipients won't see this name."
              // 14px: the size the app's other helper copy reads at.
              sx={{
                "& .MuiFormHelperText-root": { fontSize: 14 },
              }}
            />
          </Box>
          {/* One dropdown rather than a card per report — the list only
              grows, and the builder shouldn't scroll for it. v3 drops it:
              its drawer already names the report in the subheader. */}
          {showReportType && (
            <Box>
              <SearchableSelect
                label="Report type"
                required
                placeholder="Select report type"
                options={REPORT_TITLES_BY_PRODUCT}
                groupBy={productOfReport}
                optionDisabled={reportLocked}
                renderOptionEnd={(title) =>
                  reportLocked(title) ? (
                    <ArrowTooltip
                      title={
                        <>
                          This organization is not licensed for CyberSight.
                          Upgrade your plan to gain access to this feature.{" "}
                          <Link
                            component="button"
                            type="button"
                            // Billing & Subscriptions, alongside the form the
                            // user was filling in.
                            onClick={() =>
                              window.open(
                                "/subscriptions/manage",
                                "_blank",
                                "noopener",
                              )
                            }
                            underline="always"
                            sx={{
                              fontWeight: 700,
                              color: "inherit",
                              textDecoration: "underline",
                              verticalAlign: "baseline",
                            }}
                          >
                            Upgrade Now
                          </Link>
                        </>
                      }
                    >
                      <Box
                        // An icon-only info chip in the app's blue: a tinted
                        // pill around the upgrade arrow.
                        sx={(theme) => ({
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 0.5,
                          borderRadius: "999px",
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: theme.vars.palette.primary.main,
                          ...theme.applyStyles("dark", {
                            bgcolor: alpha(theme.palette.primary.light, 0.16),
                            color: theme.vars.palette.primary.light,
                          }),
                        })}
                      >
                        <ArrowCircleUpOutlinedIcon sx={{ fontSize: 18 }} />
                      </Box>
                    </ArrowTooltip>
                  ) : null
                }
                value={selectedReportDefs[0]?.title ?? ""}
                onChange={(title) =>
                  setSelectedReports(
                    SCHEDULABLE_REPORTS.filter((r) => r.title === title).map(
                      (r) => r.key,
                    ),
                  )
                }
              />
              {/* The select has no helper slot, so the link sits under it. */}
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => setSamplesOpen(true)}
                sx={{ mt: 0.5, fontSize: 14, verticalAlign: "baseline" }}
              >
                Preview reports
              </Link>
            </Box>
          )}
        </Box>
      </Step>

      <Divider sx={{ mt: 1 }} />

      {/* STEP 2 — Scope */}
      <Step n={2} title="Select Organization">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* A schedule targets one organization. */}
          <SearchableSelect
            label="Organization"
            required
            placeholder="Select organization"
            options={ORGS}
            value={selectedOrg}
            onChange={setSelectedOrg}
          />

          {/* Narrowing below the organization is the exception, so the three
              filters stay folded away until they're wanted. */}
          {showScope && (
            <>
              <SearchableMultiSelect
                label="Sites"
                optional
                summarize
                options={SITES}
                selected={scopeSites}
                onChange={setScopeSites}
                disabled={selectedOrg === ""}
                disabledTooltip="Select an Organization for specific Sites."
              />
              <SearchableMultiSelect
                label="Roaming Clients"
                optional
                summarize
                options={ROAMING_CLIENTS}
                selected={scopeClients}
                onChange={setScopeClients}
                disabled={selectedOrg === ""}
                disabledTooltip="Select an Organization for specific Roaming Clients."
              />
              <SearchableMultiSelect
                label="Users"
                optional
                summarize
                options={USERS}
                selected={scopeUsers}
                onChange={setScopeUsers}
                disabled={selectedOrg === ""}
                disabledTooltip="Select an Organization for specific Users."
              />
            </>
          )}

          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => setShowScope((open) => !open)}
            sx={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.25,
              fontSize: 14,
            }}
          >
            {showScope ? "Show less" : "Show more options (3)"}
            {showScope ? (
              <ArrowDropUpIcon sx={{ fontSize: 20 }} />
            ) : (
              <ArrowDropDownIcon sx={{ fontSize: 20 }} />
            )}
          </Link>
        </Box>
      </Step>

      {/* A one-time run has nobody to mail and nothing to repeat, so the
          delivery and frequency steps drop away. */}
      {!oneTime && (
        <>
          <Divider sx={{ mt: 1 }} />

          {/* STEP 3 — Delivery */}
          <Step n={3} title="Add Recipients">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recipientFields}
            </Box>
          </Step>
          <Divider sx={{ mt: 1 }} />

          {/* STEP 4 — Schedule */}
          <Step n={4} title="Choose Frequency">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                {/* Same label + info treatment as External recipients. */}
                <FormLabel
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <Box component="span">
                    Delivery schedule
                    <Box component="span" sx={{ ml: 0.25 }}>
                      *
                    </Box>
                  </Box>
                  <ArrowTooltip title="Schedule frequency also sets the reporting period. Send time is optimized automatically for each delivery day.">
                    <Box
                      component="span"
                      sx={(theme) => ({
                        display: "inline-flex",
                        color: "primary.main",
                        ...theme.applyStyles("dark", {
                          color: theme.vars.palette.primary.light,
                        }),
                      })}
                    >
                      <MaterialSymbol name="info" size={20} />
                    </Box>
                  </ArrowTooltip>
                </FormLabel>
                <Select
                  fullWidth
                  displayEmpty
                  size="small"
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as (typeof FREQUENCIES)[number])
                  }
                  renderValue={(value) =>
                    value ? (
                      (value as string)
                    ) : (
                      <Box component="span" sx={{ color: "text.disabled" }}>
                        Select delivery schedule
                      </Box>
                    )
                  }
                >
                  {FREQUENCIES.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>
                {frequency === "Quarterly" && (
                  // Quarterly has no day to pick, so the rule is spelled
                  // out instead.
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, color: "text.secondary" }}
                  >
                    Delivered on the first day of each quarter (Jan 1, Apr 1,
                    Jul 1, Oct 1). Report covers the previous quarter.
                  </Typography>
                )}
              </Box>

              {frequency === "Weekly" && (
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>
                    Day of the week
                    <Box component="span" sx={{ ml: 0.25 }}>
                      *
                    </Box>
                  </FormLabel>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={weekDay}
                    // A weekly schedule always runs on some day, so the
                    // current pick stands until another is chosen.
                    onChange={(_event, next: string | null) => {
                      if (next) setWeekDay(next);
                    }}
                    sx={{
                      "& .MuiToggleButton-root": {
                        minWidth: 44,
                        py: "4px",
                        textTransform: "none",
                      },
                    }}
                  >
                    {WEEK_DAYS.map((day) => (
                      // Slow tip: the abbreviations are only ambiguous on
                      // a second look, so it shouldn't chase the pointer
                      // across the row.
                      <ArrowTooltip
                        key={day.value}
                        title={day.name}
                        enterDelay={2000}
                      >
                        <ToggleButton value={day.value} aria-label={day.name}>
                          {day.label}
                        </ToggleButton>
                      </ArrowTooltip>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              )}

              {frequency === "Monthly" && (
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>
                    Day of the month
                    <Box component="span" sx={{ ml: 0.25 }}>
                      *
                    </Box>
                  </FormLabel>
                  {/* 1st–28th: every month has those days, so a schedule
                      can't land on a date that doesn't exist. */}
                  <Select
                    fullWidth
                    size="small"
                    value={monthDay}
                    onChange={(e) => setMonthDay(Number(e.target.value))}
                  >
                    {MONTH_DAYS.map((day) => (
                      <MenuItem key={day} value={day}>
                        {ordinal(day)}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
            </Box>
          </Step>
        </>
      )}

      {/* STEP 4 — Branding. Parked, not deleted: the branding story may
          move here from MSP > Branding, so flip the flag to bring it
          back. */}
      {SHOW_BRANDING_STEP && <Divider sx={{ mt: 1 }} />}
      {SHOW_BRANDING_STEP && (
        <Step n={4} title="Branding (Optional)">
          <FormControlLabel
            control={
              <Switch
                checked={whitelabel}
                onChange={(e) => setWhitelabel(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography sx={{ fontWeight: 600 }}>
                  White-label branding
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Uses your branding in the email and report, and removes
                  &quot;Powered by DNSFilter.&quot;
                </Typography>
              </Box>
            }
            sx={{ alignItems: "flex-start", m: 0, gap: 1.5, mb: 2 }}
          />

          {/* No logo upload here — the logo comes from MSP > Branding. */}
          {whitelabel && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>
                  Company name
                </FormLabel>
                <TextField
                  fullWidth
                  size="small"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Box>
              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>
                  Reply-to email
                </FormLabel>
                <TextField
                  fullWidth
                  size="small"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                />
              </Box>
            </Box>
          )}
        </Step>
      )}
    </>
  );

  return (
    <>
      <Drawer
        open={open}
        onClose={onCancel}
        // A little more room under the last field than the drawer's default.
        contentSx={{ pb: 3 }}
        title={
          drawerTitle ??
          (isEdit
            ? "Edit Schedule"
            : variant === "drawer-v3" && deliveryChoice
              ? "Generate Report"
              : "Schedule Report")
        }
        subheader={selectedReportDefs[0]?.title}
        secondaryAction={{ label: "Cancel", onClick: onCancel }}
        primaryAction={{
          label:
            primaryLabel ??
            // Editing always saves; v3's create drawers just say Done.
            (isEdit
              ? "Save"
              : variant === "drawer-v3"
                ? "Done"
                : "Create schedule"),
          disabled: !canSave,
          tooltip: saveTooltip,
          onClick: () =>
            onSave(
              {
                name: scheduleName,
                tags: selectedReportDefs.map((r) => r.title),
                organization: selectedOrg,
                recipients: recipientCount,
                frequency,
                frequencyDetail:
                  frequency === "Weekly"
                    ? weekDay
                    : frequency === "Monthly"
                      ? ordinal(monthDay)
                      : "",
              },
              oneTime ? "one-time" : "scheduled",
            ),
        }}
      >
        {brandingBlock}
        {oneTime ? oneTimeForm : form}
      </Drawer>
      {/* The Preview reports link needs its modal in this branch too. */}
      <SampleReportsModal
        open={samplesOpen}
        onClose={() => setSamplesOpen(false)}
        onChoose={(reportKey) => setSelectedReports([reportKey])}
      />
    </>
  );
}
