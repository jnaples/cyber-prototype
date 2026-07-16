import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

import { MaterialSymbol } from "@/components/material-symbol";

// ---------------------------------------------------------------------------
// Status — soft semantic tint + dark text + icon (always)
// ---------------------------------------------------------------------------

type Severity = "success" | "error" | "warning" | "info" | "neutral";

// Soft-fill + matching text, sourced from our Alert palette tokens (the same
// tints the Alert component uses); neutral falls back to a grey wash.
const statusChipSx = (severity: Severity) => (theme: Theme) => {
  const A = theme.vars.palette.Alert;
  const tints: Record<Exclude<Severity, "neutral">, { bg: string; fg: string }> =
    {
      success: { bg: A.successStandardBg, fg: A.successColor },
      error: { bg: A.errorStandardBg, fg: A.errorColor },
      warning: { bg: A.warningStandardBg, fg: A.warningColor },
      info: { bg: A.infoStandardBg, fg: A.infoColor },
    };
  const tint =
    severity === "neutral"
      ? {
          bg: alpha(theme.palette.text.primary, 0.08),
          fg: theme.palette.text.secondary,
        }
      : tints[severity];
  return {
    bgcolor: tint.bg,
    color: tint.fg,
    "& .MuiChip-icon, & .MuiChip-label": { color: "inherit" },
  };
};

function StatusChip({
  label,
  severity,
  icon,
}: {
  label: string;
  severity: Severity;
  icon: string;
}) {
  return (
    <Chip
      size="small"
      icon={<MaterialSymbol name={icon} size={16} />}
      label={label}
      sx={statusChipSx(severity)}
    />
  );
}

const STATUSES: {
  label: string;
  severity: Severity;
  icon: string;
  tint: string;
  examples: string;
}[] = [
  {
    label: "Active",
    severity: "success",
    icon: "check_circle",
    tint: "success tint",
    examples: "Active · Connected · Enabled · Allowed",
  },
  {
    label: "Blocked",
    severity: "error",
    icon: "block",
    tint: "error tint",
    examples: "Error · Blocked · Failed",
  },
  {
    label: "Not Enrolled",
    severity: "warning",
    icon: "warning",
    tint: "warning tint",
    examples: "Authorization Required · Not Enrolled",
  },
  {
    label: "Syncing",
    severity: "info",
    icon: "sync",
    tint: "info tint",
    examples: "Syncing · In Progress",
  },
  {
    label: "Pending",
    severity: "neutral",
    icon: "schedule",
    tint: "neutral tint",
    examples: "Pending · Disabled · Inactive · Idle",
  },
];

// ---------------------------------------------------------------------------
// Categorical identity — soft hue tint + dark text, no icon
// ---------------------------------------------------------------------------

type Hue = "primary" | "info" | "error" | "tertiary" | "neutral";

function IdentityChip({ label, hue }: { label: string; hue: Hue }) {
  return (
    <Chip
      size="small"
      label={label}
      sx={(theme) => ({
        bgcolor:
          hue === "neutral"
            ? alpha(theme.palette.text.primary, 0.08)
            : alpha(theme.palette[hue].main, 0.18),
        color: "text.primary",
        "& .MuiChip-label": { color: "inherit" },
      })}
    />
  );
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: 18, color: "text.primary" }}>
      {children}
    </Typography>
  );
}

function FamilyRow({
  name,
  examples,
  description,
  last,
}: {
  name: string;
  examples: React.ReactNode;
  description: string;
  last?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "180px 1.1fr 1.3fr" },
        gap: 2,
        alignItems: "center",
        px: 2,
        py: 2.5,
        borderBottom: last ? "none" : "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
        {name}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{examples}</Box>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {description}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChipsDocs() {
  return (
    <Container maxWidth="lg">
      <Stack sx={{ p: 4, gap: 4 }}>
        {/* The rules */}
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
            display: "flex",
            gap: 1.5,
          }}
        >
          <MaterialSymbol name="lock" size={22} sx={{ color: "primary.main" }} />
          <Box>
            <Typography sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
              The rules
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              All chips: 6px radius. Pills (999px) are badges only — counts,
              NEW, dots. Soft fill = status, identity, filters. Outline =
              counts, tags. Semantic colors = status only. Status always has an
              icon; identity never does.
            </Typography>
          </Box>
        </Box>

        {/* Status family cards */}
        <Stack sx={{ gap: 2 }}>
          <SectionLabel>Status — soft fill + dark text + icon, always</SectionLabel>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(3, 1fr)",
                md: "repeat(5, 1fr)",
              },
              gap: 2,
            }}
          >
            {STATUSES.map((s) => (
              <Box
                key={s.label}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box>
                  <StatusChip
                    label={s.label}
                    severity={s.severity}
                    icon={s.icon}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {s.tint}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {s.examples}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Stack>

        {/* Five families */}
        <Stack sx={{ gap: 2 }}>
          <SectionLabel>Five families</SectionLabel>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <FamilyRow
              name="Status"
              description="System-set state. Soft semantic tint, dark text, icon required. Not clickable."
              examples={
                <StatusChip
                  label="Connected"
                  severity="success"
                  icon="check_circle"
                />
              }
            />
            <FamilyRow
              name="Count / reference"
              description="Counts and links. Outlined neutral. Clickable = indigo text + pointer. Unassigned stays gray."
              examples={
                <>
                  <Chip
                    size="small"
                    variant="outlined"
                    label="3 Sites"
                    clickable
                    onClick={() => {}}
                    sx={{ color: "primary.main", borderColor: "primary.main" }}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label="Unassigned"
                    sx={{ color: "text.secondary" }}
                  />
                </>
              }
            />
            <FamilyRow
              name="Category / tag"
              description="Classifications, many per row. Outlined gray, no icon. Threat categories stay neutral."
              examples={
                <>
                  <Chip size="small" variant="outlined" label="News and Media" />
                  <Chip size="small" variant="outlined" label="Phishing" />
                </>
              }
            />
            <FamilyRow
              name="Categorical identity"
              description="Roles, activity types. Soft pairings tint + dark text. No icon — that's what separates them from status. One hue set per surface."
              examples={
                <>
                  <IdentityChip label="Owner" hue="tertiary" />
                  <IdentityChip label="Super Admin" hue="info" />
                  <IdentityChip label="Admin" hue="error" />
                  <IdentityChip label="Policies Only" hue="primary" />
                </>
              }
            />
            <FamilyRow
              name="Filter / input"
              last
              description="User-made, removable. Soft neutral fill + delete X."
              examples={
                <Chip
                  size="small"
                  label="Bear's Beets"
                  onDelete={() => {}}
                  sx={{ borderRadius: (theme) => theme.spacing(1) }}
                />
              }
            />
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
