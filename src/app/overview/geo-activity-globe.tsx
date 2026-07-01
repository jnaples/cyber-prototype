// Geo Activity globe — an animated 3D globe of live DNS resolutions, ported
// from the "Global Activity Globe" design. Country outlines are drawn as hex
// dots; each query is an arc from one city to another with a landing ring,
// colored by verdict (allowed / category block / threat block). Built on
// globe.gl (three.js) and driven imperatively from an effect.

import { Box, Typography } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import Globe, { type GlobeInstance } from "globe.gl";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";

import countriesUrl from "world-atlas/countries-110m.json?url";

const VERDICT_COLORS = {
  allowed: "#2BA6E8",
  category: "#F4B740",
  threat: "#E5189E",
} as const;

// Scheme-aware palette. Dark mode is the original "space" globe; light mode is
// an inverted "day" globe — light sky/sphere with darker dots and readable
// counter colors. The arc/ring verdict hues stay the same in both.
const THEMES = {
  dark: {
    stageBg:
      "radial-gradient(120% 90% at 50% 38%, #0c1b33 0%, #060d1c 55%, #03070f 100%)",
    globeColor: "#0a1729",
    atmosphere: "#2BA6E8",
    hex: "rgba(95,158,235,0.5)",
    label: "#7890B4",
    totalText: "#E6EEFB",
    legendText: "#C3D2EC",
    liveText: "#A9BCDA",
    liveBg: "rgba(255,255,255,.04)",
    liveBorder: "rgba(124,168,255,.18)",
    num: { allowed: "#7FD0FF", category: "#FFD37A", threat: "#FF6FCB" },
  },
  light: {
    stageBg:
      "radial-gradient(120% 90% at 50% 38%, #f4f8ff 0%, #dde8f7 55%, #c4d4ea 100%)",
    globeColor: "#e8eefa",
    atmosphere: "#2BA6E8",
    hex: "rgba(53,39,253,0.40)",
    label: "#5B6E8C",
    totalText: "#0c1b33",
    legendText: "#3C5974",
    liveText: "#3C5974",
    liveBg: "rgba(12,27,51,.05)",
    liveBorder: "rgba(53,39,253,.20)",
    num: { allowed: "#1E84C4", category: "#B7791F", threat: "#C20E84" },
  },
} as const;

const LEGEND = [
  { label: "Allowed request", color: VERDICT_COLORS.allowed },
  { label: "Category block", color: VERDICT_COLORS.category },
  { label: "Threat block", color: VERDICT_COLORS.threat },
];

// Major metros the arcs hop between.
const CITIES: { lat: number; lng: number }[] = [
  { lat: 40.71, lng: -74.0 }, { lat: 34.05, lng: -118.24 },
  { lat: 41.88, lng: -87.63 }, { lat: 29.76, lng: -95.37 },
  { lat: 37.77, lng: -122.42 }, { lat: 47.61, lng: -122.33 },
  { lat: 25.76, lng: -80.19 }, { lat: 43.65, lng: -79.38 },
  { lat: 49.28, lng: -123.12 }, { lat: 19.43, lng: -99.13 },
  { lat: -23.55, lng: -46.63 }, { lat: -34.6, lng: -58.38 },
  { lat: 4.71, lng: -74.07 }, { lat: 51.51, lng: -0.13 },
  { lat: 48.85, lng: 2.35 }, { lat: 52.52, lng: 13.4 },
  { lat: 40.42, lng: -3.7 }, { lat: 41.9, lng: 12.5 },
  { lat: 52.37, lng: 4.9 }, { lat: 55.75, lng: 37.62 },
  { lat: 59.33, lng: 18.07 }, { lat: 53.35, lng: -6.26 },
  { lat: 50.85, lng: 4.35 }, { lat: 30.04, lng: 31.24 },
  { lat: 6.52, lng: 3.38 }, { lat: -26.2, lng: 28.04 },
  { lat: -1.29, lng: 36.82 }, { lat: 25.2, lng: 55.27 },
  { lat: 24.71, lng: 46.68 }, { lat: 39.92, lng: 32.85 },
  { lat: 28.61, lng: 77.21 }, { lat: 19.08, lng: 72.88 },
  { lat: 13.08, lng: 80.27 }, { lat: 1.35, lng: 103.82 },
  { lat: 13.76, lng: 100.5 }, { lat: 3.14, lng: 101.69 },
  { lat: -6.21, lng: 106.85 }, { lat: 14.6, lng: 120.98 },
  { lat: 31.23, lng: 121.47 }, { lat: 39.9, lng: 116.41 },
  { lat: 22.32, lng: 114.17 }, { lat: 37.57, lng: 126.98 },
  { lat: 35.68, lng: 139.69 }, { lat: 34.69, lng: 135.5 },
  { lat: 25.03, lng: 121.57 }, { lat: -33.87, lng: 151.21 },
  { lat: -37.81, lng: 144.96 }, { lat: -36.85, lng: 174.76 },
];

type PointDatum = { lat: number; lng: number; color: string };
type RingDatum = { lat: number; lng: number; color: string; maxR: number };

function hexRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function GeoActivityGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Live counters that tick up as queries resolve, seeded to match the design.
  const [stats, setStats] = useState({
    total: 306254100,
    allowed: 300118400,
    category: 4881300,
    threat: 1254400,
  });

  const { mode, systemMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";
  const t = isDark ? THEMES.dark : THEMES.light;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pal = isDark ? THEMES.dark : THEMES.light;

    let destroyed = false;
    let globe: GlobeInstance | null = null;
    let points: PointDatum[] = [];
    let rings: RingDatum[] = [];
    const timers: ReturnType<typeof setInterval>[] = [];
    let resizeObserver: ResizeObserver | null = null;

    const pick = () => CITIES[Math.floor(Math.random() * CITIES.length)];

    const spawn = () => {
      if (!globe) return;
      const r = Math.random();
      const type = r < 0.7 ? "allowed" : r < 0.88 ? "category" : "threat";
      const base = VERDICT_COLORS[type];

      // Each request is a blink at the single location it came in from — a
      // point marker plus an expanding ring (no city-to-city arcs). Jitter
      // around the seed metro so blinks scatter across each continent.
      const src = pick();
      const jitter = () => (Math.random() - 0.5) * 18;
      const lat = Math.max(-58, Math.min(72, src.lat + jitter()));
      const lng = src.lng + jitter();

      const point: PointDatum = { lat, lng, color: base };
      points.push(point);
      if (points.length > 60) points.shift();
      globe.pointsData(points.slice());

      const ring: RingDatum = {
        lat,
        lng,
        color: base,
        maxR: type === "threat" ? 9 : type === "category" ? 7 : 5.5,
      };
      rings.push(ring);
      if (rings.length > 60) rings.shift();
      globe.ringsData(rings.slice());

      setTimeout(() => {
        points = points.filter((x) => x !== point);
        globe?.pointsData(points.slice());
      }, 1600);
      setTimeout(() => {
        rings = rings.filter((x) => x !== ring);
        globe?.ringsData(rings.slice());
      }, 1600);

      const inc = 40 + Math.floor(Math.random() * 220);
      setStats((s) => ({
        total: s.total + inc,
        allowed: s.allowed + (type === "allowed" ? inc : 0),
        category: s.category + (type === "category" ? inc : 0),
        threat: s.threat + (type === "threat" ? inc : 0),
      }));
    };

    const initGlobe = (countries: object[]) => {
      if (destroyed || !containerRef.current) return;
      const g = new Globe(containerRef.current)
        .backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(true)
        .atmosphereColor(pal.atmosphere)
        .atmosphereAltitude(0.16)
        .hexPolygonsData(countries)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.34)
        .hexPolygonUseDots(true)
        .hexPolygonAltitude(0.006)
        .hexPolygonColor(() => pal.hex)
        .pointsData([])
        .pointLat((d: object) => (d as PointDatum).lat)
        .pointLng((d: object) => (d as PointDatum).lng)
        .pointColor((d: object) => (d as PointDatum).color)
        .pointAltitude(0.01)
        .pointRadius(0.55)
        .ringColor((d: object) => (t: number) =>
          hexRgba((d as RingDatum).color, 1 - t),
        )
        .ringMaxRadius("maxR")
        .ringPropagationSpeed(2.2)
        .ringRepeatPeriod(700);
      globe = g;

      try {
        (g.globeMaterial() as { color: { set: (c: string) => void } }).color.set(
          pal.globeColor,
        );
      } catch {
        /* material not ready */
      }

      const controls = g.controls() as {
        autoRotate: boolean;
        autoRotateSpeed: number;
        enableZoom: boolean;
        enablePan: boolean;
      };
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.55;
      // Disable scroll-zoom so the globe doesn't hijack page scrolling inside
      // the dashboard; drag-to-spin still works.
      controls.enableZoom = false;
      controls.enablePan = false;
      g.pointOfView({ lat: 22, lng: 8, altitude: 2.4 }, 0);

      const resize = () => {
        if (!containerRef.current) return;
        g.width(containerRef.current.clientWidth);
        g.height(containerRef.current.clientHeight);
      };
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(containerRef.current);

      timers.push(
        setInterval(() => {
          spawn();
          spawn();
          if (Math.random() < 0.6) spawn();
        }, 220),
      );
      for (let i = 0; i < 10; i++) setTimeout(spawn, i * 90);
    };

    (async () => {
      let countries: object[] = [];
      try {
        const topo = await (await fetch(countriesUrl)).json();
        countries = (
          feature(topo, topo.objects.countries) as unknown as {
            features: object[];
          }
        ).features;
      } catch {
        /* offline — globe still renders without country dots */
      }
      initGlobe(countries);
    })();

    return () => {
      destroyed = true;
      timers.forEach(clearInterval);
      resizeObserver?.disconnect();
      const withDestructor = globe as { _destructor?: () => void } | null;
      withDestructor?._destructor?.();
    };
    // Re-init the globe when the color scheme changes so it picks up the palette.
  }, [isDark]);

  return (
    <Box
      sx={{
        position: "relative",
        flex: 1,
        minHeight: 280,
        borderRadius: 1,
        overflow: "hidden",
        background: t.stageBg,
      }}
    >
      <Box ref={containerRef} sx={{ position: "absolute", inset: 0 }} />

      {/* Live stats */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          flexDirection: "column",
          gap: 1.75,
          pointerEvents: "none",
        }}
      >
        {(
          [
            { label: "Total Requests", value: stats.total, color: t.totalText },
            { label: "Allowed", value: stats.allowed, color: t.num.allowed },
            {
              label: "Category Blocked",
              value: stats.category,
              color: t.num.category,
            },
            {
              label: "Threats Blocked",
              value: stats.threat,
              color: t.num.threat,
            },
          ] as const
        ).map((s) => (
          <Box key={s.label}>
            <Typography variant="body2" sx={{ color: t.label }}>
              {s.label}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: s.color,
              }}
            >
              {Math.round(s.value).toLocaleString("en-US")}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* LIVE indicator */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.25,
          py: 0.75,
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".4px",
          color: t.liveText,
          bgcolor: t.liveBg,
          border: `1px solid ${t.liveBorder}`,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "#2BA6E8",
            animation: "geoGlobePulse 1.8s ease-out infinite",
            "@keyframes geoGlobePulse": {
              "0%": { boxShadow: "0 0 0 0 rgba(43,166,232,.5)" },
              "70%": { boxShadow: "0 0 0 7px rgba(43,166,232,0)" },
              "100%": { boxShadow: "0 0 0 0 rgba(43,166,232,0)" },
            },
          }}
        />
        LIVE
      </Box>

      {/* Verdict legend */}
      <Box
        sx={{
          position: "absolute",
          bottom: 12,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 2,
          pointerEvents: "none",
        }}
      >
        {LEGEND.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              fontSize: 12,
              fontWeight: 500,
              color: t.legendText,
            }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: "2px",
                bgcolor: item.color,
              }}
            />
            {item.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
