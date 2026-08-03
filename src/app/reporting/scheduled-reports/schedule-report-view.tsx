// "Schedule Report" builder — opened from the Scheduled Reports "Schedule
// Report" action. Two-column layout: a stepped form on the left (name & reports,
// organizations, recipients, schedule, branding) and a live Email / PDF-cover
// preview on the right. Header carries the Cancel / Send test / Save actions.

import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormLabel,
  IconButton,
  Link,
  MenuItem,
  Radio,
  Select,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import StackedLineChartOutlinedIcon from "@mui/icons-material/StackedLineChartOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";

import { SamplePreviewModal } from "./sample-preview-modal";

type ReportDef = {
  key: string;
  title: string;
  desc: string;
  Icon: SvgIconComponent;
  file: string;
  size: string;
  cybersight?: boolean;
};

const REPORTS: ReportDef[] = [
  {
    key: "activity",
    title: "Customer Activity Overview",
    desc: "Requests, blocked traffic, and top categories across the period.",
    Icon: StackedLineChartOutlinedIcon,
    file: "Activity-Overview-Jul-2026.pdf",
    size: "1.2 MB",
  },
  {
    key: "traffic",
    title: "Endpoint Traffic Logs",
    desc: "Full DNS request log for every endpoint, exported as tables.",
    Icon: TableChartOutlinedIcon,
    file: "Traffic-Logs-Jul-2026.pdf",
    size: "840 KB",
  },
  {
    key: "protection",
    title: "Filter Protection Summary",
    desc: "Threats blocked, categories filtered, and policy coverage.",
    Icon: ShieldOutlinedIcon,
    file: "Protection-Summary-Jul-2026.pdf",
    size: "1.1 MB",
  },
  {
    key: "timeline-logs",
    title: "Timeline Activity Logs",
    desc: "Detailed CyberSight timeline events for each device.",
    Icon: ReceiptLongOutlinedIcon,
    file: "Timeline-Logs-Jul-2026.pdf",
    size: "1.4 MB",
    cybersight: true,
  },
  {
    key: "timeline-overview",
    title: "Timeline Overview",
    desc: "Summarized device timelines with notable activity called out.",
    Icon: ShowChartOutlinedIcon,
    file: "Timeline-Overview-Jul-2026.pdf",
    size: "980 KB",
    cybersight: true,
  },
  {
    key: "ai-usage",
    title: "CyberSight AI Usage",
    desc: "AI queries, insights generated, and usage by device.",
    Icon: AutoAwesomeOutlinedIcon,
    file: "AI-Usage-Jul-2026.pdf",
    size: "760 KB",
    cybersight: true,
  },
];

const PORTAL_USERS = [
  { name: "Dana Mori", email: "dana.mori@acmemfg.com", org: "Acme Manufacturing" },
  { name: "Priya Natarajan", email: "priya.n@acmemfg.com", org: "Acme Manufacturing" },
  { name: "Tom Villanueva", email: "tom.v@globexfin.com", org: "Globex Financial" },
  { name: "Kim Doyle", email: "kim.doyle@globexfin.com", org: "Globex Financial" },
  { name: "Sofia Reyes", email: "s.reyes@initech.io", org: "Initech Software" },
  { name: "Marcus Bell", email: "marcus.b@initech.io", org: "Initech Software" },
];

const PERIODS = ["Previous month", "Previous week", "Previous quarter", "Previous 30 days"];
const DAYS = ["1st", "5th", "15th", "Last day"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly"] as const;

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
        sx={{ display: "block", color: "text.secondary", lineHeight: 1.5 }}
      >
        Step {n} — {title}
      </Typography>
      <Box sx={{ mt: 2 }}>{children}</Box>
    </Box>
  );
}

export function ScheduleReportView({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState("");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [orgScope, setOrgScope] = useState<"all" | "selected">("all");
  const [orgContacts, setOrgContacts] = useState(true);
  const [portalUsers, setPortalUsers] = useState<string[]>([]);
  const [externalEmail, setExternalEmail] = useState("");
  const [externalEmails, setExternalEmails] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("Monthly");
  const [day, setDay] = useState(DAYS[0]);
  const [whitelabel, setWhitelabel] = useState(false);
  const [companyName, setCompanyName] = useState("Brightwave IT");
  const [replyTo, setReplyTo] = useState("reports@brightwaveit.com");
  const [previewTab, setPreviewTab] = useState<"email" | "pdf">("email");
  const [samplePreview, setSamplePreview] = useState<ReportDef | null>(null);

  const toggleReport = (key: string) =>
    setSelectedReports((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  const togglePortalUser = (email: string) =>
    setPortalUsers((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );

  const orgContactCount = 6;
  const recipientCount =
    (orgContacts ? orgContactCount : 0) + portalUsers.length + externalEmails.length;
  const nextDeliveryDay = day === "Last day" ? "Jul 31" : "Aug 1";
  const selectedReportDefs = REPORTS.filter((r) => selectedReports.includes(r.key));

  // Required to save: a name, at least one report, and at least one recipient.
  const canSave =
    name.trim() !== "" && selectedReports.length > 0 && recipientCount > 0;

  const addExternalEmail = () => {
    const v = externalEmail.trim();
    if (v && !externalEmails.includes(v)) {
      setExternalEmails((prev) => [...prev, v]);
      setExternalEmail("");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <PageHeader
        title="Schedule Report"
        onBack={onCancel}
        actions={
          <>
            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<MaterialSymbol name="send" size={18} />}
            >
              Send test
            </Button>
            <ArrowTooltip
              title={
                canSave
                  ? ""
                  : "Create Schedule will enable once all required fields are filled out."
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
                  Create schedule
                </Button>
              </span>
            </ArrowTooltip>
          </>
        }
      />

      <Box sx={{ flex: 1, overflow: "auto", p: 3, pb: 8 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.15fr) minmax(0, 1fr)" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* ---------------------------------------------------------------- */}
          {/* LEFT — stepped form                                              */}
          {/* ---------------------------------------------------------------- */}
          <Card sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="cardTitle">Schedule Details</Typography>

            {/* STEP 1 — Name & reports */}
            <Step n={1} title="Name & Reports">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>
                  Schedule name
                  <Box component="span" sx={{ ml: 0.25 }}>
                    *
                  </Box>
                </FormLabel>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Monthly Executive Summary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
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
                {REPORTS.map((r) => {
                  const selected = selectedReports.includes(r.key);
                  return (
                    <Box
                      key={r.key}
                      onClick={() => toggleReport(r.key)}
                      sx={(theme) => ({
                        position: "relative",
                        border: "1px solid",
                        borderColor: selected ? "primary.main" : "divider",
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
                      <Typography sx={{ fontWeight: 700, fontSize: 15, pr: 3 }}>
                        {r.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {r.desc}
                      </Typography>
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
                        Preview sample
                      </Link>
                    </Box>
                  );
                })}
                </Box>
              </Box>

              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>
                  Reporting period
                  <Box component="span" sx={{ ml: 0.25 }}>
                    *
                  </Box>
                </FormLabel>
                <Select
                  fullWidth
                  size="small"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  {PERIODS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              </Box>
            </Step>

            <Divider />

            {/* STEP 2 — Organizations */}
            <Step n={2} title="Organizations">
              <Box
                onClick={() => setOrgScope("all")}
                sx={{ display: "flex", gap: 1, cursor: "pointer", mb: 1.5 }}
              >
                <Radio checked={orgScope === "all"} size="small" sx={{ p: 0, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ color: "text.primary" }}>All organizations (6)</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Includes organizations added later.
                  </Typography>
                </Box>
              </Box>
              <Box
                onClick={() => setOrgScope("selected")}
                sx={{ display: "flex", gap: 1, cursor: "pointer" }}
              >
                <Radio
                  checked={orgScope === "selected"}
                  size="small"
                  sx={{ p: 0, mt: 0.25 }}
                />
                <Typography sx={{ color: "text.primary" }}>Selected organizations</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
                Each organization receives a PDF built from its own data.
              </Typography>
            </Step>

            <Divider />

            {/* STEP 3 — Recipients */}
            <Step n={3} title="Recipients">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={orgContacts}
                    onChange={(e) => setOrgContacts(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>Organization contacts</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Delivers to the billing and technical contacts saved on each
                      organization.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0, gap: 1.5 }}
              />

              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>Portal users</FormLabel>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    maxHeight: 200,
                    overflow: "auto",
                  }}
                >
                {PORTAL_USERS.map((u, i) => (
                  <Box
                    key={u.email}
                    onClick={() => togglePortalUser(u.email)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      cursor: "pointer",
                      borderBottom: i < PORTAL_USERS.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={portalUsers.includes(u.email)}
                      sx={{ p: 0.5 }}
                    />
                    <Typography sx={{ fontWeight: 600, flex: "0 0 auto", minWidth: 160 }}>
                      {u.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", flex: 1, minWidth: 0 }}
                      noWrap
                    >
                      {u.email}
                    </Typography>
                    <Chip
                      label={u.org}
                      size="small"
                      sx={{ bgcolor: "action.hover", color: "text.secondary" }}
                    />
                  </Box>
                ))}
                </Box>
              </Box>

              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>External email addresses</FormLabel>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add email and press Enter"
                value={externalEmail}
                onChange={(e) => setExternalEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExternalEmail();
                  }
                }}
              />
              {externalEmails.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                  {externalEmails.map((em) => (
                    <Chip
                      key={em}
                      label={em}
                      size="small"
                      onDelete={() =>
                        setExternalEmails((prev) => prev.filter((x) => x !== em))
                      }
                    />
                  ))}
                </Box>
              )}
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Delivering to {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
                {orgContacts ? ` — ${orgContactCount} organization contacts.` : "."}
              </Typography>
              </Box>
              </Box>
            </Step>

            <Divider />

            {/* STEP 4 — Schedule */}
            <Step n={4} title="Schedule">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={frequency}
                onChange={(_, v) => v && setFrequency(v)}
                sx={{ alignSelf: "flex-start" }}
              >
                {FREQUENCIES.map((f) => (
                  <ToggleButton
                    key={f}
                    value={f}
                    sx={{ textTransform: "uppercase", fontSize: 13, height: 30, px: 2 }}
                  >
                    {f}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box>
                <FormLabel sx={{ display: "block", mb: 0.5 }}>Day of month</FormLabel>
                <Select
                  fullWidth
                  size="small"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  {DAYS.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>

                <Box
                  sx={(theme) => ({
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: theme.vars.palette.Alert.infoStandardBg,
                    color: theme.vars.palette.Alert.infoColor,
                  })}
                >
                  <MaterialSymbol name="event_repeat" size={20} />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      Next delivery:
                    </Box>{" "}
                    {nextDeliveryDay}
                  </Typography>
                </Box>
              </Box>
              </Box>
            </Step>

            <Divider />

            {/* STEP 5 — Branding */}
            <Step n={5} title="Branding">
              <FormControlLabel
                control={
                  <Switch
                    checked={whitelabel}
                    onChange={(e) => setWhitelabel(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>White-label branding</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Replaces default service branding in the email and PDF.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0, gap: 1.5, mb: 2 }}
              />

              {whitelabel && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <FormLabel sx={{ display: "block", mb: 0.5 }}>Company name</FormLabel>
                    <TextField
                      fullWidth
                      size="small"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <FormLabel sx={{ display: "block", mb: 0.5 }}>Reply-to email</FormLabel>
                    <TextField
                      fullWidth
                      size="small"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                    />
                  </Box>
                  <Box
                    sx={{
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <MaterialSymbol name="upload" size={22} sx={{ color: "text.secondary" }} />
                    <Box>
                      <Link component="button" type="button" underline="hover" sx={{ fontWeight: 700 }}>
                        Upload Logo
                      </Link>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        PNG or SVG, 512px wide recommended
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Step>
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
              <ToggleButtonGroup
                exclusive
                size="small"
                value={previewTab}
                onChange={(_, v) => v && setPreviewTab(v)}
              >
                <ToggleButton
                  value="email"
                  sx={{ textTransform: "uppercase", fontSize: 13, height: 30, px: 2 }}
                >
                  Email
                </ToggleButton>
                <ToggleButton
                  value="pdf"
                  sx={{ textTransform: "uppercase", fontSize: 13, height: 30, px: 2 }}
                >
                  PDF Cover
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ bgcolor: "background.paper", p: 2 }}>
              {previewTab === "email" && (
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
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
                  From:
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  {companyName} Reports &lt;{replyTo}&gt;
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
                  To:
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  organization contacts ({recipientCount})
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
                  Subject:
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  {frequency} Security Report — Acme Manufacturing
                </Typography>
              </Box>

              {/* Email body */}
              <Box sx={{ p: 2, bgcolor: "background.neutral", borderRadius: 1 }}>
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
              <Card elevation={0} sx={{ overflow: "hidden" }}>
                <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
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
                  <Typography sx={{ fontWeight: 700 }}>{companyName}</Typography>
                </Box>
                <Box sx={{ px: 3, py: 2.5, pt: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {frequency} Security Report
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    Jun 1 – 30, 2026 · Acme Manufacturing (example — each organization
                    receives its own PDF)
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    {[
                      { num: "306.2K", cap: "Requests", color: "text.primary" },
                      { num: "12.4K", cap: "Blocked", color: "text.primary" },
                      { num: "214", cap: "Threats", color: "#ce008e" },
                    ].map((s) => (
                      <Box
                        key={s.cap}
                        sx={{ bgcolor: "background.neutral", borderRadius: 1, p: 1.5 }}
                      >
                        <Typography sx={{ fontWeight: 700, fontSize: 22, color: s.color }}>
                          {s.num}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            fontWeight: 600,
                          }}
                        >
                          {s.cap}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Typography
                    variant="overline"
                    sx={{ color: "text.secondary", display: "block", mb: 1 }}
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
                        Select at least one report to preview attachments.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5 }}>
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
                          <MaterialSymbol
                            name="picture_as_pdf"
                            size={20}
                            sx={{ color: "#d93025" }}
                          />
                          <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>
                            {r.file}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {r.size}
                          </Typography>
                          <IconButton
                            size="small"
                            aria-label={`Preview ${r.title}`}
                            onClick={() => setSamplePreview(r)}
                            sx={{ color: "primary.main", p: 0.25 }}
                          >
                            <MaterialSymbol name="visibility" size={20} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                </Box>
              </Card>
              )}
              </Box>
                </>
              )}

              {previewTab === "pdf" && (
                <Card
                  variant="outlined"
                  sx={{
                    overflow: "hidden",
                    minHeight: 560,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
                    {/* Brand */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
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
                      <Typography sx={{ fontWeight: 700 }}>{companyName}</Typography>
                    </Box>

                    {/* Title block */}
                    <Typography
                      variant="overline"
                      sx={{ color: "primary.main", fontWeight: 700 }}
                    >
                      {frequency} report
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 28, mb: 1 }}>
                      Security Report
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      Jun 1 – 30, 2026
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", mb: 2.5 }}>
                      Prepared for Acme Manufacturing
                    </Typography>

                    <Divider sx={{ mb: 2.5 }} />

                    <Typography variant="overline" sx={{ color: "text.secondary", mb: 1 }}>
                      Included reports
                    </Typography>
                    {selectedReportDefs.length === 0 ? (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Select at least one report to include.
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {selectedReportDefs.map((r) => (
                          <Box
                            key={r.key}
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <Box
                              component={r.Icon}
                              sx={{ fontSize: 20, color: "primary.main" }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {r.title}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ flex: 1 }} />
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 3 }}>
                      Generated Jul 21, 2026 · {companyName}
                    </Typography>
                  </Box>
                </Card>
              )}
            </Box>
          </Card>
        </Box>
      </Box>

      <SamplePreviewModal
        open={Boolean(samplePreview)}
        onClose={() => setSamplePreview(null)}
        title={samplePreview?.title}
        Icon={samplePreview?.Icon}
      />
    </Box>
  );
}
