// "Schedule a report" form — opened from the Scheduled Reports "Schedule
// Report" action. Reuses the Plans & Licenses layout (a 3-column grid: form
// cards spanning two columns on the left, a sticky Summary card on the right)
// with a pinned footer (Cancel / Send test / Save schedule).

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";
import { PageHeader } from "@/components/page-header";

const REPORT_TYPES = [
  "Activity Overview",
  "Protection Summary",
  "Traffic Logs",
  "AI Usage",
  "Timeline Overview",
  "Timeline Logs",
];

const ORGANIZATIONS = [
  "All organizations",
  "Acme Manufacturing",
  "Globex",
  "Initech",
  "Umbrella Health",
];

const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly"];
const TIMEZONES = ["ET", "CT", "MT", "PT"];

// A labeled field wrapper matching the app's form style.
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <FormControl size="small" fullWidth>
      <FormLabel sx={{ mb: 0.5 }}>{label}</FormLabel>
      {children}
    </FormControl>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary", textAlign: "right" }}>
        {value}
      </Typography>
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
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [organization, setOrganization] = useState(ORGANIZATIONS[0]);
  const [recipients, setRecipients] = useState("");
  const [frequency, setFrequency] = useState(FREQUENCIES[1]);
  const [time, setTime] = useState("08:00");
  const [timezone, setTimezone] = useState(TIMEZONES[0]);

  const recipientCount = recipients
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean).length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <PageHeader title="Schedule a report" onBack={onCancel} />

      <Box sx={{ flex: 1, overflow: "auto", px: 2, pt: 2, pb: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* Left: form cards (span 2) */}
          <Box
            sx={{
              gridColumn: { md: "span 2" },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Card>
              <CardHeader title="Report details" />
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Field label="Report name">
                  <TextField
                    size="small"
                    placeholder="e.g. Monthly Executive Summary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field label="Report type">
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    {REPORT_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </Field>
                <Field label="Organizations">
                  <Select
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  >
                    {ORGANIZATIONS.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </Field>
                <Field label="Recipients">
                  <TextField
                    size="small"
                    multiline
                    minRows={2}
                    placeholder="Add email addresses, separated by commas"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Schedule" />
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Field label="Frequency">
                  <Select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    {FREQUENCIES.map((f) => (
                      <MenuItem key={f} value={f}>
                        {f}
                      </MenuItem>
                    ))}
                  </Select>
                </Field>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Field label="Send time">
                    <TextField
                      size="small"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </Field>
                  <Field label="Timezone">
                    <Select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      {TIMEZONES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </Field>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right: sticky summary */}
          <Card sx={{ position: { md: "sticky" }, top: { md: 0 } }}>
            <CardHeader title="Summary" />
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <SummaryRow label="Report" value={name || "Untitled report"} />
              <SummaryRow label="Type" value={reportType} />
              <SummaryRow label="Organizations" value={organization} />
              <Divider />
              <SummaryRow label="Frequency" value={frequency} />
              <SummaryRow label="Send time" value={`${time} ${timezone}`} />
              <SummaryRow
                label="Recipients"
                value={
                  recipientCount === 0
                    ? "None yet"
                    : `${recipientCount} recipient${recipientCount === 1 ? "" : "s"}`
                }
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1.5,
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
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
      </Box>
    </Box>
  );
}
