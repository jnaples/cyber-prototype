// Downloads a report run as a PDF of the actual report document — the same
// page the Templates / sample previews render, charts and tables included.
//
// The document is mounted offscreen, captured with html-to-image, and placed
// into a jsPDF page sized to it, so the file saves on click with no print
// dialog. html-to-image serializes the DOM into an SVG foreignObject and lets
// the browser paint it, which is why the MUI X charts and the reports' modern
// CSS colors survive the capture.

import { GlobalStyles } from "@mui/material";
import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { REPORT_PAGES } from "./report-pages";

// The documents are laid out on a fixed 1400px canvas.
const DOC_WIDTH = 1400;

const PRINT_ROOT_ID = "report-print-root";

// Capture scale. 3x keeps small type crisp when the PDF is zoomed or printed.
const PIXEL_RATIO = 3;

// High enough that JPEG ringing around small text isn't visible.
const JPEG_QUALITY = 0.95;

// Long enough for the charts to finish their entrance animation — capturing
// mid-animation gives a half-drawn trend line.
const SETTLE_MS = 450;

export function ReportPrintDocument({
  reportKey,
  fileName,
  onDone,
}: {
  /** Catalog key — picks which report document is captured. */
  reportKey: string;
  /** Saved file name, without the .pdf extension. */
  fileName: string;
  /** Called once the file has saved, or immediately if it can't be produced. */
  onDone: () => void;
}) {
  const ReportPage = REPORT_PAGES[reportKey];
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = docRef.current;
    if (!ReportPage || !node) {
      onDone();
      return;
    }
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        // Measured, not assumed: the query-log document lays out a table wider
        // than the standard canvas, and a fixed width would crop its last
        // columns out of the PDF.
        const width = Math.max(DOC_WIDTH, node.scrollWidth);
        const height = node.scrollHeight;
        // JPEG, not PNG: jsPDF re-encodes a PNG with a fixed row predictor,
        // which strict PDF readers (Chrome's included) decode into colored
        // noise at these dimensions. JPEG bytes are embedded untouched.
        const image = await toJpeg(node, {
          pixelRatio: PIXEL_RATIO,
          quality: JPEG_QUALITY,
          width,
          height,
          // The reports are light-mode documents on white.
          backgroundColor: "#ffffff",
        });
        if (cancelled) return;
        // A page the same shape as the document, so nothing is cropped and
        // the report doesn't have to be split across sheets.
        const pdf = new jsPDF({
          orientation: height > width ? "portrait" : "landscape",
          unit: "px",
          format: [width, height],
        });
        pdf.addImage(image, "JPEG", 0, 0, width, height);
        pdf.save(`${fileName}.pdf`);
      } finally {
        if (!cancelled) onDone();
      }
    }, SETTLE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ReportPage, fileName, onDone]);

  if (!ReportPage) return null;

  // Offscreen rather than hidden: html-to-image can only capture a node the
  // browser has actually laid out, so `display: none` would come back blank.
  //
  // The offset lives on the wrapper, never on the captured node — the capture
  // copies the node's own computed style onto the clone, so a node positioned
  // at -10000px reproduces that offset inside the image and renders empty.
  return createPortal(
    <div style={{ position: "fixed", top: 0, left: "-10000px" }}>
      {/* A document is free to scroll a wide table sideways on screen, but a
          PDF has no scrollbar — anything past the edge would just be missing,
          so inner scrollers are opened up for the capture. */}
      <GlobalStyles
        styles={{ [`#${PRINT_ROOT_ID} *`]: { overflow: "visible !important" } }}
      />
      <div
        ref={docRef}
        id={PRINT_ROOT_ID}
        style={{
          width: "max-content",
          minWidth: DOC_WIDTH,
          backgroundColor: "#ffffff",
        }}
      >
        <ReportPage />
      </div>
    </div>,
    document.body,
  );
}
