// Single-report sample preview — opened from a report card's "View sample"
// link in the Schedule Report builder. Shows the chosen report's document on a
// neutral backdrop, under the same "Preview / Sample data" header the Report
// Library's preview card uses.

import {
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

import { MaterialSymbol } from "@/components/material-symbol";

import { ReportPreview } from "./report-preview";

export function SamplePreviewModal({
  open,
  onClose,
  reportKey,
  title,
  Icon,
  onRunNow,
  onSchedule,
}: {
  open: boolean;
  onClose: () => void;
  /** Footer actions — the two things you can do with the report you're
   *  looking at. */
  onRunNow?: () => void;
  onSchedule?: () => void;
  /** Catalog key — picks the document rendered in the body. */
  reportKey?: string;
  title?: string;
  Icon?: SvgIconComponent;
}) {
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
          gap: 1,
          p: 2,
          bgcolor: "background.paper",
        }}
      >
        {/* Matches the Report Library preview card's header. */}
        <Typography variant="cardTitle">Preview</Typography>
        <Chip label="Sample data" size="small" />
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <MaterialSymbol name="close" size={20} />
        </IconButton>
      </Box>

      {/* Body — the real report document, scaled to the dialog. Inset on the
          paper background so the neutral pane is framed in white, the way the
          Report Library's preview card frames it. */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          p: 2,
          pt: 0,
          bgcolor: "background.paper",
        }}
      >
        <ReportPreview
          reportKey={reportKey ?? ""}
          title={title ?? ""}
          Icon={Icon}
          sx={{ flex: 1, minHeight: 0 }}
        />
      </Box>

      {(onRunNow || onSchedule) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 2,
            bgcolor: "background.paper",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={onClose}
          >
            Close
          </Button>
          <Box sx={{ flex: 1 }} />
          {onRunNow && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => {
                onClose();
                onRunNow();
              }}
            >
              Run Now
            </Button>
          )}
          {onSchedule && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<MaterialSymbol name="add" size={18} />}
              onClick={() => {
                onClose();
                onSchedule();
              }}
            >
              Schedule Report
            </Button>
          )}
        </Box>
      )}
    </Dialog>
  );
}
