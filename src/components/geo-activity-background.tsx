// Geo network background — a dotted world map with a dot at each customer
// location and arcs that animate out to the destinations they resolve. Blocked
// requests draw in magenta and land with a ring; allowed requests draw in blue.
// Login page backdrop: transparent, so the page's own background shows through.

import { Box } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { useEffect, useRef } from "react";

// Scheme-aware palette. Dark is the design's original treatment; light swaps the
// land + customer marks for values that read on a pale background.
const THEMES = {
  dark: {
    grid: "rgba(61,185,247,.045)",
    land: "#3b4756",
    ring: "rgba(255,255,255,0.85)",
    glow: "rgba(255,255,255,0.07)",
  },
  light: {
    grid: "rgba(53,89,116,.07)",
    land: "#BCCCDC",
    ring: "rgba(24,46,66,0.7)",
    glow: "rgba(24,46,66,0.06)",
  },
} as const;

// Arc + effect colors are brand marks, so they hold across both schemes.
const ALLOWED = "#3427FD";
const BLOCKED = "#FC03C1";

const NS = "http://www.w3.org/2000/svg";

// The scene is laid out on a 1000 × 500 equirectangular canvas.
const W = 1000;
const H = 500;
const xy = (lat: number, lon: number): [number, number] => [
  (lon + 180) * (W / 360),
  (90 - lat) * (H / 180),
];

// Coarse landmass outlines, [lon, lat] rings. Only used to decide which cells of
// the dot grid below are land, so they're deliberately low-fidelity.
const LAND_RINGS: [number, number][][] = [
  // North America
  [
    [-166, 68],
    [-168, 66],
    [-165, 61],
    [-160, 59],
    [-163, 55.5],
    [-158, 56.5],
    [-152, 58.5],
    [-146, 60],
    [-140, 59.5],
    [-136, 58],
    [-132, 55.5],
    [-130, 54],
    [-127, 50],
    [-124, 47.5],
    [-124, 43],
    [-121, 37],
    [-118, 34],
    [-117, 32.5],
    [-114, 28],
    [-110, 24],
    [-109.5, 23],
    [-112, 27],
    [-114.5, 31],
    [-112, 28.5],
    [-109, 26],
    [-106, 22.5],
    [-105, 20],
    [-103, 18.5],
    [-96, 16],
    [-93, 15],
    [-90, 13.5],
    [-87, 13],
    [-85, 11],
    [-83, 9],
    [-80, 8.5],
    [-77, 8],
    [-79, 9.5],
    [-82, 10],
    [-83, 11],
    [-83, 15],
    [-86, 16],
    [-88, 16.5],
    [-87, 21.5],
    [-90, 21],
    [-91, 18.5],
    [-94, 18.5],
    [-96, 19.5],
    [-97, 22],
    [-97, 26],
    [-94, 29.5],
    [-90, 29],
    [-85, 30],
    [-83, 29.5],
    [-81, 25.5],
    [-80, 26.5],
    [-81, 31],
    [-79, 33],
    [-76, 35],
    [-75, 38],
    [-74, 40],
    [-70, 41.5],
    [-70, 43.5],
    [-66, 44],
    [-64, 45.5],
    [-60, 46],
    [-53, 47],
    [-53, 49],
    [-56, 51],
    [-56, 53],
    [-58, 55],
    [-60, 58],
    [-64, 60],
    [-70, 61],
    [-78, 62],
    [-78, 56],
    [-80, 51],
    [-84, 52],
    [-90, 57],
    [-94, 59],
    [-93, 62],
    [-89, 64],
    [-85, 66],
    [-88, 68],
    [-96, 68],
    [-105, 68.5],
    [-115, 69],
    [-124, 70],
    [-133, 69],
    [-141, 69.5],
    [-148, 70],
    [-156, 71],
    [-161, 70],
  ],
  // Baffin Island
  [
    [-66, 62],
    [-64, 67],
    [-72, 71],
    [-80, 73],
    [-78, 69],
    [-71, 65],
    [-68, 62],
  ],
  // South America
  [
    [-77, 8],
    [-72, 11],
    [-64, 10],
    [-60, 8],
    [-52, 5],
    [-50, 0],
    [-44, -3],
    [-35, -6],
    [-37, -12],
    [-41, -22],
    [-48, -26],
    [-53, -34],
    [-58, -39],
    [-62, -41],
    [-65, -47],
    [-69, -52],
    [-71, -54],
    [-74, -50],
    [-73, -44],
    [-71, -37],
    [-70, -27],
    [-70, -18],
    [-76, -14],
    [-81, -6],
    [-80, 1],
    [-77, 4],
  ],
  // Greenland
  [
    [-43, 60],
    [-38, 65],
    [-30, 68],
    [-21, 70],
    [-18, 76],
    [-28, 81],
    [-45, 82],
    [-58, 76],
    [-55, 70],
    [-52, 65],
  ],
  // Eurasia
  [
    [-9, 36],
    [-2, 37],
    [1, 39],
    [3, 42],
    [7, 43],
    [10, 44],
    [12, 42],
    [16, 38],
    [18, 40],
    [14, 42],
    [13, 45],
    [19, 42],
    [20, 40],
    [22, 37],
    [24, 38],
    [26, 40],
    [30, 36],
    [36, 36],
    [34, 31],
    [34, 28],
    [37, 24],
    [39, 21],
    [43, 13],
    [45, 12],
    [54, 17],
    [59, 22],
    [57, 26],
    [61, 25],
    [66, 24],
    [72, 20],
    [73, 16],
    [77, 8],
    [80, 13],
    [84, 18],
    [87, 21],
    [91, 22],
    [92, 20],
    [94, 16],
    [97, 10],
    [100, 5],
    [103, 1.5],
    [103, 5],
    [100, 8],
    [100, 13],
    [105, 9],
    [109, 12],
    [108, 16],
    [106, 20],
    [110, 21],
    [114, 22],
    [118, 24],
    [121, 28],
    [121, 32],
    [122, 37],
    [118, 39],
    [122, 40],
    [125, 39],
    [126, 35],
    [129, 36],
    [129, 40],
    [131, 43],
    [135, 45],
    [138, 49],
    [141, 53],
    [142, 59],
    [150, 60],
    [156, 51],
    [161, 56],
    [163, 61],
    [170, 60],
    [179, 65],
    [170, 67],
    [158, 70],
    [145, 72],
    [130, 72],
    [113, 74],
    [104, 78],
    [95, 76],
    [85, 73],
    [73, 72],
    [66, 69],
    [58, 68],
    [46, 68],
    [40, 66],
    [33, 67],
    [40, 68],
    [31, 70],
    [26, 71],
    [20, 70],
    [14, 68],
    [11, 64],
    [5, 61],
    [6, 58],
    [11, 58],
    [12, 56],
    [16, 58],
    [18, 60],
    [21, 63],
    [25, 66],
    [24, 64],
    [22, 60],
    [26, 60],
    [30, 60],
    [28, 58],
    [24, 57],
    [21, 56],
    [19, 54],
    [14, 54],
    [10, 54],
    [8, 56],
    [8, 57],
    [9, 55],
    [7, 53],
    [4, 52],
    [1, 51],
    [1, 50],
    [-2, 49],
    [-4, 48],
    [-1, 46],
    [-2, 44],
    [-8, 43],
  ],
  // Africa
  [
    [-6, 35],
    [3, 37],
    [10, 37],
    [15, 32],
    [25, 32],
    [32, 31],
    [33, 28],
    [37, 22],
    [38, 18],
    [43, 11],
    [51, 11],
    [44, 0],
    [41, -3],
    [39, -8],
    [36, -15],
    [35, -20],
    [33, -26],
    [27, -34],
    [20, -35],
    [17, -30],
    [14, -23],
    [12, -18],
    [13, -12],
    [12, -6],
    [9, -1],
    [9, 4],
    [3, 6],
    [-4, 5],
    [-8, 5],
    [-13, 8],
    [-17, 15],
    [-17, 21],
    [-10, 30],
  ],
  // Australia
  [
    [114, -22],
    [114, -34],
    [118, -35],
    [124, -33],
    [130, -32],
    [136, -35],
    [139, -37],
    [146, -39],
    [150, -37],
    [153, -31],
    [153, -26],
    [149, -20],
    [143, -13],
    [141, -16],
    [137, -12],
    [132, -11],
    [126, -14],
    [122, -18],
  ],
  // Great Britain
  [
    [-5, 50],
    [1, 51],
    [0, 53],
    [-2, 56],
    [-4, 58],
    [-6, 55],
    [-5, 52],
  ],
  // Ireland
  [
    [-10, 52],
    [-6, 52],
    [-6, 55],
    [-10, 54],
  ],
  // Japan
  [
    [130, 31],
    [134, 34],
    [140, 35],
    [142, 40],
    [145, 44],
    [141, 45],
    [140, 41],
    [136, 37],
    [131, 34],
  ],
  // Sumatra
  [
    [95, 5],
    [103, -1],
    [106, -6],
    [102, -4],
    [96, 3],
  ],
  // Java
  [
    [105, -6],
    [114, -8],
    [114, -9],
    [105, -7],
  ],
  // Borneo
  [
    [109, 1],
    [113, 5],
    [117, 7],
    [119, 1],
    [116, -3],
    [110, -2],
  ],
  // New Guinea
  [
    [131, -1],
    [138, -2],
    [147, -6],
    [143, -8],
    [135, -4],
  ],
  // Philippines
  [
    [120, 18],
    [122, 14],
    [124, 10],
    [125, 7],
    [122, 9],
    [120, 14],
  ],
  // Madagascar
  [
    [44, -25],
    [47, -25],
    [50, -16],
    [49, -12],
    [45, -16],
    [44, -20],
  ],
  // New Zealand
  [
    [167, -46],
    [174, -41],
    [178, -37],
    [175, -36],
    [170, -43],
  ],
  // Iceland
  [
    [-22, 64],
    [-15, 64],
    [-14, 66],
    [-20, 66],
  ],
  // Cuba
  [
    [-84, 22],
    [-77, 20],
    [-74, 20],
    [-80, 23],
  ],
];

// Ray-cast point-in-polygon.
const inRing = (lon: number, lat: number, ring: [number, number][]) => {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      hit = !hit;
    }
  }
  return hit;
};

// A 200 × 100 grid of 1.8° cells; every cell that falls on land becomes a dot
// (a zero-length round-capped stroke). Built once, lazily, then cached.
let landPathCache: string | null = null;
function landPath() {
  if (landPathCache !== null) return landPathCache;
  const boxed = LAND_RINGS.map((ring) => {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const [lon, lat] of ring) {
      x0 = Math.min(x0, lon);
      y0 = Math.min(y0, lat);
      x1 = Math.max(x1, lon);
      y1 = Math.max(y1, lat);
    }
    return { ring, x0, y0, x1, y1 };
  });

  let d = "";
  for (let row = 0; row < 100; row++) {
    const lat = 90 - (row + 0.5) * 1.8;
    for (let col = 0; col < 200; col++) {
      const lon = -180 + (col + 0.5) * 1.8;
      for (const p of boxed) {
        if (lon < p.x0 || lon > p.x1 || lat < p.y0 || lat > p.y1) continue;
        if (inRing(lon, lat, p.ring)) {
          d += `M${(col + 0.5) * 5} ${(row + 0.5) * 5}h.01`;
          break;
        }
      }
    }
  }
  landPathCache = d;
  return d;
}

// The customers whose traffic the map visualizes. `rps` is the baseline request
// rate (before the diurnal curve) and `bp` the share of it that gets blocked.
const CUSTOMERS = [
  { name: "Presidio Analytics", lat: 37.77, lon: -122.42, rps: 2.0, bp: 0.11 },
  {
    name: "Meridian Freight Systems",
    lat: 41.88,
    lon: -87.63,
    rps: 1.6,
    bp: 0.1,
  },
  { name: "Falkenwerk GmbH", lat: 52.52, lon: 13.4, rps: 1.5, bp: 0.09 },
  { name: "Varejo Aurora", lat: -23.55, lon: -46.63, rps: 1.4, bp: 0.11 },
  { name: "Lumenpay Holdings", lat: 1.35, lon: 103.82, rps: 1.8, bp: 0.1 },
  { name: "Harbourline Health", lat: -33.87, lon: 151.21, rps: 0.9, bp: 0.08 },
  { name: "Blackmore & Tate LLP", lat: 43.65, lon: -79.38, rps: 1.1, bp: 0.09 },
  { name: "Savanna Connect", lat: -1.29, lon: 36.82, rps: 0.8, bp: 0.12 },
  { name: "Meghdoot Services", lat: 19.08, lon: 72.88, rps: 2.6, bp: 0.22 },
  { name: "Kowloon Trade Group", lat: 22.32, lon: 114.16, rps: 2.0, bp: 0.13 },
  { name: "Sakura Robotics KK", lat: 35.69, lon: 139.69, rps: 1.7, bp: 0.08 },
  { name: "Baltika Interactive", lat: 55.76, lon: 37.62, rps: 1.3, bp: 0.16 },
  { name: "Andes Verde Export", lat: -0.18, lon: -78.47, rps: 1.0, bp: 0.14 },
];

const CUSTOMER_POINTS = CUSTOMERS.map((c) => {
  const [x, y] = xy(c.lat, c.lon);
  return { ...c, x, y };
});

// Where requests resolve to — [lat, lon, weight]. Weight biases how often a
// destination is picked, so the big hosting regions light up more.
const DESTS: [number, number, number][] = [
  [39.0, -77.5, 10],
  [37.3, -121.9, 6],
  [41.9, -87.6, 4],
  [50.1, 8.7, 8],
  [51.5, -0.1, 7],
  [52.4, 4.9, 5],
  [48.9, 2.3, 3],
  [59.3, 18.1, 2],
  [55.8, 37.6, 2],
  [25.2, 55.3, 2],
  [19.1, 72.9, 3],
  [1.35, 103.8, 6],
  [35.7, 139.7, 5],
  [37.6, 127.0, 3],
  [22.3, 114.2, 4],
  [-33.9, 151.2, 3],
  [-23.6, -46.6, 3],
  [-26.2, 28.0, 2],
  [43.7, -79.4, 3],
  [4.7, -74.1, 1],
  [50.45, 30.5, 1],
  [6.5, 3.4, 1],
];
const DEST_WEIGHT = DESTS.reduce((sum, d) => sum + d[2], 0);

// Overall pace multiplier on top of each customer's baseline rate. Tuned so
// only a couple of arcs are in the air at any moment.
const RATE_SCALE = 0.09;

// A scripted burst: one customer's traffic spikes and turns mostly-blocked for
// a 20s window, so the map has an event rather than a flat hum.
const INCIDENT = {
  customer: "Lumenpay Holdings",
  start: 45,
  end: 65,
  rate: 3.5,
  blockRate: 0.7,
};
const INCIDENT_DEST: [number, number] = [50.45, 30.5];
const INCIDENT_INDEX = CUSTOMERS.findIndex((c) => c.name === INCIDENT.customer);

// Hard ceiling on simultaneous in-flight arcs — anything spawned past this is
// dropped, so a busy stretch (or the incident burst) can't flood the map.
const MAX_ARCS = 6;

// Customer markers are a uniform size — traffic volume reads through arc
// frequency instead, so a busy site doesn't also grow a bigger dot.
const DOT_R = 5;

export function GeoActivityBackground() {
  const arcsRef = useRef<SVGGElement | null>(null);
  const fxRef = useRef<SVGGElement | null>(null);

  const { mode, systemMode } = useColorScheme();
  const pal =
    (mode === "system" ? systemMode : mode) === "dark"
      ? THEMES.dark
      : THEMES.light;

  useEffect(() => {
    const arcLayer = arcsRef.current;
    const fxLayer = fxRef.current;
    if (!arcLayer || !fxLayer) return;

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    type Arc = {
      el: SVGPathElement;
      start: number;
      dur: number;
      len: number;
      blocked: boolean;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
    type Fx = {
      el: SVGCircleElement;
      start: number;
      dur: number;
      r0: number;
      dr: number;
      o0: number;
    };

    const arcs: Arc[] = [];
    const fx: Fx[] = [];

    // Per-customer spawn accumulators and daylight factors.
    const acc = CUSTOMERS.map(() => 0);
    const diurnal = CUSTOMERS.map(() => 0.6);

    const pickDest = (): [number, number] => {
      let r = Math.random() * DEST_WEIGHT;
      for (const [lat, lon, w] of DESTS) {
        r -= w;
        if (r <= 0) return [lat, lon];
      }
      return [DESTS[0][0], DESTS[0][1]];
    };

    const addFx = (x: number, y: number, kind: "ring" | "pulse") => {
      const el = document.createElementNS(NS, "circle");
      el.setAttribute("cx", x.toFixed(1));
      el.setAttribute("cy", y.toFixed(1));
      el.setAttribute("fill", "none");
      el.setAttribute("stroke", BLOCKED);
      el.setAttribute("stroke-width", kind === "ring" ? "2" : "1.5");
      fxLayer.appendChild(el);
      fx.push(
        kind === "ring"
          ? { el, start: performance.now(), dur: 650, r0: 3, dr: 14, o0: 0.9 }
          : { el, start: performance.now(), dur: 420, r0: 4, dr: 7, o0: 0.8 },
      );
    };

    const spawn = (i: number, incident: boolean) => {
      const c = CUSTOMER_POINTS[i];
      const blocked = Math.random() < (incident ? INCIDENT.blockRate : c.bp);
      const [dLat, dLon] = incident && blocked ? INCIDENT_DEST : pickDest();
      // Jitter so repeat hits on a region don't stack on the same pixel.
      const [x2, y2] = xy(
        dLat + (Math.random() - 0.5) * 3,
        dLon + (Math.random() - 0.5) * 3,
      );
      const { x: x1, y: y1 } = c;

      if (reduced) {
        // No travelling stroke — just mark the landing and the origin.
        if (blocked) {
          addFx(x2, y2, "ring");
          addFx(x1, y1, "pulse");
        }
        return;
      }
      if (arcs.length >= MAX_ARCS) return;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const chord = Math.hypot(dx, dy);
      if (chord < 4) return;

      // Quadratic control point offset perpendicular to the chord, so longer
      // hops bow further out.
      const lift = chord * 0.15;
      const cx = (x1 + x2) / 2 - (dy / chord) * lift;
      const cy = (y1 + y2) / 2 + (dx / chord) * lift;

      const el = document.createElementNS(NS, "path");
      el.setAttribute("d", `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`);
      el.setAttribute("fill", "none");
      el.setAttribute("stroke", blocked ? BLOCKED : ALLOWED);
      el.setAttribute("stroke-width", "1");
      // Blocked arcs read louder through opacity alone, not weight.
      el.setAttribute("opacity", blocked ? "0.85" : "0.35");
      el.setAttribute("stroke-linecap", "round");
      arcLayer.appendChild(el);

      const len = el.getTotalLength();
      el.setAttribute("stroke-dasharray", String(len));
      el.setAttribute("stroke-dashoffset", String(len));
      arcs.push({
        el,
        start: performance.now(),
        dur: 1200 + Math.random() * 400,
        len,
        blocked,
        x1,
        y1,
        x2,
        y2,
      });
    };

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let diurnalAcc = 99; // Force a refresh on the first frame.

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      elapsed += dt;

      // Local-time activity curve — cities on the day side fire more often.
      diurnalAcc += dt;
      if (diurnalAcc >= 1) {
        diurnalAcc = 0;
        const d = new Date();
        const utc = d.getUTCHours() + d.getUTCMinutes() / 60;
        CUSTOMERS.forEach((c, i) => {
          const localHour = (utc + c.lon / 15 + 24) % 24;
          const s = Math.sin(((localHour - 5.5) / 13) * Math.PI);
          diurnal[i] = 0.18 + 0.82 * Math.max(0.06, s);
        });
      }

      const incidentOn = elapsed >= INCIDENT.start && elapsed < INCIDENT.end;

      for (let i = 0; i < CUSTOMERS.length; i++) {
        const incident = incidentOn && i === INCIDENT_INDEX;
        let rate = CUSTOMERS[i].rps * diurnal[i] * RATE_SCALE;
        if (incident) rate *= INCIDENT.rate;

        acc[i] += rate * dt;
        let guard = 0;
        while (acc[i] >= 1 && guard < 10) {
          acc[i] -= 1;
          guard++;
          spawn(i, incident);
        }
      }

      // Draw the arcs in, then hand blocked ones off to the landing effects.
      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i];
        const p = (now - a.start) / a.dur;
        if (p >= 1) {
          a.el.remove();
          arcs.splice(i, 1);
          if (a.blocked) {
            addFx(a.x2, a.y2, "ring");
            addFx(a.x1, a.y1, "pulse");
          }
        } else {
          a.el.setAttribute("stroke-dashoffset", String(a.len * (1 - p)));
        }
      }

      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i];
        const p = (now - f.start) / f.dur;
        if (p >= 1) {
          f.el.remove();
          fx.splice(i, 1);
          continue;
        }
        f.el.setAttribute("r", (f.r0 + p * f.dr).toFixed(2));
        f.el.setAttribute("opacity", ((1 - p) * f.o0).toFixed(3));
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      arcLayer.replaceChildren();
      fxLayer.replaceChildren();
    };
  }, []);

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Faint grid */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${pal.grid} 1px, transparent 1px), linear-gradient(90deg, ${pal.grid} 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
        }}
      />

      {/* Map layer, above the grid. The wrapper carries the canvas's exact
          aspect ratio so the SVG fills it 1:1 and every projected point lands
          on the right geography. Everything inside — land dots, markers, arcs —
          scales with it. Full-bleed on desktop; overscanned on narrow viewports
          so the map still reads at size (the parent clips the overflow). */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "150%", sm: "125%", lg: "100%" },
          aspectRatio: `${W} / ${H}`,
        }}
      >
        <Box
          component="svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <path
            d={landPath()}
            stroke={pal.land}
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />

          {CUSTOMER_POINTS.map((c) => (
            <g key={c.name} transform={`translate(${c.x},${c.y})`}>
              <circle r={DOT_R + 6} fill={pal.glow} />
              <circle
                r={DOT_R}
                fill="none"
                stroke={pal.ring}
                strokeWidth={1.6}
              />
              <circle r={1.6} fill={pal.ring} />
            </g>
          ))}

          {/* Arcs and their landing effects render over the dots. */}
          <g ref={arcsRef} />
          <g ref={fxRef} />
        </Box>
      </Box>
    </Box>
  );
}
