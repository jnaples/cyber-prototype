// A dotted world map with borders, drawn from the same TopoJSON the globe
// pages use.
//
// Land is stippled: the country shapes are filled into an offscreen canvas,
// sampled on a grid, and a dot painted wherever that sample is land — so the
// grain stays even at any zoom instead of scaling up with the map. Borders are
// stroked over it, and US states come in once the view is close enough to tell
// them apart. A canvas can't resolve CSS variables, so the colors are literals.

import { Box } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { feature, mesh } from "topojson-client";
import statesUrl from "us-atlas/states-10m.json?url";
import countriesUrl from "world-atlas/countries-110m.json?url";

import { DOT, GAP, project, window_, type MapView } from "./map-projection";

/** Below this the state lines are noise rather than information. */
const STATE_ZOOM = 3;

const WHOLE_WORLD: MapView = { zoom: 1, center: { lat: 0, lon: 0 } };

type Ring = [number, number][];

/** TopoJSON gives GeoJSON back; all this draws is rings of lon/lat pairs. */
type Shapes = { fills: Ring[][]; lines: Ring[] };

function ringsOf(geometry: GeoJSON.Geometry): Ring[][] {
  if (geometry.type === "Polygon") return [geometry.coordinates as Ring[]];
  if (geometry.type === "MultiPolygon")
    return geometry.coordinates as unknown as Ring[][];
  return [];
}

function linesOf(geometry: GeoJSON.Geometry): Ring[] {
  if (geometry.type === "LineString") return [geometry.coordinates as Ring];
  if (geometry.type === "MultiLineString")
    return geometry.coordinates as unknown as Ring[];
  return [];
}

/* eslint-disable @typescript-eslint/no-explicit-any -- the atlas topologies
   ship no types, and everything read out of them is narrowed below. */
async function loadShapes(url: string, object: string): Promise<Shapes> {
  const topology = (await (await fetch(url)).json()) as any;
  const collection = topology.objects[object];
  const shapes = feature(
    topology,
    collection,
  ) as unknown as GeoJSON.FeatureCollection;
  return {
    fills: shapes.features.flatMap((f) => ringsOf(f.geometry)),
    // The whole mesh, unfiltered: coastlines as well as the borders between
    // neighbours, and each arc drawn once rather than twice.
    lines: linesOf(mesh(topology, collection) as GeoJSON.Geometry),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function DottedMap({
  children,
  height = 320,
  view = WHOLE_WORLD,
}: {
  /** Pins and readouts, positioned against the same box. */
  children?: React.ReactNode;
  height?: number;
  /** How far in, and around what. Omit for the whole map. */
  view?: MapView;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode, systemMode } = useColorScheme();
  const dark = (mode === "system" ? systemMode : mode) !== "light";
  const [countries, setCountries] = useState<Shapes | null>(null);
  const [states, setStates] = useState<Shapes | null>(null);

  // The geometry, fetched once and kept for every repaint.
  useEffect(() => {
    loadShapes(countriesUrl, "countries")
      .then(setCountries)
      .catch(() => {});
  }, []);

  // States only matter once the view is close in, so they load on demand.
  useEffect(() => {
    if (states || view.zoom < STATE_ZOOM) return;
    loadShapes(statesUrl, "states")
      .then(setStates)
      .catch(() => {});
  }, [states, view.zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !countries) return;

    const paint = () => {
      const { width, height: boxHeight } = canvas.getBoundingClientRect();
      if (!width || !boxHeight) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = boxHeight * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, boxHeight);

      // One transform for everything: a coordinate to a point in the box.
      const { left, top, span } = window_(view);
      const place = ([lon, lat]: [number, number]) => {
        const p = project({ lat, lon });
        return [
          ((p.x - left) / span) * width,
          ((p.y - top) / span) * boxHeight,
        ];
      };

      const trace = (rings: Ring[]) => {
        rings.forEach((ring) => {
          ctx.beginPath();
          ring.forEach((point, i) => {
            const [x, y] = place(point);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        });
      };

      // Land, filled at grid resolution, then read back as the dots.
      const cols = Math.ceil(width / GAP);
      const rows = Math.ceil(boxHeight / GAP);
      const probe = document.createElement("canvas");
      probe.width = cols;
      probe.height = rows;
      const probeCtx = probe.getContext("2d", { willReadFrequently: true });
      if (!probeCtx) return;
      probeCtx.fillStyle = "#000";
      countries.fills.forEach((polygon) => {
        probeCtx.beginPath();
        polygon.forEach((ring) => {
          ring.forEach((point, i) => {
            const [x, y] = place(point);
            if (i === 0) probeCtx.moveTo(x / GAP, y / GAP);
            else probeCtx.lineTo(x / GAP, y / GAP);
          });
          probeCtx.closePath();
        });
        probeCtx.fill();
      });
      const { data } = probeCtx.getImageData(0, 0, cols, rows);

      ctx.fillStyle = dark
        ? "rgba(120, 138, 190, 0.45)"
        : "rgba(30, 41, 74, 0.32)";
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          if (data[(row * cols + col) * 4 + 3] < 24) continue;
          ctx.beginPath();
          ctx.arc(
            col * GAP + GAP / 2,
            row * GAP + GAP / 2,
            DOT,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }

      // Borders over the stipple: countries always, states once close in.
      // One color and weight for both — a state line reads as the same kind
      // of edge as the country line it runs into.
      ctx.lineJoin = "round";
      ctx.strokeStyle = dark
        ? "rgba(120, 138, 190, 0.55)"
        : "rgba(30, 41, 74, 0.38)";
      ctx.lineWidth = 1;
      if (states && view.zoom >= STATE_ZOOM) trace(states.lines);
      trace(countries.lines);
    };

    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [countries, states, dark, view]);

  return (
    <Box sx={{ position: "relative", height, overflow: "hidden" }}>
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{ display: "block", width: "100%", height: "100%" }}
      />
      {children}
    </Box>
  );
}
