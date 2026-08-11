// Renders a report's document scaled to fit whatever pane it's dropped into.
// Used by the Templates tab's preview card and by the "Preview sample" modal in
// the Schedule Report builder.

import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";

import type { SvgIconComponent } from "@mui/icons-material";

import { ReportCoverSheet } from "./report-cover-sheet";
import { REPORT_PAGES } from "./report-pages";

// The report documents are laid out on a fixed 1400px canvas; scale them down
// to whatever width the preview pane actually has.
const DOC_WIDTH = 1400;

// Gap left under a viewport-filling preview so it doesn't touch the edge.
const PANE_BOTTOM_GUTTER = 16;

// Measures the pane (for the scale factor) and the unscaled document (for the
// height the scaled copy will actually occupy) — a transformed element keeps
// its original layout box, so the wrapper has to be sized explicitly or the
// scroll container clips the bottom of the report.
function useFitScale(deps: unknown, fitViewport: boolean) {
  const paneRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [docHeight, setDocHeight] = useState(0);
  const [paneMaxHeight, setPaneMaxHeight] = useState<number>();

  useEffect(() => {
    const pane = paneRef.current;
    const doc = docRef.current;
    if (!pane) return;

    // Everything from the pane's top edge to the bottom of the viewport is
    // fair game for a preview that should fill the screen.
    const measureHeight = () => {
      if (!fitViewport) return;
      setPaneMaxHeight(
        Math.max(
          240,
          window.innerHeight -
            pane.getBoundingClientRect().top -
            PANE_BOTTOM_GUTTER,
        ),
      );
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === pane) {
          setScale(Math.min(1, entry.contentRect.width / DOC_WIDTH));
          measureHeight();
        } else {
          setDocHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(pane);
    if (doc) observer.observe(doc);
    window.addEventListener("resize", measureHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureHeight);
    };
  }, [deps, fitViewport]);

  return { paneRef, docRef, scale, docHeight, paneMaxHeight };
}

export function ReportPreview({
  reportKey,
  title,
  Icon,
  fitViewport = false,
  sx,
}: {
  /** Catalog key — decides which document renders. */
  reportKey: string;
  title: string;
  Icon?: SvgIconComponent;
  /** Cap the pane's height at the space left below it in the viewport. */
  fitViewport?: boolean;
  sx?: SxProps<Theme>;
}) {
  const ReportPage = REPORT_PAGES[reportKey];
  const { paneRef, docRef, scale, docHeight, paneMaxHeight } = useFitScale(
    reportKey,
    fitViewport,
  );

  return (
    <Box
      ref={paneRef}
      sx={[
        {
          minWidth: 0,
          overflowX: "hidden",
          overflowY: "auto",
          bgcolor: "background.neutral",
          borderRadius: 1,
          p: 2,
          display: "flex",
          justifyContent: "center",
          maxHeight: paneMaxHeight,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {ReportPage ? (
        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
            width: DOC_WIDTH * scale,
            height: docHeight * scale,
          }}
        >
          <Box
            ref={docRef}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: DOC_WIDTH,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}
          >
            <ReportPage />
          </Box>
        </Box>
      ) : (
        <ReportCoverSheet title={title} Icon={Icon} />
      )}
    </Box>
  );
}
