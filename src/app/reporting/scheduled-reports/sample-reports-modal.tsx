// "Preview Reports" modal — the report catalog with a side list, and the real
// sample document rendered beside it. Same reports, icons and names as the
// Report Library, so the two never drift.

import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { MaterialSymbol } from "@/components/material-symbol";

import { ReportPreview } from "./report-preview";
import { REPORTS } from "./reports";

// A custom report is built to order, so there's no sample of it to show.
const SAMPLE_REPORTS = REPORTS.filter((r) => r.key !== "custom");

export function SampleReportsModal({
  open,
  onClose,
  onChoose,
}: {
  open: boolean;
  onClose: () => void;
  /** Fired with the report the user picked; the modal closes itself first. */
  onChoose?: (reportKey: string) => void;
}) {
  const [selectedKey, setSelectedKey] = useState(SAMPLE_REPORTS[0].key);
  const selected =
    SAMPLE_REPORTS.find((r) => r.key === selectedKey) ?? SAMPLE_REPORTS[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      // md — the theme's medium breakpoint, 900px.
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          elevation: 1,
          sx: {
            height: "min(760px, 90vh)",
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
          px: 2.5,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="cardTitle">Preview Reports</Typography>
        <Chip label="Sample data" size="small" />
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <MaterialSymbol name="close" size={20} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Report list */}
        <Box
          sx={{
            width: 250,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            p: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {SAMPLE_REPORTS.map((report) => {
            const on = report.key === selectedKey;
            return (
              <Box
                key={report.key}
                onClick={() => setSelectedKey(report.key)}
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  color: on ? "text.primary" : "text.secondary",
                  // Match the data-grid selected-row tint.
                  bgcolor: on
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                  "&:hover": {
                    bgcolor: on
                      ? alpha(theme.palette.primary.main, 0.12)
                      : theme.palette.action.hover,
                  },
                })}
              >
                <Box
                  component={report.Icon}
                  sx={{ fontSize: 20, flexShrink: 0 }}
                />
                <Typography variant="body1">{report.title}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* The document itself, not a mock of it. */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", p: 2 }}>
          <ReportPreview
            reportKey={selected.key}
            title={selected.title}
            Icon={selected.Icon}
            sx={{ flex: 1, maxHeight: "100%" }}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          borderTop: "1px solid",
          borderColor: "divider",
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
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            onClose();
            onChoose?.(selected.key);
          }}
        >
          Select
        </Button>
      </Box>
    </Dialog>
  );
}
