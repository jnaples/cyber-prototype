// Single-report sample preview — opened from a report card's "Preview sample"
// link in the Schedule Report builder. Shows a PDF-style cover sheet for the
// chosen report on a neutral backdrop, with a Download action and a "sample
// data" badge. The sheet is forced to light mode like the real report pages.

import { Box, Button, Chip, Dialog, IconButton, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

import { MaterialSymbol } from "@/components/material-symbol";

const SHEET_TEXT = "#031625";
const SHEET_TEXT2 = "rgba(3,22,37,.62)";
const SHEET_DIVIDER = "rgba(3,22,37,.12)";
const PRIMARY = "#3527fd";
const RANGE = "Jun 1 – 30, 2026";
const ORG = "Acme Manufacturing";

export function SamplePreviewModal({
  open,
  onClose,
  title,
  Icon,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  Icon?: SvgIconComponent;
}) {
  const fileName = title ? `${title} — Sample.pdf` : "Sample.pdf";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          elevation: 1,
          sx: {
            width: 1080,
            maxWidth: "95vw",
            height: "min(880px, 92vh)",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <MaterialSymbol name="picture_as_pdf" size={28} sx={{ color: "#d93025" }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }} noWrap>
            {fileName}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {RANGE} · Prepared for {ORG}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Chip
          label="Sample data"
          size="small"
          sx={(theme) => ({
            bgcolor: theme.vars.palette.Alert.warningStandardBg,
            color: theme.vars.palette.Alert.warningColor,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          })}
        />
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<MaterialSymbol name="download" size={18} />}
        >
          Download
        </Button>
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <MaterialSymbol name="close" size={20} />
        </IconButton>
      </Box>

      {/* Body — neutral backdrop with a centered PDF sheet */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          bgcolor: "background.neutral",
          p: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
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
          <Typography sx={{ fontSize: 18, color: SHEET_TEXT }}>{RANGE}</Typography>
          <Typography sx={{ fontSize: 18, color: SHEET_TEXT }}>
            Prepared for {ORG}
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
      </Box>
    </Dialog>
  );
}
