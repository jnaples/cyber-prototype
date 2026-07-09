// Floating widget preview shown when hovering an item in the Add Widget
// drawer. Rendered through a Portal so it escapes the drawer's clipping /
// transform, floats just left of the drawer, and is vertically anchored to the
// hovered row (clamped so the whole card stays on screen). Mount it with
// `key={type}` so switching widgets remounts and re-measures cleanly.

import { Box, Paper, Portal, Typography } from "@mui/material";
import { useCallback, useState } from "react";

import { CATALOG_BY_TYPE, HEADERLESS } from "./lib";
import { WidgetBody } from "./widgets";

// The drawer is 380px wide; leave a 16px gap to its left.
const DRAWER_GAP = 396;
const TOP_MARGIN = 12;
// Keep a larger gap from the bottom of the page so cards sit slightly higher.
const BOTTOM_MARGIN = 48;

export function WidgetPreview({
  type,
  anchorY,
}: {
  type: string;
  /** Vertical center (viewport px) of the hovered row. */
  anchorY: number;
}) {
  const [top, setTop] = useState(0);
  const [ready, setReady] = useState(false);
  const compact = HEADERLESS(type);

  // Callback ref: fires once the portaled card is actually in the DOM, so we
  // can measure its real height and clamp its center to keep it fully visible.
  const measureRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      const vh = window.innerHeight;
      const half = el.offsetHeight / 2;
      setTop(
        half * 2 + TOP_MARGIN + BOTTOM_MARGIN >= vh
          ? vh / 2 // taller than viewport: center it (maxHeight caps overflow)
          : Math.min(
              Math.max(anchorY, TOP_MARGIN + half),
              vh - BOTTOM_MARGIN - half,
            ),
      );
      setReady(true);
    },
    [anchorY],
  );

  return (
    <Portal>
      <Box
        ref={measureRef}
        sx={(theme) => ({
          position: "fixed",
          right: DRAWER_GAP,
          top,
          transform: "translateY(-50%)",
          // KPI / status previews are square; charts stay wide.
          width: compact ? 200 : 360,
          zIndex: theme.zIndex.modal + 2,
          pointerEvents: "none",
          opacity: ready ? 1 : 0,
        })}
      >
        <Paper
          // Match the actual widget's resting elevation (1) so the dark-mode
          // background overlay is identical, but keep an elevation-8 shadow.
          elevation={1}
          sx={(theme) => ({
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 24px)",
            boxShadow: theme.shadows[8],
            ...(compact && { aspectRatio: "1 / 1" }),
          })}
        >
          {!compact && (
            <Box sx={{ px: 2, pt: 2 }}>
              <Typography
                sx={{ fontWeight: 600, fontSize: 15, color: "text.primary" }}
              >
                {CATALOG_BY_TYPE[type]?.name ?? type}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              p: compact ? 1.5 : 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <WidgetBody type={type} />
          </Box>
        </Paper>
      </Box>
    </Portal>
  );
}
