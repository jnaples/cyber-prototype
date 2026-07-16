import { Box, Chip, Container, Divider, Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { MaterialSymbol } from "@/components/material-symbol";

// ---------------------------------------------------------------------------
// Status — soft semantic tint + same-hue dark text + icon (Alert tokens)
// ---------------------------------------------------------------------------

type Severity = "success" | "error" | "warning" | "info" | "neutral";

const statusChipSx = (severity: Severity) => (theme: Theme) => {
  const iconLabel = { "& .MuiChip-icon, & .MuiChip-label": { color: "inherit" } };
  if (severity === "neutral") {
    return {
      bgcolor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, transparent)`,
      color: theme.vars.palette.text.secondary,
      ...iconLabel,
    };
  }
  const A = theme.vars.palette.Alert;
  const map = {
    success: { bg: A.successStandardBg, fg: A.successColor },
    error: { bg: A.errorStandardBg, fg: A.errorColor },
    warning: { bg: A.warningStandardBg, fg: A.warningColor },
    info: { bg: A.infoStandardBg, fg: A.infoColor },
  } as const;
  const t = map[severity];
  return { bgcolor: t.bg, color: t.fg, ...iconLabel };
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

// ---------------------------------------------------------------------------
// Categorical identity — soft hue tint + same-hue dark text, no icon
// ---------------------------------------------------------------------------

type Hue =
  | "pairingPurple"
  | "pairingTeal"
  | "pairingRose"
  | "quaternary"
  | "neutral";

const softChipSx = (hue: Hue) => (theme: Theme) => {
  if (hue === "neutral") {
    return {
      bgcolor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, transparent)`,
      color: theme.vars.palette.text.primary,
      "& .MuiChip-label": { color: "inherit" },
    };
  }
  const p = (
    theme.vars.palette as unknown as Record<
      string,
      { main: string; light: string; dark: string }
    >
  )[hue];
  return {
    // Tint = the hue's main mixed with transparent, so it adapts per scheme.
    bgcolor: `color-mix(in srgb, ${p.main} 20%, transparent)`,
    color: p.dark,
    "& .MuiChip-label": { color: "inherit" },
    // Dark mode: brighter text of the same hue + a slightly stronger tint.
    ...theme.applyStyles("dark", {
      bgcolor: `color-mix(in srgb, ${p.main} 30%, transparent)`,
      color: p.light,
    }),
  };
};

function IdentityChip({ label, hue }: { label: string; hue: Hue }) {
  return <Chip size="small" label={label} sx={softChipSx(hue)} />;
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{children}</Box>
  );
}

// A single-scheme preview surface. `data-mui-color-scheme` forces the palette
// for this subtree so both light and dark render on one page.
function ModePanel({
  mode,
  children,
}: {
  mode: "light" | "dark";
  children: React.ReactNode;
}) {
  return (
    <Box
      data-mui-color-scheme={mode}
      sx={{ flex: 1, minWidth: 0, bgcolor: "background.paper", p: 2.5 }}
    >
      <Typography
        variant="overline"
        sx={{ display: "block", color: "text.secondary", mb: 1.5 }}
      >
        {mode}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {children}
      </Box>
    </Box>
  );
}

function FamilySection({
  name,
  description,
  chips,
  footnote,
}: {
  name: string;
  description: string;
  chips: React.ReactNode;
  footnote: React.ReactNode;
}) {
  return (
    <Stack sx={{ gap: 0.75 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 20, color: "text.primary" }}>
        {name}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {description}
      </Typography>
      <Box
        sx={{
          mt: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            "& > *:first-of-type": {
              borderRight: { sm: "1px solid" },
              borderBottom: { xs: "1px solid", sm: "none" },
              borderColor: { xs: "divider", sm: "divider" },
            },
          }}
        >
          <ModePanel mode="light">{chips}</ModePanel>
          <ModePanel mode="dark">{chips}</ModePanel>
        </Box>
        <Divider />
        <Box sx={{ px: 2, py: 1.5, bgcolor: "background.neutral" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {footnote}
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChipsDocs() {
  const statusChips = (
    <>
      <ChipRow>
        <StatusChip label="Active" severity="success" icon="check_circle" />
        <StatusChip label="Blocked" severity="error" icon="block" />
        <StatusChip label="Not Enrolled" severity="warning" icon="warning" />
        <StatusChip label="Syncing" severity="info" icon="sync" />
        <StatusChip label="Pending" severity="neutral" icon="schedule" />
      </ChipRow>
    </>
  );

  const identityChips = (
    <>
      <ChipRow>
        <IdentityChip label="Owner" hue="pairingPurple" />
        <IdentityChip label="Super Admin" hue="pairingTeal" />
        <IdentityChip label="Admin" hue="pairingRose" />
        <IdentityChip label="Policies Only" hue="quaternary" />
      </ChipRow>
      <ChipRow>
        <IdentityChip label="Website" hue="quaternary" />
        <IdentityChip label="Application" hue="pairingPurple" />
        <IdentityChip label="Machine Lock" hue="pairingTeal" />
        <IdentityChip label="Idle" hue="neutral" />
      </ChipRow>
    </>
  );

  const countChips = (
    <ChipRow>
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
        label="1 Filtering Schedule"
        clickable
        onClick={() => {}}
        sx={{ color: "primary.main", borderColor: "primary.main" }}
      />
      <Chip size="small" variant="outlined" label="23 Clients" />
      <Chip
        size="small"
        variant="outlined"
        label="Unassigned"
        sx={{ color: "text.secondary" }}
      />
    </ChipRow>
  );

  const categoryChips = (
    <ChipRow>
      {["News & Media", "Information Technology", "Phishing", "Azure AD"].map(
        (l) => (
          <Chip
            key={l}
            size="small"
            variant="outlined"
            label={l}
            sx={{ color: "text.secondary" }}
          />
        ),
      )}
    </ChipRow>
  );

  const filterChips = (
    <ChipRow>
      {["Bear's Beets", "Last 30 minutes", "8 users"].map((l) => (
        <Chip
          key={l}
          size="small"
          label={l}
          onDelete={() => {}}
          sx={{ borderRadius: (theme) => theme.spacing(1) }}
        />
      ))}
    </ChipRow>
  );

  const badgeChips = (
    <ChipRow>
      <Chip
        size="small"
        label="NEW"
        sx={{
          borderRadius: 999,
          fontWeight: 700,
          bgcolor: "tertiary.main",
          color: "tertiary.contrastText",
        }}
      />
      <Chip
        size="small"
        label="10"
        sx={{
          borderRadius: 999,
          bgcolor: "tertiary.main",
          color: "tertiary.contrastText",
        }}
      />
      <Chip
        size="small"
        label="MSP"
        sx={{
          borderRadius: 999,
          fontWeight: 700,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      />
    </ChipRow>
  );

  return (
    <Container maxWidth="lg">
      <Stack sx={{ p: 4, gap: 4 }}>
        <Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: 26, color: "text.primary" }}
          >
            Chip System — Visual Reference
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
            Five families, one grammar. Soft fill = status, identity, or filter
            selection. Outline = counts and tags. Semantic colors belong to
            status only. Status always has an icon; identity never does. Every
            chip is 6px radius — pills are badges, not chips.
          </Typography>
        </Box>

        <FamilySection
          name="Status"
          description="System-set state. Soft semantic tint + same-hue dark text + icon. Never clickable."
          chips={statusChips}
          footnote="success: Active · Connected · Enabled · Allowed  |  error: Error · Blocked · Failed  |  warning: Authorization Required · Not Enrolled · Syncing with Errors  |  info: Syncing · In Progress  |  neutral: Pending · Disabled · Paused · Not Configured · Idle · Unknown"
        />

        <FamilySection
          name="Categorical identity"
          description="Roles and activity types. Soft pairings tint + same-hue dark text. No icon — that's what separates identity from status. One hue set per surface."
          chips={identityChips}
          footnote="Row 1 — Users table roles: pairingPurple · pairingTeal · pairingRose · quaternary. Row 2 — CyberSight activity types: quaternary · pairingPurple · pairingTeal · neutral. Tint = the hue's main mixed toward transparent (color-mix)."
        />

        <FamilySection
          name="Count / reference"
          description="Relationship counts and entity links. Outlined neutral, transparent fill. Clickable = indigo text + pointer. Never semantic color."
          chips={countChips}
          footnote="Border: chip default border. Clickable text: primary.main. Counts and Unassigned stay neutral (text.secondary)."
        />

        <FamilySection
          name="Category / tag"
          description="Classifications — many per row. Outlined gray, transparent, no icon. Threat categories stay neutral: status carries the risk signal."
          chips={categoryChips}
          footnote="Border: chip default border. Text: text.secondary."
        />

        <FamilySection
          name="Filter / input"
          description="User-created, removable. Soft neutral fill + delete X. No border. Matches the data-table filter chips."
          chips={filterChips}
          footnote="Neutral filled chip + delete X, spacing(1) radius — identical to the Active Filters chips in our grids."
        />

        <FamilySection
          name="Badges — not chips"
          description={
            'Tiny attention markers. The only 999px pills in the system. Pill says "look here," 6px says "read me."'
          }
          chips={badgeChips}
          footnote="Fill: tertiary.main or primary.main. Text: contrastText. Type: badge/label — not a chip."
        />

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          <strong>Note:</strong> semantic and pairing colors come from our theme
          tokens (success, error, warning, info, primary, tertiary, quaternary,
          pairingPurple / Teal / Rose). Soft tints are generated with{" "}
          <code>color-mix</code> over the hue&rsquo;s <code>main</code>, so they
          adapt per scheme. Verify the Super Admin teal tint reads distinct from
          the success green tint, and check contrast on every pair in both
          modes.
        </Typography>
      </Stack>
    </Container>
  );
}
