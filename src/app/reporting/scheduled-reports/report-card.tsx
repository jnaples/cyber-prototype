// A report as a card: its name and product chips, a blurb, and a thumbnail of
// the real document with the actions behind a hover scrim. Rendered on an
// elevated Card so it lifts off the Library's neutral well.

import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import {
  Box,
  Button,
  Card,
  Chip,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";

import { ReportPreview } from "./report-preview";

export function ReportCard({
  reportKey,
  title,
  desc,
  Icon,
  products = [],
  onClick,
  onPreview,
  onRunNow,
  runLabel = "Run Now",
  onSchedule,
  height = 400,
}: {
  /** Catalog key — decides which document the thumbnail renders. */
  reportKey: string;
  title: string;
  desc: string;
  Icon?: SvgIconComponent;
  /** Products the report belongs to, e.g. ["CyberSight"] or ["Filtering"]. */
  products?: string[];
  onClick?: () => void;
  /** Hover actions. Preview shows the document; the Create Report menu either
   *  runs the report now or takes the user to the scheduler. */
  onPreview?: () => void;
  onRunNow?: () => void;
  /** Label for the run action — a custom report is created, not run. */
  runLabel?: string;
  onSchedule?: () => void;
  height?: number;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  // With one action there's nothing to choose between, so the button just
  // does it; with both, it opens the menu.
  const templateActions = [
    { label: runLabel, run: onRunNow },
    { label: "Schedule Report", run: onSchedule },
  ].filter((action): action is { label: string; run: () => void } =>
    Boolean(action.run),
  );
  // The menu's backdrop takes the pointer, so :hover stops matching — the
  // overlay stays put while the menu is open.
  const menuOpen = Boolean(menuAnchor);
  const hasActions = Boolean(onPreview || onRunNow || onSchedule);
  return (
    <Card
      elevation={1}
      onClick={onClick}
      sx={(theme) => ({
        height,
        display: "flex",
        flexDirection: "column",
        // One 16px inset on the card itself — the text block and the preview
        // pane both sit inside it, separated by the same 16px.
        p: 2,
        gap: 2,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "background 120ms",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          ".report-card-actions": { opacity: 1, pointerEvents: "auto" },
        },
      })}
    >
      {/* Title row — chips sit opposite the name; the blurb runs under both. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            sx={(theme) => ({
              // Montserrat, as the report titles are set in the documents.
              fontFamily: theme.typography.fontSecondaryFamily,
              fontWeight: 600,
              fontSize: 16,
              minWidth: 0,
            })}
          >
            {title}
          </Typography>
          {products.length > 0 && (
            <Box sx={{ display: "flex", flexShrink: 0, gap: 1 }}>
              {products.map((product) => (
                <Chip
                  key={product}
                  label={product}
                  size="small"
                  variant="outlined"
                  // Each product in its own colour: Filtering blue, CyberSight
                  // the threat magenta. Chip's `color` prop has no tertiary,
                  // so the palette is applied directly.
                  sx={(theme) => {
                    // theme.vars resolves per scheme; theme.palette would
                    // freeze the light values into both.
                    const tone =
                      product === "CyberSight"
                        ? theme.vars.palette.tertiary
                        : theme.vars.palette.primary;
                    return {
                      borderColor: tone.main,
                      color: tone.main,
                      // Full-strength primary is too dark on the dark surface.
                      ...theme.applyStyles("dark", {
                        borderColor: tone.light,
                        color: tone.light,
                      }),
                    };
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {desc}
        </Typography>
      </Box>

      {/* A thumbnail of the real document, cropped to the top of the page —
          enough to recognise the report by. */}
      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "background.neutral",
        }}
      >
        <ReportPreview
          reportKey={reportKey}
          title={title}
          Icon={Icon}
          sx={{
            height: "100%",
            alignItems: "flex-start",
            p: 3,
            pointerEvents: "none",
          }}
        />

        {/* Hover actions over the same scrim the drawers dim the page with. */}
        {hasActions && (
          <Box
            className="report-card-actions"
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              // Side by side from lg up; below that the two buttons would
              // squeeze each other in a narrower card.
              flexDirection: { xs: "column", lg: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              opacity: menuOpen ? 1 : 0,
              transition: "opacity 120ms",
              pointerEvents: menuOpen ? "auto" : "none",
            }}
          >
            {onPreview && (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onPreview();
                }}
              >
                Preview
              </Button>
            )}
            {templateActions.length > 0 && (
              // Same shape as the Dashboards header's Actions button.
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  if (templateActions.length === 1) {
                    templateActions[0].run();
                    return;
                  }
                  setMenuAnchor(event.currentTarget);
                }}
                endIcon={
                  templateActions.length > 1 ? (
                    <ArrowDropDownOutlinedIcon sx={{ opacity: 0.6 }} />
                  ) : undefined
                }
              >
                {templateActions.length === 1
                  ? templateActions[0].label
                  : "Create Report"}
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {templateActions.map((action) => (
          <MenuItem
            key={action.label}
            onClick={(event) => {
              event.stopPropagation();
              setMenuAnchor(null);
              action.run();
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
}
