// PDF-style cover sheet for a single report. Rendered inside the sample
// preview modal and in the Report Manager Library preview pane. Forced to
// light mode like the real report pages.

import type { SvgIconComponent } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

const SHEET_TEXT = "#031625";
const SHEET_TEXT2 = "rgba(3,22,37,.62)";
const SHEET_DIVIDER = "rgba(3,22,37,.12)";
const PRIMARY = "#3527fd";
export const SAMPLE_RANGE = "Jun 1 – 30, 2026";
export const SAMPLE_ORG = "Acme Manufacturing";

export function ReportCoverSheet({
  title,
  Icon,
}: {
  title?: string;
  Icon?: SvgIconComponent;
}) {
  return (
    <Box
      data-mui-color-scheme="light"
      sx={(theme) => ({
        width: "100%",
        maxWidth: 800,
        minHeight: 600,
        bgcolor: "#fff",
        color: SHEET_TEXT,
        borderRadius: 1,
        boxShadow: theme.shadows[2],
        p: "56px 64px",
      })}
    >
      {/* Brand */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 6 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            bgcolor: PRIMARY,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          BI
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 20, color: SHEET_TEXT }}>
          Brightwave IT
        </Typography>
      </Box>

      {/* Title block */}
      <Typography
        sx={{
          color: PRIMARY,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "2px",
          textTransform: "uppercase",
          mb: 1.5,
        }}
      >
        Sample report
      </Typography>
      <Typography
        component="h2"
        sx={(theme) => ({
          fontFamily: theme.typography.fontSecondaryFamily,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.2,
          color: SHEET_TEXT,
          mb: 2,
        })}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 18, color: SHEET_TEXT }}>
        {SAMPLE_RANGE}
      </Typography>
      <Typography sx={{ fontSize: 18, color: SHEET_TEXT }}>
        {SAMPLE_ORG}
      </Typography>

      <Box sx={{ height: "1px", bgcolor: SHEET_DIVIDER, my: 4 }} />

      {/* Included reports */}
      <Typography
        sx={{
          color: SHEET_TEXT2,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          mb: 2,
        }}
      >
        Included reports
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {Icon && <Box component={Icon} sx={{ fontSize: 22, color: PRIMARY }} />}
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: SHEET_TEXT }}>
          {title}
        </Typography>
      </Box>
    </Box>
  );
}
