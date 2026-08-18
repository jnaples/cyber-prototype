// "Schedule Report" builder — opened from the Report Manager "Schedule
// Report" action. Two-column layout: a stepped form on the left (reports,
// organizations, recipients, schedule, branding) and a live Email / PDF-cover
// preview on the right. Header carries the Cancel / Create schedule actions.

import AttachmentOutlinedIcon from "@mui/icons-material/AttachmentOutlined";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  FormLabel,
  Link,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";
import { SearchableMultiSelect } from "@/components/searchable-multi-select";
import { Select } from "@/components/select";
import { TextField } from "@/components/text-field";

import { SamplePreviewModal } from "./sample-preview-modal";
import type { ScheduleEditState } from "./schedule-edit-state";
import { REPORTS, type ReportDef } from "./reports";

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
];

const PORTAL_USER_EMAILS = PORTAL_USERS.map((u) => u.email);

const ORGS = [
  "Austin Office",
  "Berlin Hub",
  "Boston Lab",
  "Chicago HQ",
  "Headquarters",
  "London Branch",
];

// A custom report is built to order in the Custom Report builder, so there's
// nothing here to put on a schedule.
const SCHEDULABLE_REPORTS = REPORTS.filter((r) => r.key !== "custom");

const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly"] as const;

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

export function ScheduleReportView({
  onCancel,
  onSave,
  edit,
  initialReports,
}: {
  onCancel: () => void;
  onSave: () => void;
  /** Seeds the form from an existing schedule and switches to edit mode. */
  edit?: ScheduleEditState;
  /** Report keys to preselect — set when opened from a Library preview. */
  initialReports?: string[];
}) {
  // Editing seeds every step the grid row can account for; otherwise nothing is
  // chosen unless a Library preview sent a report along. Branding stays default.
  const [selectedReports, setSelectedReports] = useState<string[]>(
    edit?.reports ?? initialReports ?? [],
  );
  const [scheduleName, setScheduleName] = useState(edit?.scheduleName ?? "");
  const [selectedOrg, setSelectedOrg] = useState(edit?.organization ?? "");
  const [portalUsers, setPortalUsers] = useState<string[]>(
    edit?.portalUsers ?? [],
  );
  const [externalEmail, setExternalEmail] = useState("");
  const [externalEmails, setExternalEmails] = useState<string[]>(
    edit?.externalEmails ?? [],
  );
  const [emailError, setEmailError] = useState("");
  const [emailSubject, setEmailSubject] = useState(edit?.emailSubject ?? "");
  const [emailMessage, setEmailMessage] = useState(edit?.emailMessage ?? "");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>(
    (FREQUENCIES as readonly string[]).includes(edit?.frequency ?? "")
      ? (edit?.frequency as (typeof FREQUENCIES)[number])
      : FREQUENCIES[0],
  );
  const [whitelabel, setWhitelabel] = useState(true);
  const [companyName, setCompanyName] = useState("Brightwave IT");
  const [replyTo, setReplyTo] = useState("reports@brightwaveit.com");
  const [samplePreview, setSamplePreview] = useState<ReportDef | null>(null);

  const toggleReport = (key: string) =>
    setSelectedReports((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const recipientCount = portalUsers.length + externalEmails.length;
  const selectedReportDefs = SCHEDULABLE_REPORTS.filter((r) =>
    selectedReports.includes(r.key),
  );

  // Required to save: a name, a report, an organization, a recipient, and a
  // subject.
  const canSave =
    scheduleName.trim() !== "" &&
    selectedReports.length > 0 &&
    selectedOrg !== "" &&
    recipientCount > 0 &&
    emailSubject.trim() !== "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <PageHeader
        title={edit ? "Edit Schedule" : "Schedule Report"}
        onBack={onCancel}
        actions={
          <>
            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <ArrowTooltip
              title={
                canSave
                  ? ""
                  : `${edit ? "Save changes" : "Create Schedule"} will enable once all required fields are filled out.`
              }
            >
              <span
                style={{
                  display: "inline-flex",
                  cursor: canSave ? undefined : "not-allowed",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onSave}
                  disabled={!canSave}
                >
                  {edit ? "Save changes" : "Create schedule"}
                </Button>
              </span>
            </ArrowTooltip>
          </>
        }
      />

      <Box sx={{ flex: 1, overflow: "auto", px: 2, pt: 2, pb: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1.15fr) minmax(0, 1fr)",
              },
              gap: 2,
              alignItems: "start",
            }}
          >
            {/* ---------------------------------------------------------------- */}
            {/* LEFT — stepped form                                              */}
            {/* ---------------------------------------------------------------- */}
            <Card
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography variant="cardTitle">Schedule Details</Typography>

              {/* STEP 1 — Reports */}
              <Step n={1} title="Select Organization & Reports">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <FormLabel sx={{ display: "block", mb: 0.5 }}>
                      Schedule Name
                      <Box component="span" sx={{ ml: 0.25 }}>
                        *
                      </Box>
                    </FormLabel>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Monthly Executive Summary"
                      value={scheduleName}
                      onChange={(e) => setScheduleName(e.target.value)}
                      // Same hint tone as the Organization select below it — the
                      // theme otherwise paints input placeholders a step darker.
                      sx={{
                        "& .MuiOutlinedInput-root:not(.Mui-disabled) input::placeholder":
                          { color: "text.disabled", opacity: 1 },
                      }}
                    />
                  </Box>
                  <Box>
                    <FormLabel sx={{ display: "block", mb: 0.5 }}>
                      Organization
                      <Box component="span" sx={{ ml: 0.25 }}>
                        *
                      </Box>
                    </FormLabel>
                    <Select
                      displayEmpty
                      fullWidth
                      size="small"
                      value={selectedOrg}
                      onChange={(e) => setSelectedOrg(e.target.value)}
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
                      {/* No "All Organizations" — a schedule targets one. */}
                      {ORGS.map((org) => (
                        <MenuItem key={org} value={org}>
                          {org}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <FormLabel sx={{ display: "block", mb: 1 }}>
                      Select reports
                      <Box component="span" sx={{ ml: 0.25 }}>
                        *
                      </Box>
                    </FormLabel>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      {SCHEDULABLE_REPORTS.map((r) => {
                        const selected = selectedReports.includes(r.key);
                        return (
                          <Box
                            key={r.key}
                            onClick={() => toggleReport(r.key)}
                            sx={(theme) => ({
                              position: "relative",
                              border: "1px solid",
                              borderColor: selected
                                ? "primary.main"
                                : "divider",
                              borderRadius: 1,
                              bgcolor: selected
                                ? alpha(theme.palette.primary.main, 0.08)
                                : "transparent",
                              p: 2,
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              transition: "background 120ms",
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  selected ? 0.12 : 0.04,
                                ),
                              },
                              ...theme.applyStyles("dark", {
                                borderColor: selected
                                  ? theme.vars.palette.primary.light
                                  : theme.vars.palette.divider,
                              }),
                            })}
                          >
                            <Checkbox
                              checked={selected}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleReport(r.key)}
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                p: 0.5,
                                "& .MuiSvgIcon-root": { fontSize: 20 },
                              }}
                            />
                            <Box
                              sx={(theme) => ({
                                width: 36,
                                height: 36,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                                ...theme.applyStyles("dark", {
                                  color: theme.vars.palette.primary.light,
                                }),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              })}
                            >
                              <Box component={r.Icon} sx={{ fontSize: 20 }} />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}
                            >
                              <Typography
                                sx={{ fontWeight: 700, fontSize: 15, pr: 3 }}
                              >
                                {r.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary" }}
                              >
                                {r.desc}
                              </Typography>
                            </Box>
                            <Link
                              component="button"
                              type="button"
                              underline="hover"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSamplePreview(r);
                              }}
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                fontSize: 14,
                                fontWeight: 600,
                                alignSelf: "flex-start",
                                mt: 1,
                              }}
                            >
                              View sample
                            </Link>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              </Step>

              <Divider sx={{ mt: 1 }} />

              {/* STEP 2 — Delivery */}
              <Step n={2} title="Add Recipients & Message">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <SearchableMultiSelect
                    label="Internal Recipients"
                    options={PORTAL_USER_EMAILS}
                    selected={portalUsers}
                    onChange={setPortalUsers}
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
                      Other recipients
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
                          setEmailError(
                            `"${invalid}" is not a valid email address.`,
                          );
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
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <FormLabel sx={{ display: "block", mb: 0.5 }}>
                      Email Subject
                      <Box component="span" sx={{ ml: 0.25 }}>
                        *
                      </Box>
                    </FormLabel>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={`e.g. ${frequency} Security Report`}
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </Box>

                  <Box>
                    <FormLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      Email message
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "text.secondary", fontWeight: 400 }}
                      >
                        Optional
                      </Typography>
                    </FormLabel>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      size="small"
                      placeholder="e.g. Your monthly security report is attached. Reach out with any questions."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                    />
                  </Box>
                </Box>
              </Step>

              <Divider sx={{ mt: 1 }} />

              {/* STEP 3 — Schedule */}
              <Step n={3} title="Choose Frequency">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <FormLabel sx={{ display: "block", mb: 0.5 }}>
                      Schedule
                      <Box component="span" sx={{ ml: 0.25 }}>
                        *
                      </Box>
                    </FormLabel>
                    <Select
                      fullWidth
                      size="small"
                      value={frequency}
                      onChange={(e) =>
                        setFrequency(
                          e.target.value as (typeof FREQUENCIES)[number],
                        )
                      }
                    >
                      {FREQUENCIES.map((f) => (
                        <MenuItem key={f} value={f}>
                          {f}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Box>
              </Step>

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
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Uses your branding in the email and report, and
                          removes &quot;Powered by DNSFilter.&quot;
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
            </Card>

            {/* ---------------------------------------------------------------- */}
            {/* RIGHT — live preview                                             */}
            {/* ---------------------------------------------------------------- */}
            <Card
              sx={{
                position: { md: "sticky" },
                top: { md: 0 },
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 2,
                }}
              >
                <Typography variant="cardTitle">Preview</Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: "background.neutral",
                  borderRadius: 1,
                  mx: 2,
                  mb: 2,
                  p: 2,
                }}
              >
                <>
                  {/* Envelope */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      columnGap: 2,
                      rowGap: 0.5,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.primary", fontWeight: 700 }}
                    >
                      From:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {companyName} Reports &lt;{replyTo}&gt;
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.primary", fontWeight: 700 }}
                    >
                      To:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {recipientCount > 0 ? `Contacts (${recipientCount})` : ""}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.primary", fontWeight: 700 }}
                    >
                      Subject:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {emailSubject.trim() || `${frequency} Security Report`}
                    </Typography>
                  </Box>

                  {/* Email body */}
                  <Box sx={{ borderRadius: 1 }}>
                    {selectedReportDefs.length === 0 ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: "italic",
                          color: "text.secondary",
                          textAlign: "center",
                          py: 6,
                        }}
                      >
                        Select a report to preview
                      </Typography>
                    ) : (
                      <Card elevation={1} sx={{ overflow: "hidden" }}>
                        <Box
                          sx={{
                            px: 3,
                            py: 2.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              bgcolor: "primary.main",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            BI
                          </Box>
                          <Typography sx={{ fontWeight: 700 }}>
                            {companyName}
                          </Typography>
                        </Box>
                        <Box sx={{ px: 3, py: 2.5, pt: 0 }}>
                          {emailMessage.trim() && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.primary",
                                whiteSpace: "pre-line",
                                mb: 2,
                              }}
                            >
                              {emailMessage}
                            </Typography>
                          )}

                          <Typography
                            variant="overline"
                            sx={{
                              color: "text.secondary",
                              display: "block",
                              mb: 1,
                            }}
                          >
                            Attachments ({selectedReportDefs.length})
                          </Typography>

                          {selectedReportDefs.length === 0 ? (
                            <Box
                              sx={{
                                border: "1px dashed",
                                borderColor: "divider",
                                borderRadius: 1,
                                p: 2,
                                textAlign: "center",
                                color: "text.secondary",
                                mb: 2.5,
                              }}
                            >
                              <Typography variant="body2">
                                Select at least one report to preview
                                attachments.
                              </Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                mb: 2.5,
                              }}
                            >
                              {selectedReportDefs.map((r) => (
                                <Box
                                  key={r.key}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    px: 1.5,
                                    py: 1,
                                  }}
                                >
                                  <AttachmentOutlinedIcon
                                    sx={{
                                      fontSize: 20,
                                      color: "text.disabled",
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ flex: 1, fontWeight: 600 }}
                                  >
                                    {r.file}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "text.secondary" }}
                                  >
                                    {r.size}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Card>
                    )}
                  </Box>
                </>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>

      <SamplePreviewModal
        open={Boolean(samplePreview)}
        onClose={() => setSamplePreview(null)}
        reportKey={samplePreview?.key}
        title={samplePreview?.title}
        Icon={samplePreview?.Icon}
      />
    </Box>
  );
}
