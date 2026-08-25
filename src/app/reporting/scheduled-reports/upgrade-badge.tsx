// The badge on a report the organization's plan doesn't include: a blue pill
// holding the upgrade arrow, with the licensing note and the link behind it.
// Shared so the Report type dropdown and the Preview Reports list read alike.

import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";
import { alpha, Box, Link } from "@mui/material";
import type { BoxProps } from "@mui/material";

import { ArrowTooltip } from "@/components/arrow-tooltip";

import { openBilling } from "./entitlements";

/** The pill on its own — for places that explain themselves in prose. The
 *  props (ref and hover handlers included) pass through, so a Tooltip can
 *  wrap it. */
export function UpgradePill(props: BoxProps) {
  return (
    <Box
      {...props}
      sx={(theme) => ({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        p: 0.5,
        borderRadius: "999px",
        bgcolor: alpha(theme.palette.primary.main, 0.12),
        color: theme.vars.palette.primary.main,
        ...theme.applyStyles("dark", {
          bgcolor: alpha(theme.palette.primary.light, 0.16),
          color: theme.vars.palette.primary.light,
        }),
      })}
    >
      <ArrowCircleUpOutlinedIcon sx={{ fontSize: 18 }} />
    </Box>
  );
}

/** The licensing note and its link — the text every locked surface shows. */
export function UpgradeNotice() {
  return (
    <>
      This organization is not licensed for CyberSight. Upgrade your plan to
      gain access to this feature.{" "}
      <Link
        component="button"
        type="button"
        onClick={openBilling}
        underline="always"
        sx={{
          fontWeight: 700,
          color: "inherit",
          textDecoration: "underline",
          verticalAlign: "baseline",
        }}
      >
        Upgrade now
      </Link>
    </>
  );
}

export function UpgradeBadge() {
  return (
    <ArrowTooltip title={<UpgradeNotice />}>
      <UpgradePill />
    </ArrowTooltip>
  );
}
