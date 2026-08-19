// A report as a card: a thumbnail of the real document, its name and blurb,
// and a chip per product it belongs to. Shared so any surface listing reports
// (Library, and the v2 proof of concept) renders them the same way.

import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import { Box, Button, Chip, Menu, MenuItem, Typography } from "@mui/material";
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
  onSchedule,
  height = 320,
}: {
  /** Catalog key — decides which document the thumbnail renders. */
  reportKey: string;
  title: string;
  desc: string;
  Icon?: SvgIconComponent;
  /** Products the report belongs to, e.g. ["CyberSight"] or ["Filtering"]. */
  products?: string[];
  onClick?: () => void;
  /** Hover actions. Preview shows the document; the Use template menu either
   *  runs the report now or takes the user to the scheduler. */
  onPreview?: () => void;
  onRunNow?: () => void;
  onSchedule?: () => void;
  height?: number;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  // With one action there's nothing to choose between, so the button just
  // does it; with both, it opens the menu.
  const templateActions = [
    { label: "Run Now", run: onRunNow },
    { label: "Schedule Report", run: onSchedule },
  ].filter((action): action is { label: string; run: () => void } =>
    Boolean(action.run),
  );
  // The menu's backdrop takes the pointer, so :hover stops matching — the
  // overlay stays put while the menu is open.
  const menuOpen = Boolean(menuAnchor);
  const hasActions = Boolean(onPreview || onRunNow || onSchedule);
  return (
    <Box
      onClick={onClick}
      sx={(theme) => ({
        height,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        // The card's own surface shows as a gutter around the thumbnail.
        p: 2,
        overflow: "hidden",
        // Same frame and hover tint the v2 tab's cards use.
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        cursor: onClick ? "pointer" : "default",
        transition: "background 120ms",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          ".report-card-actions": { opacity: 1, pointerEvents: "auto" },
        },
      })}
    >
      {/* A thumbnail of the real document, cropped to the top of the page —
          enough to recognise the report by. */}
      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "background.neutral",
          borderRadius: 1,
        }}
      >
        {reportKey === "custom" ? (
          // Same framing the document previews get: a white page inset on the
          // neutral pane, running off the bottom edge like a cropped document.
          <Box sx={{ height: "100%", p: 1, pb: 0 }}>
            <Box
              sx={{
                height: "100%",
                // The report documents and CSV sheets are square-cornered white
                // pages with a hairline edge; this stand-in matches.
                bgcolor: "#fff",
                // Same edge the report documents draw.
                border: "0.5px solid #E5E5EC",
                borderBottom: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src="/report-icon.svg"
                alt=""
                sx={{ width: 80, height: "auto", opacity: 0.9 }}
              />
            </Box>
          </Box>
        ) : (
          <ReportPreview
            reportKey={reportKey}
            title={title}
            Icon={Icon}
            sx={{
              height: "100%",
              alignItems: "flex-start",
              p: 1,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Hover actions over the same scrim the drawers dim the page with. */}
        {hasActions && (
          <Box
            className="report-card-actions"
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
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
                  : "Use Template"}
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

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography
          sx={(theme) => ({
            // Montserrat, as the report titles are set in the documents.
            fontFamily: theme.typography.fontSecondaryFamily,
            fontWeight: 600,
            fontSize: 16,
          })}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {desc}
        </Typography>
        {products.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
            {products.map((product) => (
              <Chip
                key={product}
                label={product}
                size="small"
                variant="outlined"
                color="secondary"
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
