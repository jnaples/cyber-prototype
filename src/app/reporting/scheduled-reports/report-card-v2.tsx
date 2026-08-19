// A second take on the report card, for the Library v2 proof of concept.
//
// Where the shipping card leads with the name and hides its actions behind a
// hover scrim, this one leads with the document, labels it underneath next to
// the report's icon, and keeps the actions on the card at all times — nothing
// is discoverable only by hovering.

import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import { Box, Button, Chip, Menu, MenuItem, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";

import { ReportPreview } from "./report-preview";

export function ReportCardV2({
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
  /** Footer actions. Preview shows the document; Use Template either runs the
   *  report now or takes the user to the scheduler. */
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
  return (
    <Box
      onClick={onClick}
      sx={(theme) => ({
        height,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        cursor: onClick ? "pointer" : "default",
        transition: "background 120ms",
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
      })}
    >
      {/* The document leads — cropped to the top of the page, which is the
          part that identifies the report. */}
      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "background.neutral",
          borderBottom: "1px solid",
          borderColor: "divider",
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
      </Box>

      {/* Name, blurb and chips, with the report's icon as the anchor. */}
      <Box sx={{ p: 2, display: "flex", gap: 1.5 }}>
        {Icon && (
          <Box
            sx={(theme) => ({
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // Full-strength primary is too dark on the dark surface.
              ...theme.applyStyles("dark", {
                color: theme.vars.palette.primary.light,
              }),
            })}
          >
            <Box component={Icon} sx={{ fontSize: 20 }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
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
                    // Each product in its own colour: Filtering blue,
                    // CyberSight the threat magenta. Chip's `color` prop has no
                    // tertiary, so the palette is applied directly.
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
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            {desc}
          </Typography>
        </Box>
      </Box>

      {/* Actions stay on the card rather than behind a hover state. */}
      <Box
        sx={{
          px: 2,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        {onPreview && (
          <Button
            variant="outlined"
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
              : "Use Template"}
          </Button>
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
    </Box>
  );
}
