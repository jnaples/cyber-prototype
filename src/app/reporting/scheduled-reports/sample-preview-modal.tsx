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
  Link,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";

import { MaterialSymbol } from "@/components/material-symbol";

import { openBilling } from "./entitlements";
import { ReportPreview } from "./report-preview";
import { UpgradePill } from "./upgrade-badge";

export function SamplePreviewModal({
  open,
  onClose,
  reportKey,
  title,
  Icon,
  onRunNow,
  onSchedule,
  locked = false,
  onUpgrade,
}: {
  open: boolean;
  onClose: () => void;
  /** Footer actions — the two things you can do with the report you're
   *  looking at. */
  /** Runs the report now. Omit where one action covers both. */
  onRunNow?: () => void;
  onSchedule?: () => void;
  /** The organization's plan doesn't include this report — the footer offers
   *  the upgrade instead of running or scheduling it. */
  locked?: boolean;
  onUpgrade?: () => void;
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
      {/* Header — the licensing note belongs with the title, 8px under it. */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 2,
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Matches the Report Library preview card's header. */}
          <Typography variant="cardTitle">Preview Report</Typography>
          <Chip label="Sample data" size="small" />
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" aria-label="Close" onClick={onClose}>
            <MaterialSymbol name="close" size={20} />
          </IconButton>
        </Box>

        {/* Why the footer offers an upgrade instead of running the report. */}
        {locked && (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <UpgradePill />
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              This organization is not licensed for CyberSight. Upgrade your
              plan to gain access to this feature.{" "}
              <Link
                component="button"
                type="button"
                underline="none"
                onClick={openBilling}
                sx={(theme) => ({
                  fontWeight: 700,
                  verticalAlign: "baseline",
                  ...theme.applyStyles("dark", {
                    color: theme.vars.palette.primary.light,
                  }),
                })}
              >
                Upgrade now
              </Link>
            </Typography>
          </Box>
        )}
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

      {(locked || onRunNow || onSchedule) && (
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
          {/* Locked: upgrading is the only thing left to do here. */}
          {locked && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<ArrowCircleUpOutlinedIcon />}
              onClick={onUpgrade}
            >
              Upgrade Now
            </Button>
          )}
          {/* Two actions where the surface separates running from scheduling;
              one where a single drawer covers both. */}
          {!locked && onRunNow && (
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
          {!locked && onSchedule && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={
                onRunNow ? <MaterialSymbol name="add" size={18} /> : undefined
              }
              onClick={() => {
                onClose();
                onSchedule();
              }}
            >
              {onRunNow ? "Schedule Report" : "Generate report"}
            </Button>
          )}
        </Box>
      )}
    </Dialog>
  );
}
