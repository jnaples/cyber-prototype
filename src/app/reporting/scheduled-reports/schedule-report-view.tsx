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
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";

type ReportDef = {
  key: string;
  title: string;
  desc: string;
  Icon: SvgIconComponent;
  cybersight?: boolean;
};

const REPORTS: ReportDef[] = [
  {
    key: "activity",
    title: "Customer Activity Overview",
    desc: "Requests, blocked traffic, and top categories across the period.",
    Icon: InsightsOutlinedIcon,
  },
  {
    key: "traffic",
    title: "Endpoint Traffic Logs",
    desc: "Full DNS request log for every endpoint, exported as tables.",
    Icon: StorageOutlinedIcon,
  },
  {
    key: "protection",
    title: "Filter Protection Summary",
    desc: "Threats blocked, categories filtered, and policy coverage.",
    Icon: ShieldOutlinedIcon,
  },
  {
    key: "timeline-logs",
    title: "Timeline Activity Logs",
    desc: "Detailed CyberSight timeline events for each device.",
    Icon: ReceiptLongOutlinedIcon,
    cybersight: true,
  },
  {
    key: "timeline-overview",
    title: "Timeline Overview",
    desc: "Summarized device timelines with notable activity called out.",
    Icon: TimelineOutlinedIcon,
    cybersight: true,
  },
  {
    key: "ai-usage",
    title: "CyberSight AI Usage",
    desc: "AI queries, insights generated, and usage by device.",
    Icon: AutoAwesomeOutlinedIcon,
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
const TIMES = ["6:00 AM", "8:00 AM", "12:00 PM", "5:00 PM"];
const TIMEZONES = [
  { value: "ET", label: "Eastern (ET)" },
  { value: "CT", label: "Central (CT)" },
  { value: "MT", label: "Mountain (MT)" },
  { value: "PT", label: "Pacific (PT)" },
];
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
        sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "1px" }}
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
  const [time, setTime] = useState(TIMES[1]);
  const [timezone, setTimezone] = useState(TIMEZONES[0].value);
  const [whitelabel, setWhitelabel] = useState(true);
  const [companyName, setCompanyName] = useState("Brightwave IT");
  const [replyTo, setReplyTo] = useState("reports@brightwaveit.com");
  const [footerNote, setFooterNote] = useState("");
  const [previewTab, setPreviewTab] = useState<"email" | "pdf">("email");

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
            <Button variant="contained" color="primary" onClick={onSave}>
              Save schedule
            </Button>
          </>
        }
      />

      <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
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
          <Card sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* STEP 1 — Name & reports */}
            <Step n={1} title="Name & Reports">
              <FormLabel sx={{ display: "block", mb: 0.5 }}>Schedule name</FormLabel>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Monthly Executive Summary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
              />

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
                      })}
                    >
                      <Radio
                        checked={selected}
                        size="small"
                        sx={{ position: "absolute", top: 8, right: 8, p: 0.5 }}
                      />
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: "action.hover",
                          color: "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
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
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontSize: 14,
                          fontWeight: 600,
                          alignSelf: "flex-start",
                        }}
                      >
                        <MaterialSymbol name="visibility" size={16} />
                        Preview sample
                      </Link>
                      {r.cybersight && (
                        <Chip
                          label="Requires CyberSight"
                          size="small"
                          sx={(theme) => ({
                            alignSelf: "flex-start",
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: "primary.dark",
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          })}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                <FormLabel sx={{ flexShrink: 0 }}>Reporting period</FormLabel>
                <Select
                  size="small"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  sx={{ minWidth: 220 }}
                >
                  {PERIODS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
                Selected reports are combined into one PDF attachment per organization.
              </Typography>
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
                sx={{ alignItems: "flex-start", m: 0, gap: 1.5, mb: 2 }}
              />

              <FormLabel sx={{ display: "block", mb: 0.5 }}>Portal users</FormLabel>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: "auto",
                  mb: 2,
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
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
                Delivering to {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
                {orgContacts ? ` — ${orgContactCount} organization contacts.` : "."}
              </Typography>
            </Step>

            <Divider />

            {/* STEP 4 — Schedule */}
            <Step n={4} title="Schedule">
              <ToggleButtonGroup
                exclusive
                value={frequency}
                onChange={(_, v) => v && setFrequency(v)}
                sx={{ mb: 2 }}
              >
                {FREQUENCIES.map((f) => (
                  <ToggleButton key={f} value={f} sx={{ textTransform: "none", px: 2.5 }}>
                    {f}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
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
                </Box>
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>Time</FormLabel>
                  <Select
                    fullWidth
                    size="small"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  >
                    {TIMES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>Timezone</FormLabel>
                  <Select
                    fullWidth
                    size="small"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {TIMEZONES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>

              <Box
                sx={(theme) => ({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 2,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.dark",
                })}
              >
                <MaterialSymbol name="event_repeat" size={18} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Next delivery: {nextDeliveryDay} · {time} {timezone}
                </Typography>
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
                    disabled={!whitelabel}
                  />
                </Box>
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>Reply-to email</FormLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    disabled={!whitelabel}
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
                    opacity: whitelabel ? 1 : 0.5,
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
                <Box>
                  <FormLabel sx={{ display: "block", mb: 0.5 }}>Email footer note</FormLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Questions? Reply to this email."
                    value={footerNote}
                    onChange={(e) => setFooterNote(e.target.value)}
                    disabled={!whitelabel}
                  />
                </Box>
              </Box>
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
                px: 2.5,
                py: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>Preview</Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={previewTab}
                onChange={(_, v) => v && setPreviewTab(v)}
              >
                <ToggleButton value="email" sx={{ textTransform: "none", px: 2 }}>
                  Email
                </ToggleButton>
                <ToggleButton value="pdf" sx={{ textTransform: "none", px: 2 }}>
                  PDF Cover
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ bgcolor: "background.neutral", p: 2.5 }}>
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
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  From
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  {companyName} Reports &lt;{replyTo}&gt;
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  To
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  organization contacts ({recipientCount})
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Subject
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
                  {frequency} Security Report — Acme Manufacturing
                </Typography>
              </Box>

              {/* Email body */}
              <Card variant="outlined" sx={{ overflow: "hidden" }}>
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
                <Divider />
                <Box sx={{ px: 3, py: 2.5 }}>
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

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: 700,
                      }}
                    >
                      Attachments
                    </Typography>
                    <Link component="button" type="button" underline="hover" sx={{ fontSize: 13 }}>
                      Click to preview
                    </Link>
                  </Box>

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
                            size={18}
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2">{r.title}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Button fullWidth variant="contained" color="primary">
                    View full report
                  </Button>
                </Box>
                <Divider />
                <Box sx={{ px: 3, py: 2, textAlign: "center", bgcolor: "background.neutral" }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Sent by {companyName}
                  </Typography>
                  <Link component="button" type="button" underline="hover" sx={{ fontSize: 13 }}>
                    Manage report preferences
                  </Link>
                </Box>
              </Card>

              {previewTab === "pdf" && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}
                >
                  PDF cover preview uses the same branding shown above.
                </Typography>
              )}
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
