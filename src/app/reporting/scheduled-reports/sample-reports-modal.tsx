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

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { useOrgScope } from "@/hooks/use-org-scope";

import { cyberSightLocked } from "./entitlements";
import { ReportPreview } from "./report-preview";
import { REPORTS } from "./reports";
import { UpgradeBadge, UpgradeNotice } from "./upgrade-badge";

// A custom report is built to order, so there's no sample of it to show.
// Same two the Library hides: neither has a home yet.
const SAMPLE_REPORTS = REPORTS.filter(
  (r) => r.key !== "custom" && r.key !== "traffic",
);

// The list reads product by product, the way the side nav groups its
// destinations: Filtering first, then CyberSight.
const PRODUCT_ORDER = ["Filtering", "CyberSight"];

const SAMPLE_GROUPS = PRODUCT_ORDER.map(
  (product) =>
    [
      product,
      SAMPLE_REPORTS.filter((r) => (r.products ?? []).includes(product)),
    ] as const,
).filter(([, reports]) => reports.length > 0);

export function SampleReportsModal({
  open,
  onClose,
  onChoose,
  organization: organizationProp,
}: {
  open: boolean;
  onClose: () => void;
  /** The organization the caller is reporting on, when it knows one — a form's
   *  own selection beats the header's drill-down. */
  organization?: string | null;
  /** Fired with the report the user picked; the modal closes itself first. */
  onChoose?: (reportKey: string) => void;
}) {
  // Drilled into a Filtering-only organization? Its CyberSight samples can be
  // read but not chosen.
  const { organization: scopedOrg } = useOrgScope();
  const organization = organizationProp || scopedOrg;
  const lockedFor = (products?: string[]) =>
    cyberSightLocked(organization, products);

  const [selectedKey, setSelectedKey] = useState(SAMPLE_REPORTS[0].key);
  const selected =
    SAMPLE_REPORTS.find((r) => r.key === selectedKey) ?? SAMPLE_REPORTS[0];
  const selectedLocked = lockedFor(selected.products);

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
          {SAMPLE_GROUPS.map(([product, reports], groupIndex) => (
            <Box key={product}>
              {/* Same overline heading the side nav sections use. */}
              <Typography
                component="div"
                variant="overline"
                sx={{
                  px: 1,
                  mt: groupIndex === 0 ? 0 : 2,
                  mb: 0.5,
                  lineHeight: 1.4,
                  color: "text.secondary",
                }}
              >
                {product}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {reports.map((report) => {
                  const on = report.key === selectedKey;
                  const locked = lockedFor(report.products);
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
                        color: locked
                          ? "text.disabled"
                          : on
                            ? "text.primary"
                            : "text.secondary",
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
                      <Typography variant="body1" sx={{ minWidth: 0 }}>
                        {report.title}
                      </Typography>
                      {locked && (
                        <>
                          <Box sx={{ flex: 1 }} />
                          <UpgradeBadge />
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
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
        {/* The sample is readable either way; only using it needs the
            licence, and the disabled button says why. */}
        <ArrowTooltip title={selectedLocked ? <UpgradeNotice /> : ""}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              cursor: selectedLocked ? "not-allowed" : undefined,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={selectedLocked}
              onClick={() => {
                onClose();
                onChoose?.(selected.key);
              }}
            >
              Use this report
            </Button>
          </Box>
        </ArrowTooltip>
      </Box>
    </Dialog>
  );
}
