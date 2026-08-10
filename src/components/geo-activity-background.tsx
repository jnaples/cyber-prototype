// Geo network background — a dark world map with a static dot at each of our
// anycast server locations, plus arcs that animate in from customer locations
// around the world to the server that answers them. Login page backdrop.

import { Box } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { useEffect, useRef } from "react";

// Scheme-aware scene palette. Dark is the original "space" look; light is an
// inverted daytime version.
const THEMES = {
  dark: {
    bg: "radial-gradient(120% 120% at 50% 0%, #0a1f30 0%, #05121e 55%, #020a12 100%)",
    map: "#233A50",
    grid: "rgba(61,185,247,.045)",
    vignette:
      "radial-gradient(80% 80% at 50% 45%, transparent 55%, rgba(2,8,14,.75) 100%)",
    dot: "#4EC6FF",
    halo: "rgba(78,198,255,.18)",
    glow: "rgba(78,198,255,.55)",
    arc: "#4EC6FF",
    origin: "#EAF8FF",
  },
  light: {
    bg: "radial-gradient(120% 120% at 50% 0%, #f4f8ff 0%, #e6eef8 55%, #d7e3f1 100%)",
    map: "#BCCCDC",
    grid: "rgba(53,89,116,.07)",
    vignette:
      "radial-gradient(80% 80% at 50% 45%, transparent 55%, rgba(215,227,241,.65) 100%)",
    dot: "#1E7FB8",
    halo: "rgba(35,140,210,.16)",
    glow: "rgba(35,140,210,.45)",
    arc: "#238CD2",
    origin: "#1E7FB8",
  },
} as const;

// Server locations — [lon, lat, city].
const SERVERS: [number, number, string][] = [
  // North America
  [-122.3, 47.6, "Seattle"],
  [-121.9, 37.3, "San Jose"],
  [-118.2, 34.05, "Los Angeles"],
  [-104.99, 39.74, "Denver"],
  [-96.8, 32.78, "Dallas"],
  [-87.6, 41.88, "Chicago"],
  [-84.39, 33.75, "Atlanta"],
  [-80.19, 25.77, "Miami"],
  [-74.0, 40.71, "New York"],
  [-79.38, 43.65, "Toronto"],
  // South America
  [-46.63, -23.55, "São Paulo"],
  [-70.65, -33.45, "Santiago"],
  // Europe
  [-3.7, 40.42, "Madrid"],
  [-0.13, 51.51, "London"],
  [2.35, 48.86, "Paris"],
  [4.9, 52.37, "Amsterdam"],
  [8.68, 50.11, "Frankfurt"],
  [9.19, 45.46, "Milan"],
  [18.07, 59.33, "Stockholm"],
  [26.1, 44.43, "Bucharest"],
  // Middle East + Africa
  [55.3, 25.27, "Dubai"],
  [28.05, -26.2, "Johannesburg"],
  // Asia
  [72.88, 19.08, "Mumbai"],
  [80.27, 13.08, "Chennai"],
  [103.82, 1.35, "Singapore"],
  [114.16, 22.32, "Hong Kong"],
  [126.98, 37.57, "Seoul"],
  [135.5, 34.69, "Osaka"],
  [139.69, 35.69, "Tokyo"],
  // Oceania
  [151.21, -33.87, "Sydney"],
];

// Where customer requests come from — [lon, lat, weight]. Weight biases how
// often a city fires, so busy metros light up more.
const CUSTOMERS: [number, number, number][] = [
  [-74, 40.7, 9],
  [-118.2, 34, 13],
  [-87.6, 41.8, 5],
  [-95.4, 29.8, 4],
  [-122.3, 37.6, 13],
  [-121.9, 37.3, 8],
  [-117.2, 32.7, 8],
  [-121.5, 38.6, 4],
  [-96.8, 32.8, 6],
  [-97.7, 30.3, 5],
  [-98.5, 29.4, 4],
  [-122.3, 47.6, 6],
  [-122.7, 45.5, 4],
  [-104.99, 39.7, 5],
  [-112.07, 33.45, 4],
  [-115.1, 36.2, 4],
  [-93.3, 45, 4],
  [-80.2, 25.8, 4],
  [-84.4, 33.7, 4],
  [-77, 38.9, 5],
  [-71.06, 42.36, 4],
  [-75.16, 39.95, 3],
  [-79.4, 43.7, 3],
  [-99.1, 19.4, 4],
  [-46.6, -23.5, 4],
  [-58.4, -34.6, 2],
  [-77, -12, 2],
  [-74.1, 4.7, 2],
  [-0.1, 51.5, 8],
  [2.35, 48.85, 6],
  [13.4, 52.5, 5],
  [-3.7, 40.4, 3],
  [12.5, 41.9, 3],
  [4.9, 52.4, 3],
  [37.6, 55.7, 5],
  [30.5, 50.4, 2],
  [28.9, 41, 3],
  [18.4, -33.9, 2],
  [3.4, 6.5, 3],
  [31.2, 30, 3],
  [36.8, -1.3, 2],
  [72.8, 19, 8],
  [77.2, 28.6, 7],
  [88.4, 22.6, 3],
  [121.5, 31.2, 9],
  [116.4, 39.9, 8],
  [114.1, 22.4, 4],
  [139.7, 35.7, 8],
  [135.5, 34.7, 3],
  [126.98, 37.57, 6],
  [103.8, 1.35, 4],
  [106.8, -6.2, 4],
  [100.5, 13.75, 3],
  [151.2, -33.9, 4],
  [144.96, -37.8, 2],
  [55.3, 25.3, 3],
  [46.7, 24.7, 2],
  [101.7, 3.14, 2],
  [121, 14.6, 3],
];
const WSUM = CUSTOMERS.reduce((sum, c) => sum + c[2], 0);

const NS = "http://www.w3.org/2000/svg";

// Equirectangular projection into the map SVG's 1052.4 × 580 viewBox. The
// source map's landmasses sit a bit higher than a naive 90..-90 mapping, so
// LAT_OFFSET nudges every marker south to line up with the geography.
const LAT_OFFSET = 13;
const proj = (lon: number, lat: number): [number, number] => [
  ((lon + 180) / 360) * 1052.4,
  ((90 - (lat - LAT_OFFSET)) / 180) * 580,
];

const SERVER_POINTS = SERVERS.map(([lon, lat, city]) => {
  const [x, y] = proj(lon, lat);
  return { x, y, city };
});

// Requests land on the closest server, so arcs stay short and legible.
const nearestServer = (x: number, y: number) =>
  SERVER_POINTS.reduce((best, s) =>
    (s.x - x) ** 2 + (s.y - y) ** 2 < (best.x - x) ** 2 + (best.y - y) ** 2
      ? s
      : best,
  );

export function GeoActivityBackground() {
  const arcsRef = useRef<SVGGElement | null>(null);
  const { mode, systemMode } = useColorScheme();
  const pal =
    (mode === "system" ? systemMode : mode) === "dark"
      ? THEMES.dark
      : THEMES.light;

  useEffect(() => {
    const g = arcsRef.current;
    if (!g) return;

    let destroyed = false;
    let timer: ReturnType<typeof setTimeout>;

    const pickCustomer = () => {
      let r = Math.random() * WSUM;
      for (const c of CUSTOMERS) {
        r -= c[2];
        if (r <= 0) return c;
      }
      return CUSTOMERS[0];
    };

    const fire = () => {
      const [clon, clat] = pickCustomer();
      // Jitter so repeat hits on a metro don't stack on the same pixel.
      const [x1, y1] = proj(
        clon + (Math.random() - 0.5) * 6,
        clat + (Math.random() - 0.5) * 6,
      );
      const { x: x2, y: y2 } = nearestServer(x1, y1);

      const grp = document.createElementNS(NS, "g");

      // Quadratic curve bowing away from the straight line — longer hops arc
      // higher, and the side alternates so parallel routes don't overlap.
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy) || 1;
      const lift = Math.min(90, dist * 0.32) * (Math.random() < 0.5 ? 1 : -1);
      const cx = (x1 + x2) / 2 - (dy / dist) * lift;
      const cy = (y1 + y2) / 2 + (dx / dist) * lift;

      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`);
      path.setAttribute("class", "ga-arc");
      grp.appendChild(path);

      const origin = document.createElementNS(NS, "circle");
      origin.setAttribute("cx", x1.toFixed(1));
      origin.setAttribute("cy", y1.toFixed(1));
      origin.setAttribute("r", "2");
      origin.setAttribute("class", "ga-origin");
      grp.appendChild(origin);

      g.appendChild(grp);

      const len = path.getTotalLength();
      const draw = 900 + dist * 1.6;
      path.style.strokeDasharray = `${len}`;
      path.animate(
        [
          { strokeDashoffset: len, opacity: 0.9 },
          { strokeDashoffset: 0, opacity: 0.9, offset: 0.75 },
          { strokeDashoffset: 0, opacity: 0 },
        ],
        { duration: draw + 500, easing: "cubic-bezier(.3,.6,.3,1)" },
      );
      origin.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: draw + 500,
        easing: "ease-out",
      });

      setTimeout(() => grp.parentNode?.removeChild(grp), draw + 500);
    };

    const spawn = () => {
      if (destroyed) return;
      fire();
      timer = setTimeout(spawn, 180 + Math.random() * 420);
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
        "& .ga-arc": {
          fill: "none",
          stroke: pal.arc,
          strokeWidth: 1.1,
          strokeLinecap: "round",
        },
        "& .ga-origin": { fill: pal.origin },
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

      {/* World map + server dots. The wrapper carries the map's exact aspect
          ratio and both the mask (map) and the overlay fill it 1:1, so the dot
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
            filter: `drop-shadow(0 0 4px ${pal.glow})`,
          }}
        >
          {/* Traffic arcs render under the server dots. */}
          <g ref={arcsRef} />
          {SERVER_POINTS.map(({ x, y, city }) => (
            <g key={city}>
              <circle cx={x} cy={y} r={7} fill={pal.halo} />
              <circle cx={x} cy={y} r={3} fill={pal.dot} />
            </g>
          ))}
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
