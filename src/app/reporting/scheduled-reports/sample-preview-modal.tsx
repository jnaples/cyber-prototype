// Single-report sample preview — opened from a report card's "View sample"
// link in the Schedule Report builder. Shows the chosen report's document on a
// neutral backdrop, under the same "Preview / Sample data" header the Report
// Library's preview card uses.

import { Alert, Box, Button, Chip, Link } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";

import { MaterialSymbol } from "@/components/material-symbol";

import { openBilling } from "./entitlements";
import { PanelModal } from "@/components/panel-modal";

import { ReportPreview } from "./report-preview";

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
    <PanelModal
      open={open}
      onClose={onClose}
      title="Preview Report"
      titleAlign="left"
      titleAdornment={<Chip label="Sample data" size="small" />}
      width={1080}
      // Why the footer offers an upgrade instead of running the report.
      headerContent={
        locked && (
          <Alert
            severity="info"
            variant="standard"
            icon={<ArrowCircleUpOutlinedIcon fontSize="inherit" />}
            sx={{ "& .MuiAlert-icon": { mr: 1 } }}
          >
            This organization is not licensed for CyberSight. Upgrade your plan
            to gain access to this feature.{" "}
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={openBilling}
              sx={{
                fontWeight: 700,
                color: "inherit",
                verticalAlign: "baseline",
              }}
            >
              Upgrade now
            </Link>
          </Alert>
        )
      }
      bodySx={{ display: "flex" }}
      actions={
        <>
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
        </>
      }
    >
      <ReportPreview
        reportKey={reportKey ?? ""}
        title={title ?? ""}
        Icon={Icon}
        sx={{ flex: 1, minHeight: 0 }}
      />
    </PanelModal>
  );
}
