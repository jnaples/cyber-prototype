// Single dashboard widget card — direct manipulation on hover.
//
// - Whole card is grabbable (with a 5px movement threshold so plain clicks
//   don't trigger a drag).
// - Top-right toolbar exposes a delete button.
// - Bottom-right dotted "gripper" resizes the card 1..6 columns by dragging.
// - Hover gives a primary-blue outline and elevated shadow.

import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import { Box, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { Legend } from "./charts";
import {
  CATALOG_BY_TYPE,
  clampSpan as clampSpanLib,
  HEADERLESS,
  widgetLegend,
  type WidgetInstance,
} from "./lib";
import { WidgetBody } from "./widgets";

export type { WidgetInstance } from "./lib";

const clampSpan = (s: number, cols: number) => clampSpanLib(s, cols);

// Dotted gripper rendered in the bottom-right corner (HubSpot-style).
function ResizeGrip({ active }: { active: boolean }) {
  const theme = useTheme();
  const color = active ? theme.palette.primary.main : theme.palette.grey[400];
  const dots: [number, number][] = [
    [13, 5],
    [9, 9],
    [13, 9],
    [5, 13],
    [9, 13],
    [13, 13],
  ];
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.35" fill={color} />
      ))}
    </svg>
  );
}

export function DashCard({
  widget,
  pad,
  cols,
  dragging,
  onRemove,
  onSpan,
  onNote,
  onBeginDrag,
}: {
  widget: WidgetInstance;
  pad: number;
  cols: number;
  dragging: boolean;
  onRemove: () => void;
  onSpan: (s: number) => void;
  onNote: (v: string) => void;
  onBeginDrag: (
    e: React.PointerEvent<HTMLDivElement>,
    id: string,
  ) => void;
}) {
  const def = CATALOG_BY_TYPE[widget.type];
  const headerless = HEADERLESS(widget.type);
  const legend = widgetLegend(widget.type);
  const [hover, setHover] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const active = hover || dragging || resizing;

  // Bottom-right corner: drag horizontally to resize 1..cols columns.
  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const card = cardRef.current;
    if (!card) return;
    const startX = e.clientX;
    const startSpan = clampSpan(widget.span, cols);
    const unit = card.getBoundingClientRect().width / startSpan;
    setResizing(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "nwse-resize";
    const move = (ev: PointerEvent) =>
      onSpan(
        clampSpan(
          startSpan + Math.round((ev.clientX - startX) / unit),
          cols,
        ),
      );
    const up = () => {
      setResizing(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Press anywhere on the card (except interactive elements) to drag-reorder.
  const onCardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(
        "button, a, input, textarea, select, .dash-resize, .dash-toolbar",
      )
    ) {
      return;
    }
    onBeginDrag(e, widget.id);
  };

  // Keep cursor coherent with state.
  useEffect(() => {
    if (!cardRef.current) return;
  }, [active, resizing]);

  return (
    <Paper
      ref={cardRef}
      data-widget-id={widget.id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={onCardPointerDown}
      elevation={active ? 8 : 1}
      sx={{
        gridColumn: `span ${clampSpan(widget.span, cols)}`,
        position: "relative",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        opacity: dragging ? 0.55 : 1,
        transform: dragging ? "scale(1.01)" : "none",
        outline: active ? "1px solid" : "none",
        outlineColor: active ? "primary.main" : undefined,
        outlineOffset: "1px",
        cursor: dragging ? "grabbing" : hover ? "grab" : "default",
        transition: dragging
          ? "none"
          : "box-shadow 140ms, opacity 120ms, transform 120ms",
        minWidth: 0,
        pointerEvents: dragging ? "none" : undefined,
        // Cursor hints on interactive children.
        "& input, & textarea, & select": { cursor: "text" },
        "& button, & a, & [role='button']": { cursor: "pointer" },
      }}
    >
      {/* hover toolbar (top-right) */}
      {active && (
        <IconButton
          className="dash-toolbar"
          size="small"
          onClick={onRemove}
          title="Remove"
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 7,
            color: "error.main",
          }}
        >
          <DeleteForeverOutlinedIcon fontSize="small" />
        </IconButton>
      )}

      {!headerless && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 15,
                color: "text.primary",
              }}
            >
              {def?.name ?? widget.type}
            </Typography>
          </Box>
          {legend && (
            <Box sx={{ mt: 1 }}>
              <Legend items={legend} />
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          // For cards WITH a header, the header already provides top padding,
          // so we don't double up with another `pt: pad`.
          p: headerless ? 1.5 : pad,
          pt: headerless ? 1.5 : 0,
          flex: 1,
          minWidth: 0,
          minHeight: headerless ? 120 : "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: headerless ? "center" : "flex-start",
        }}
      >
        <WidgetBody type={widget.type} widget={widget} onNote={onNote} />
      </Box>

      {/* bottom-right resize gripper */}
      {active && (
        <Box
          className="dash-resize"
          onPointerDown={startResize}
          title="Drag to resize width"
          sx={{
            position: "absolute",
            right: 3,
            bottom: 3,
            width: 22,
            height: 22,
            zIndex: 6,
            cursor: "nwse-resize",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            touchAction: "none",
          }}
        >
          <ResizeGrip active={resizing} />
        </Box>
      )}
    </Paper>
  );
}
