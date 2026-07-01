// Geo Activity background — a dark world map with live "blink" markers (a point
// plus expanding ring at the single location a request came in from), color
// coded by verdict: blue = allowed, yellow = category block, pink = threat.
// Ported from the Geo Activity design; used as the login page backdrop.

import { Box } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { useEffect, useRef } from "react";

// Scheme-aware scene palette. Dark is the original "space" look; light is an
// inverted daytime version (pale sky, saturated brand-ish blinks).
const THEMES = {
  dark: {
    bg: "radial-gradient(120% 120% at 50% 0%, #0a1f30 0%, #05121e 55%, #020a12 100%)",
    map: "#233A50",
    grid: "rgba(61,185,247,.045)",
    vignette:
      "radial-gradient(80% 80% at 50% 45%, transparent 55%, rgba(2,8,14,.75) 100%)",
    blue: { stroke: "#4EC6FF", dot: "#EAF8FF", glow: "#4EC6FF" },
    yellow: { stroke: "#FFC53D", dot: "#FFF3D6", glow: "#FFC53D" },
    pink: { stroke: "#FF3BB0", dot: "#FFDDF2", glow: "#FF3BB0" },
  },
  light: {
    bg: "radial-gradient(120% 120% at 50% 0%, #f4f8ff 0%, #e6eef8 55%, #d7e3f1 100%)",
    map: "#BCCCDC",
    grid: "rgba(53,89,116,.07)",
    vignette:
      "radial-gradient(80% 80% at 50% 45%, transparent 55%, rgba(215,227,241,.65) 100%)",
    blue: { stroke: "#238CD2", dot: "#1E7FB8", glow: "rgba(35,140,210,.5)" },
    yellow: { stroke: "#F57C00", dot: "#D96C00", glow: "rgba(245,124,0,.45)" },
    pink: { stroke: "#CE008E", dot: "#B0007A", glow: "rgba(206,0,142,.45)" },
  },
} as const;

// Weighted population/traffic centres: [lon, lat, weight].
const HOTSPOTS: [number, number, number][] = [
  [-74, 40.7, 9], [-118.2, 34, 13], [-87.6, 41.8, 5], [-95.4, 29.8, 4],
  // California cluster (SF, San Jose, LA, San Diego, Sacramento)
  [-122.3, 37.6, 13], [-121.9, 37.3, 8], [-117.2, 32.7, 8], [-121.5, 38.6, 4],
  // Texas (Houston above, + Dallas, Austin, San Antonio)
  [-96.8, 32.8, 6], [-97.7, 30.3, 5], [-98.5, 29.4, 4],
  // Rest of the US
  [-122.3, 47.6, 6], [-122.7, 45.5, 4], [-104.99, 39.7, 5], [-112.07, 33.45, 4],
  [-115.1, 36.2, 4], [-93.3, 45, 4], [-80.2, 25.8, 4], [-84.4, 33.7, 4],
  [-77, 38.9, 5], [-71.06, 42.36, 4], [-75.16, 39.95, 3],
  [-79.4, 43.7, 3], [-99.1, 19.4, 4], [-46.6, -23.5, 4],
  [-58.4, -34.6, 2], [-77, -12, 2], [-74.1, 4.7, 2],
  [-0.1, 51.5, 8], [2.35, 48.85, 6], [13.4, 52.5, 5], [-3.7, 40.4, 3],
  [12.5, 41.9, 3], [4.9, 52.4, 3], [37.6, 55.7, 5], [30.5, 50.4, 2],
  [28.9, 41, 3], [18.4, -33.9, 2], [3.4, 6.5, 3], [31.2, 30, 3], [36.8, -1.3, 2],
  [72.8, 19, 8], [77.2, 28.6, 7], [88.4, 22.6, 3], [121.5, 31.2, 9],
  [116.4, 39.9, 8], [114.1, 22.4, 4], [139.7, 35.7, 8], [135.5, 34.7, 3],
  [126.98, 37.57, 6], [103.8, 1.35, 4], [106.8, -6.2, 4], [100.5, 13.75, 3],
  [151.2, -33.9, 4], [144.96, -37.8, 2], [55.3, 25.3, 3], [46.7, 24.7, 2],
  [101.7, 3.14, 2], [121, 14.6, 3],
];
const WSUM = HOTSPOTS.reduce((s, h) => s + h[2], 0);

// Equirectangular projection into the map SVG's 1052.4 × 580 viewBox. The
// source map's landmasses sit a bit higher than a naive 90..-90 mapping, so
// LAT_OFFSET nudges every marker south to line up with the geography.
const LAT_OFFSET = 13;
const proj = (lon: number, lat: number): [number, number] => [
  ((lon + 180) / 360) * 1052.4,
  ((90 - (lat - LAT_OFFSET)) / 180) * 580,
];

const NS = "http://www.w3.org/2000/svg";

export function GeoActivityBackground() {
  const overlayRef = useRef<SVGGElement | null>(null);
  const { mode, systemMode } = useColorScheme();
  const pal =
    (mode === "system" ? systemMode : mode) === "dark"
      ? THEMES.dark
      : THEMES.light;

  useEffect(() => {
    const g = overlayRef.current;
    if (!g) return;

    let destroyed = false;
    let timer: ReturnType<typeof setTimeout>;

    const pickCity = () => {
      let r = Math.random() * WSUM;
      for (const h of HOTSPOTS) {
        r -= h[2];
        if (r <= 0) return h;
      }
      return HOTSPOTS[0];
    };
    const pickType = () => {
      const r = Math.random();
      return r < 0.8 ? "blue" : r < 0.93 ? "yellow" : "pink";
    };

    const fire = () => {
      const [clon, clat] = pickCity();
      const lon = clon + (Math.random() - 0.5) * 3.2;
      const lat = clat + (Math.random() - 0.5) * 3.2;
      const [x, y] = proj(lon, lat);
      const type = pickType();

      const grp = document.createElementNS(NS, "g");
      grp.setAttribute("class", "ga-" + type);
      const mk = (cls: string) => {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", x.toFixed(1));
        c.setAttribute("cy", y.toFixed(1));
        c.setAttribute("class", cls);
        return c;
      };
      grp.appendChild(mk("ga-ring"));
      if (type !== "blue") grp.appendChild(mk("ga-ring2"));
      grp.appendChild(mk("ga-dot"));
      g.appendChild(grp);
      setTimeout(() => grp.parentNode?.removeChild(grp), 2100);
    };

    const spawn = () => {
      if (destroyed) return;
      fire();
      timer = setTimeout(spawn, 90 + Math.random() * 260);
    };
    spawn();

    return () => {
      destroyed = true;
      clearTimeout(timer);
      g.replaceChildren();
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
        background: pal.bg,
        "@keyframes gaRingExpand": {
          "0%": { r: "1.5px", opacity: 0.9 },
          "100%": { r: "22px", opacity: 0 },
        },
        "@keyframes gaDotPop": {
          "0%": { r: "0px", opacity: 0 },
          "12%": { r: "3.2px", opacity: 1 },
          "45%": { r: "2.1px", opacity: 1 },
          "100%": { r: "1.5px", opacity: 0 },
        },
        "& .ga-ring": {
          fill: "none",
          strokeWidth: 1.2,
          animation: "gaRingExpand 1.9s cubic-bezier(.12,.62,.28,1) forwards",
        },
        "& .ga-ring2": {
          fill: "none",
          strokeWidth: 1.1,
          animation:
            "gaRingExpand 1.9s cubic-bezier(.12,.62,.28,1) .28s forwards",
        },
        "& .ga-dot": { animation: "gaDotPop 1.9s ease-out forwards" },
        "& .ga-blue": { filter: `drop-shadow(0 0 5px ${pal.blue.glow})` },
        "& .ga-blue .ga-ring, & .ga-blue .ga-ring2": { stroke: pal.blue.stroke },
        "& .ga-blue .ga-dot": { fill: pal.blue.dot },
        "& .ga-yellow": { filter: `drop-shadow(0 0 5px ${pal.yellow.glow})` },
        "& .ga-yellow .ga-ring, & .ga-yellow .ga-ring2": {
          stroke: pal.yellow.stroke,
        },
        "& .ga-yellow .ga-dot": { fill: pal.yellow.dot },
        "& .ga-pink": { filter: `drop-shadow(0 0 6px ${pal.pink.glow})` },
        "& .ga-pink .ga-ring, & .ga-pink .ga-ring2": { stroke: pal.pink.stroke },
        "& .ga-pink .ga-dot": { fill: pal.pink.dot },
      }}
    >
      {/* Faint grid */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(${pal.grid} 1px, transparent 1px), linear-gradient(90deg, ${pal.grid} 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
        }}
      />

      {/* World map + blink overlay. The wrapper carries the map's exact aspect
          ratio and both the mask (map) and the overlay fill it 1:1, so blink
          coordinates line up with the geography. 70% wide on desktop, 90% on
          mobile / iPad. */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", lg: "70%" },
          aspectRatio: "1052.4 / 580",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.9,
            bgcolor: pal.map,
            maskImage: "url(/world-map.svg)",
            WebkitMaskImage: "url(/world-map.svg)",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        />
        <Box
          component="svg"
          viewBox="0 0 1052.4 580"
          preserveAspectRatio="none"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <g ref={overlayRef} />
        </Box>
      </Box>

      {/* Vignette */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: pal.vignette,
        }}
      />
    </Box>
  );
}
