// Single-report sample preview — opened from a report card's "Preview sample"
// link in the Schedule Report builder. Shows a PDF-style cover sheet for the
// chosen report on a neutral backdrop, with a "sample
// data" badge. The sheet is forced to light mode like the real report pages.

import { Box, Chip, Dialog, IconButton, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

import { MaterialSymbol } from "@/components/material-symbol";

import { SAMPLE_ORG, SAMPLE_RANGE } from "./report-cover-sheet";
import { ReportPreview } from "./report-preview";

export function SamplePreviewModal({
  open,
  onClose,
  reportKey,
  title,
  Icon,
}: {
  open: boolean;
  onClose: () => void;
  /** Catalog key — picks the document rendered in the body. */
  reportKey?: string;
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
        <MaterialSymbol
          name="picture_as_pdf"
          size={28}
          sx={{ color: "#d93025" }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }} noWrap>
            {fileName}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {SAMPLE_RANGE} · Prepared for {SAMPLE_ORG}
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
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <MaterialSymbol name="close" size={20} />
        </IconButton>
      </Box>

      {/* Body — the real report document, scaled to the dialog */}
      <ReportPreview
        reportKey={reportKey ?? ""}
        title={title ?? ""}
        Icon={Icon}
        sx={{ flex: 1, minHeight: 0, borderRadius: 0, p: 3 }}
      />
    </Dialog>
  );
}
