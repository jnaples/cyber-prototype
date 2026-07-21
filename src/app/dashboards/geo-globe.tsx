// Geo Activity globe for the dashboard widget. A spinnable globe (globe.gl /
// three.js) with country outlines drawn as hex dots and ~100 "site" markers.
// Drag to rotate; it also auto-rotates. Uses the locally bundled world-atlas
// data, so it needs no map token or network — unlike Mapbox.

import { Box } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import Globe, { type GlobeInstance } from "globe.gl";
import { useEffect, useRef } from "react";
import { feature } from "topojson-client";

import countriesUrl from "world-atlas/countries-110m.json?url";

// Seed metros the 100 site markers scatter around.
const CITIES: { lat: number; lng: number }[] = [
  { lat: 40.71, lng: -74.0 }, { lat: 34.05, lng: -118.24 },
  { lat: 41.88, lng: -87.63 }, { lat: 29.76, lng: -95.37 },
  { lat: 37.77, lng: -122.42 }, { lat: 47.61, lng: -122.33 },
  { lat: 25.76, lng: -80.19 }, { lat: 43.65, lng: -79.38 },
  { lat: 19.43, lng: -99.13 }, { lat: -23.55, lng: -46.63 },
  { lat: -34.6, lng: -58.38 }, { lat: 51.51, lng: -0.13 },
  { lat: 48.85, lng: 2.35 }, { lat: 52.52, lng: 13.4 },
  { lat: 40.42, lng: -3.7 }, { lat: 41.9, lng: 12.5 },
  { lat: 55.75, lng: 37.62 }, { lat: 30.04, lng: 31.24 },
  { lat: -26.2, lng: 28.04 }, { lat: 25.2, lng: 55.27 },
  { lat: 28.61, lng: 77.21 }, { lat: 19.08, lng: 72.88 },
  { lat: 1.35, lng: 103.82 }, { lat: -6.21, lng: 106.85 },
  { lat: 31.23, lng: 121.47 }, { lat: 39.9, lng: 116.41 },
  { lat: 35.68, lng: 139.69 }, { lat: 37.57, lng: 126.98 },
  { lat: -33.87, lng: 151.21 }, { lat: -36.85, lng: 174.76 },
];

const POINT_COLORS = ["#2BADF5", "#3527FD", "#05C6C6"] as const;

const THEMES = {
  dark: { globe: "#0a1729", atmosphere: "#2BADF5", hex: "rgba(95,158,235,0.5)" },
  light: { globe: "#e8eefa", atmosphere: "#2BADF5", hex: "rgba(53,39,253,0.4)" },
} as const;

type PointDatum = { lat: number; lng: number; color: string };

export function GeoGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mode, systemMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pal = isDark ? THEMES.dark : THEMES.light;

    let destroyed = false;
    let globe: GlobeInstance | null = null;
    let resizeObserver: ResizeObserver | null = null;

    // 100 site markers scattered around the seed metros.
    const points: PointDatum[] = Array.from({ length: 100 }, (_, i) => {
      const src = CITIES[i % CITIES.length];
      const jitter = () => (Math.random() - 0.5) * 12;
      return {
        lat: Math.max(-58, Math.min(72, src.lat + jitter())),
        lng: src.lng + jitter(),
        color: POINT_COLORS[Math.floor(Math.random() * POINT_COLORS.length)],
      };
    });

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
        .pointsData(points)
        .pointLat((d: object) => (d as PointDatum).lat)
        .pointLng((d: object) => (d as PointDatum).lng)
        .pointColor((d: object) => (d as PointDatum).color)
        .pointAltitude(0.02)
        .pointRadius(0.5);
      globe = g;

      try {
        (g.globeMaterial() as { color: { set: (c: string) => void } }).color.set(
          pal.globe,
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
      controls.autoRotateSpeed = 0.5;
      // Keep scroll-zoom off so the globe doesn't hijack dashboard scrolling;
      // drag-to-spin still works.
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
      resizeObserver?.disconnect();
      const withDestructor = globe as { _destructor?: () => void } | null;
      withDestructor?._destructor?.();
    };
  }, [isDark]);

  return <Box ref={containerRef} sx={{ position: "absolute", inset: 0 }} />;
}
