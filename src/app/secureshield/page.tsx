// Secure Shield — an agent-activity timeline player.
//
// Renders a single autonomous-agent session as a horizontal flow of event
// nodes on a pan/zoom canvas. A transport bar plays through the events one at
// a time, animating a "flow dot" along the wire between each pair; clicking a
// node opens a detail popover. The Roaming Clients selector switches between a
// clean run and one that escalates into a blocked threat.

import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { ArrowTooltip } from "@/components/arrow-tooltip";
import { PageHeader } from "@/components/page-header";
import { sites as SITE_OPTIONS } from "@/data/query-logs";

import {
  CLIENTS,
  GAP_X,
  LEGEND,
  NODE_H,
  NODE_W,
  ORIGIN_X,
  ORIGIN_Y,
  SCENARIOS,
  SEV_COLORS,
  type ScenarioId,
  type SecurityEvent,
  type Severity,
} from "./data";

// Material elevation shadows, matching the design tokens.
const SHADOW_2 =
  "0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px rgba(0,0,0,.14),0 1px 5px rgba(0,0,0,.12)";
const SHADOW_4 =
  "0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px rgba(0,0,0,.14),0 1px 10px rgba(0,0,0,.12)";
const SHADOW_8 =
  "0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12)";
const SHADOW_24 =
  "0 11px 15px -7px rgba(0,0,0,.2),0 24px 38px 3px rgba(0,0,0,.14),0 9px 46px 8px rgba(0,0,0,.12)";

// Canvas surface colors, resolved from the theme via CSS variables so the whole
// canvas (grid, nodes, control bars, popover) follows light/dark mode.
const C_BORDER = "var(--dnsf-palette-divider)";
const C_MUTED = "var(--dnsf-palette-text-secondary)";
const C_INK = "var(--dnsf-palette-text-primary)";
const C_GRID_BG = "var(--dnsf-palette-background-default)";
const C_PAPER = "var(--dnsf-palette-background-paper)";
const C_FAINT = "var(--dnsf-palette-text-disabled)";

const PAN_IGNORE = ".ss-node,.ss-ui";

// Header filter options. The Roaming Client choice drives which session the
// canvas renders; Organization/Site/User are contextual scoping selectors.
const ORG_OPTIONS = ["Acme Inc.", "Globex", "Initech"];
const ROAMING_CLIENT_OPTIONS = CLIENTS.map((c) => c.name);
const SCENARIO_BY_CLIENT: Record<string, ScenarioId> = Object.fromEntries(
  CLIENTS.map((c) => [c.name, c.id]),
);
const FILTERS_DISABLED_TOOLTIP = "Select an Organization to enable this filter.";

type NodeState = "done" | "active" | "pending";

const sevIcon = (sev: Severity) => SEV_COLORS[sev];

// ---------------------------------------------------------------------------
// Header filter field — a single-select dropdown that disables (with a tooltip)
// until an Organization is chosen, mirroring the Query Logs filter bar.
// ---------------------------------------------------------------------------

function FilterField({
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: {
  placeholder: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <ArrowTooltip title={disabled ? FILTERS_DISABLED_TOOLTIP : ""}>
      <Box sx={{ width: "100%", display: "flex", "& > *": { width: "100%" } }}>
        <Autocomplete
          size="small"
          disabled={disabled}
          options={options}
          value={value}
          onChange={(_event, newValue) => onChange(newValue)}
          renderInput={(params) => (
            <TextField {...params} placeholder={placeholder} />
          )}
        />
      </Box>
    </ArrowTooltip>
  );
}

// ---------------------------------------------------------------------------
// Icon helper
// ---------------------------------------------------------------------------

function Ico({
  name,
  size = 24,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, color, lineHeight: 1 }}
    >
      {name}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Event node
// ---------------------------------------------------------------------------

function EventNode({
  event,
  x,
  y,
  num,
  state,
  onClick,
}: {
  event: SecurityEvent;
  x: number;
  y: number;
  num: string;
  state: NodeState;
  onClick: (el: HTMLElement) => void;
}) {
  const accent = sevIcon(event.sev);
  return (
    <Box
      className="ss-node"
      onClick={(e) => onClick(e.currentTarget)}
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: NODE_W,
        height: NODE_H,
        bgcolor: C_PAPER,
        borderLeft: `4px solid ${accent}`,
        borderRadius: "8px",
        boxShadow:
          state === "active" ? `0 0 0 2px ${accent}, ${SHADOW_4}` : SHADOW_2,
        opacity: state === "pending" ? 0.4 : 1,
        transform: state === "active" ? "scale(1.02)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.75,
        cursor: "pointer",
        transition: "opacity .3s, box-shadow .25s, transform .25s",
        color: C_INK,
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: "8px",
          bgcolor: accent,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Ico name={event.icon} size={24} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {event.cat}
        </Box>
        <Box
          sx={{
            fontSize: 14,
            fontWeight: 600,
            mt: "2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {event.title}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: 11,
            color: C_MUTED,
            mt: "3px",
          }}
        >
          <Ico name="schedule" size={14} />
          <span style={{ fontFamily: "Inter, sans-serif" }}>
            {event.time}
          </span>
        </Box>
      </Box>
      <Box
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          color: C_FAINT,
          alignSelf: "flex-start",
          mt: 1.5,
        }}
      >
        {num}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Node detail (popover body)
// ---------------------------------------------------------------------------

function NodeDetail({
  event,
  onClose,
}: {
  event: SecurityEvent;
  onClose: () => void;
}) {
  const accent = sevIcon(event.sev);
  return (
    <Box sx={{ width: 330, color: C_INK }}>
      <Box sx={{ height: 4, width: "100%", bgcolor: accent }} />
      <Box sx={{ p: "14px 16px 10px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="overline" sx={{ color: C_MUTED }}>
            {event.cat}
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close details">
            <Ico name="close" size={20} />
          </IconButton>
        </Box>
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, mt: 0.5, lineHeight: 1.25 }}
        >
          {event.title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: C_MUTED,
            mt: 0.75,
          }}
        >
          <Ico name="schedule" size={14} />
          <Typography variant="body2" component="span">
            {event.time}
          </Typography>
          {event.threat && (
            <Box
              sx={{
                ml: "auto",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".4px",
                textTransform: "uppercase",
                px: 1,
                py: "2px",
                borderRadius: "999px",
                color: "#fff",
                bgcolor: accent,
              }}
            >
              {event.threat}
            </Box>
          )}
        </Box>
      </Box>
      <Typography
        variant="body2"
        sx={{
          lineHeight: 1.5,
          px: 2,
          pb: 1.5,
          borderBottom: `1px solid ${C_BORDER}`,
        }}
      >
        {event.summary}
      </Typography>
      <Box sx={{ p: "8px 16px 14px" }}>
        {event.rows.map((row) => (
          <Box
            key={row.k}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1.75,
              py: 0.75,
              borderBottom: `1px solid ${C_BORDER}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: C_MUTED, flexShrink: 0 }}
            >
              {row.k}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                textAlign: "right",
                ...(row.mono && { wordBreak: "break-all" }),
              }}
            >
              {row.v}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SecureShieldPage() {
  // Default to the threat ("blocked") session for demo purposes.
  const [scenario, setScenario] = useState<ScenarioId>("rogue");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState({ scale: 0.72, tx: 40, ty: 150 });
  const [selected, setSelected] = useState<number | null>(null);
  const [popAnchor, setPopAnchor] = useState<HTMLElement | null>(null);

  // Header filter drafts. Site/Roaming Client/User stay disabled until an
  // Organization is chosen; the selection only takes effect on Apply.
  const [org, setOrg] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [client, setClient] = useState<string | null>(null);
  const [applied, setApplied] = useState<{
    org: string | null;
    site: string | null;
    client: string | null;
  } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef(view);
  const stepRef = useRef(step);
  const scenarioRef = useRef(scenario);
  const playingRef = useRef(false);
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelRef = useRef<(() => void) | null>(null);

  const events = SCENARIOS[scenario];
  const last = events.length - 1;

  // ---- shared setters that keep refs in sync ----
  const applyView = (
    next:
      | typeof view
      | ((prev: typeof view) => typeof view),
  ) =>
    setView((prev) => {
      const nv = typeof next === "function" ? next(prev) : next;
      viewRef.current = nv;
      return nv;
    });
  const setStepBoth = (n: number) => {
    stepRef.current = n;
    setStep(n);
  };
  const closePop = () => {
    setSelected(null);
    setPopAnchor(null);
  };

  // ---- zoom / pan math ----
  const zoomAtClient = (cx: number, cy: number, f: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rc = stage.getBoundingClientRect();
    const px = cx - rc.left;
    const py = cy - rc.top;
    const { scale, tx, ty } = viewRef.current;
    const ns = Math.min(2, Math.max(0.3, scale * f));
    const wx = (px - tx) / scale;
    const wy = (py - ty) / scale;
    applyView({ scale: ns, tx: px - wx * ns, ty: py - wy * ns });
  };
  const zoomBy = (f: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rc = stage.getBoundingClientRect();
    zoomAtClient(rc.left + rc.width / 2, rc.top + rc.height / 2, f);
  };
  const resetView = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const evs = SCENARIOS[scenarioRef.current];
    const worldW = ORIGIN_X + (evs.length - 1) * GAP_X + NODE_W + 80;
    const worldH = ORIGIN_Y + NODE_H + 80;
    const rc = stage.getBoundingClientRect();
    const pad = 70;
    const s = Math.min(
      (rc.width - pad * 2) / worldW,
      (rc.height - pad * 2) / worldH,
      1,
    );
    applyView({
      scale: s,
      tx: (rc.width - worldW * s) / 2,
      ty: (rc.height - worldH * s) / 2,
    });
  };

  // ---- playback ----
  const tween = (
    dur: number,
    onUpdate: (p: number) => void,
    onComplete?: () => void,
  ) => {
    let raf = 0;
    const start = performance.now();
    const frame = (t: number) => {
      const p = Math.min(1, (t - start) / (dur * 1000));
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      onUpdate(e);
      if (p < 1) raf = requestAnimationFrame(frame);
      else onComplete?.();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  };

  const runDot = (target: number, cb: () => void) => {
    const path = document.getElementById(
      "seg-" + target,
    ) as unknown as SVGPathElement | null;
    const dot = document.getElementById(
      "flow-dot",
    ) as unknown as SVGCircleElement | null;
    if (!path || !dot) {
      cb();
      return;
    }
    const len = path.getTotalLength();
    // CSS variables only resolve through the style property, not the SVG
    // presentation attribute, so set the fill via style.
    dot.style.fill = SEV_COLORS[SCENARIOS[scenarioRef.current][target].sev];
    dot.style.opacity = "1";
    cancelRef.current?.();
    cancelRef.current = tween(
      0.7,
      (p) => {
        const pt = path.getPointAtLength(p * len);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));
      },
      () => {
        dot.style.opacity = "0";
        cb();
      },
    );
  };

  const advance = () => {
    if (!playingRef.current) return;
    const evs = SCENARIOS[scenarioRef.current];
    const lastIdx = evs.length - 1;
    const cur = stepRef.current;
    if (cur >= lastIdx) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    const target = cur + 1;
    runDot(target, () => {
      setStepBoth(target);
      timerRef.current = setTimeout(advance, 600);
    });
  };

  const pause = () => {
    clearTimeout(timerRef.current);
    cancelRef.current?.();
    const dot = document.getElementById("flow-dot");
    if (dot) (dot as HTMLElement).style.opacity = "0";
    playingRef.current = false;
    setPlaying(false);
  };

  const play = () => {
    let s = stepRef.current;
    if (s >= last) s = 0;
    setStepBoth(s);
    setSelected(null);
    playingRef.current = true;
    setPlaying(true);
    timerRef.current = setTimeout(advance, 0);
  };

  const toggle = () => (playingRef.current ? pause() : play());
  const stepForward = () => {
    pause();
    if (stepRef.current >= last) return;
    const t = stepRef.current + 1;
    runDot(t, () => setStepBoth(t));
  };
  const stepBack = () => {
    pause();
    setStepBoth(Math.max(0, stepRef.current - 1));
  };
  const toStart = () => {
    pause();
    setStepBoth(0);
    closePop();
  };
  const toEnd = () => {
    pause();
    setStepBoth(last);
    closePop();
  };

  // ---- node selection ----
  const onNodeClick = (i: number, el: HTMLElement) => {
    setSelected((prev) => (prev === i ? null : i));
    setPopAnchor(el);
  };

  // ---- header filters ----
  const filtersDisabled = !org;
  const isCurrentApplied =
    applied !== null &&
    applied.org === org &&
    applied.site === site &&
    applied.client === client;

  const applyFilters = () => {
    if (!org) return;
    setApplied({ org, site, client });
    const next = client ? SCENARIO_BY_CLIENT[client] : scenario;
    if (next !== scenario) {
      pause();
      scenarioRef.current = next;
      setStepBoth(0);
      closePop();
      setScenario(next);
    }
  };

  const clearFilters = () => {
    setOrg(null);
    setSite(null);
    setClient(null);
    setApplied(null);
  };

  // ---- wheel + drag listeners (native, so wheel can preventDefault) ----
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      closePop();
      zoomAtClient(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 0.89);
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(PAN_IGNORE)) return;
      closePop();
      panRef.current = {
        x: e.clientX,
        y: e.clientY,
        tx: viewRef.current.tx,
        ty: viewRef.current.ty,
      };
      stage.style.cursor = "grabbing";
    };
    const onMove = (e: MouseEvent) => {
      const p = panRef.current;
      if (!p) return;
      applyView((v) => ({
        ...v,
        tx: p.tx + (e.clientX - p.x),
        ty: p.ty + (e.clientY - p.y),
      }));
    };
    const onUp = () => {
      if (panRef.current) {
        panRef.current = null;
        stage.style.cursor = "grab";
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fit the whole timeline into view on mount and whenever the scenario
  // changes (the two runs have different lengths).
  useEffect(() => {
    const id = requestAnimationFrame(resetView);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  // Stop playback when leaving the page.
  useEffect(() => () => pause(), []);

  // ---- derived geometry ----
  const worldW = ORIGIN_X + (events.length - 1) * GAP_X + NODE_W + 80;
  const worldH = ORIGIN_Y + NODE_H + 80;
  const nodes = events.map((e, i) => ({
    event: e,
    x: ORIGIN_X + i * GAP_X,
    y: ORIGIN_Y,
    num: String(i + 1).padStart(2, "0"),
    state: (i < step ? "done" : i === step ? "active" : "pending") as NodeState,
  }));
  const segs = [];
  for (let i = 1; i < events.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    const x1 = a.x + NODE_W;
    const y1 = a.y + NODE_H / 2;
    const x2 = b.x;
    const y2 = b.y + NODE_H / 2;
    segs.push({
      id: "seg-" + i,
      d: `M ${x1} ${y1} C ${x1 + 130} ${y1}, ${x2 - 130} ${y2}, ${x2} ${y2}`,
      on: i <= step,
      color: SEV_COLORS[events[i].sev],
    });
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        bgcolor: C_GRID_BG,
      }}
    >
      <PageHeader title="Secure Shield">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            px: 3,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            <Autocomplete
              size="small"
              options={ORG_OPTIONS}
              value={org}
              onChange={(_event, newValue) => setOrg(newValue)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Organization" />
              )}
            />
            <FilterField
              placeholder="Select Site"
              options={SITE_OPTIONS}
              value={site}
              onChange={setSite}
              disabled={filtersDisabled}
            />
            <FilterField
              placeholder="Select Roaming Client"
              options={ROAMING_CLIENT_OPTIONS}
              value={client}
              onChange={setClient}
              disabled={filtersDisabled}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ArrowTooltip
              title={
                isCurrentApplied
                  ? "Change your selection to apply a new filter."
                  : ""
              }
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={filtersDisabled || isCurrentApplied}
                  onClick={applyFilters}
                >
                  Apply
                </Button>
              </span>
            </ArrowTooltip>
            {applied && (
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={clearFilters}
                startIcon={<Ico name="close" size={16} />}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>
      </PageHeader>

      {/* Canvas */}
      <Box
        ref={stageRef}
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          cursor: "grab",
          minHeight: 0,
          backgroundColor: C_GRID_BG,
          backgroundImage: `radial-gradient(${C_BORDER} 1.1px, transparent 1.1px)`,
          backgroundSize: "26px 26px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "0 0",
            width: worldW,
            height: worldH,
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
          }}
        >
          <svg
            width={worldW}
            height={worldH}
            style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
          >
            {segs.map((s) => (
              <path
                key={s.id}
                id={s.id}
                d={s.d}
                fill="none"
                stroke={s.on ? s.color : C_BORDER}
                strokeWidth={s.on ? 2.5 : 2}
                strokeDasharray={s.on ? "none" : "5 7"}
              />
            ))}
            <circle
              id="flow-dot"
              r={6}
              cx={0}
              cy={0}
              style={{
                opacity: 0,
                fill: "var(--dnsf-palette-primary-main)",
                filter: "drop-shadow(0 0 7px rgba(53,39,253,.7))",
              }}
            />
          </svg>

          {nodes.map((n, i) => (
            <EventNode
              key={i}
              event={n.event}
              x={n.x}
              y={n.y}
              num={n.num}
              state={n.state}
              onClick={(el) => onNodeClick(i, el)}
            />
          ))}
        </Box>

        {/* Legend */}
        <Box
          className="ss-ui"
          sx={{
            position: "absolute",
            bottom: 22,
            left: 24,
            bgcolor: C_PAPER,
            border: `1px solid ${C_BORDER}`,
            borderRadius: "8px",
            boxShadow: SHADOW_2,
            p: "10px 12px",
            color: C_INK,
          }}
        >
          <Typography
            variant="overline"
            sx={{ display: "block", color: C_MUTED, mb: 0.875 }}
          >
            Event verdict
          </Typography>
          {LEGEND.map((l) => (
            <Box
              key={l.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.875,
                mt: 0.625,
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "2px",
                  flexShrink: 0,
                  bgcolor: SEV_COLORS[l.sev],
                }}
              />
              <Typography variant="body2">{l.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Transport */}
        <Box
          className="ss-ui"
          sx={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: C_PAPER,
            border: `1px solid ${C_BORDER}`,
            boxShadow: SHADOW_8,
            borderRadius: "999px",
            p: "6px 10px",
          }}
        >
          <IconButton onClick={toStart} aria-label="Jump to start" sx={{ color: C_MUTED }}>
            <Ico name="first_page" size={24} />
          </IconButton>
          <IconButton onClick={stepBack} aria-label="Step back" sx={{ color: C_MUTED }}>
            <Ico name="chevron_left" size={24} />
          </IconButton>
          <IconButton
            onClick={toggle}
            aria-label="Play or pause"
            sx={{
              width: 50,
              height: 50,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <Ico name={playing ? "pause" : "play_arrow"} size={28} />
          </IconButton>
          <IconButton onClick={stepForward} aria-label="Step forward" sx={{ color: C_MUTED }}>
            <Ico name="chevron_right" size={24} />
          </IconButton>
          <IconButton onClick={toEnd} aria-label="Jump to end" sx={{ color: C_MUTED }}>
            <Ico name="last_page" size={24} />
          </IconButton>
          <Box sx={{ width: "1px", height: 26, bgcolor: C_BORDER, mx: 0.75 }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              px: 0.75,
              minWidth: 54,
              color: C_INK,
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, fontFamily: "Inter, sans-serif" }}
            >
              {step + 1} / {events.length}
            </Typography>
            <Typography variant="body2" sx={{ color: C_MUTED }}>
              Events
            </Typography>
          </Box>
        </Box>

        {/* Zoom */}
        <Box
          className="ss-ui"
          sx={{
            position: "absolute",
            bottom: 22,
            right: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: C_PAPER,
            border: `1px solid ${C_BORDER}`,
            borderRadius: "8px",
            boxShadow: SHADOW_2,
            overflow: "hidden",
          }}
        >
          <IconButton
            onClick={() => zoomBy(1.2)}
            aria-label="Zoom in"
            sx={{ borderRadius: 0, color: C_MUTED }}
          >
            <Ico name="add" size={20} />
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: C_MUTED,
              p: 0.5,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {Math.round(view.scale * 100)}%
          </Typography>
          <IconButton
            onClick={() => zoomBy(0.83)}
            aria-label="Zoom out"
            sx={{ borderRadius: 0, color: C_MUTED }}
          >
            <Ico name="remove" size={20} />
          </IconButton>
          <Box sx={{ width: "100%", height: "1px", bgcolor: C_BORDER }} />
          <IconButton
            onClick={resetView}
            aria-label="Reset view"
            sx={{ borderRadius: 0, color: C_MUTED }}
          >
            <Ico name="center_focus_strong" size={20} />
          </IconButton>
        </Box>

        {/* Detail popover */}
        <Popover
          open={selected != null && Boolean(popAnchor)}
          anchorEl={popAnchor}
          onClose={closePop}
          anchorOrigin={{ vertical: "center", horizontal: "right" }}
          transformOrigin={{ vertical: "center", horizontal: "left" }}
          slotProps={{
            paper: {
              sx: {
                ml: 1.75,
                borderRadius: "8px",
                boxShadow: SHADOW_24,
                overflow: "hidden",
              },
            },
          }}
        >
          {selected != null && (
            <NodeDetail event={events[selected]} onClose={closePop} />
          )}
        </Popover>
      </Box>
    </Box>
  );
}
