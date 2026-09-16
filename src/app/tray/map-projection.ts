// The dotted map's projection and grain, apart from the component that draws
// it so both can be imported without dragging the other along.

/** The source map's own projection: equirectangular, cropped top and bottom.
 *  Nudge these two if a pin lands off its city. */
const LAT_TOP = 83;
const LAT_BOTTOM = -56;

/** Grid spacing and dot radius, in CSS pixels. */
export const GAP = 7;
export const DOT = 1.1;

export type MapPoint = { lat: number; lon: number };

/** Where a coordinate falls on the whole map, as a fraction of it. */
export function project({ lat, lon }: MapPoint) {
  return {
    x: (lon + 180) / 360,
    y: (LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM),
  };
}

/** How much of the map is on screen, and around what. */
export type MapView = { zoom: number; center: MapPoint };

/** The visible window, as fractions of the whole map. Clamped so a center
 *  near an edge pans the window rather than showing empty space past it. */
export function window_(view: MapView) {
  const { x, y } = project(view.center);
  const span = 1 / Math.max(1, view.zoom);
  const half = span / 2;
  return {
    span,
    left: Math.min(Math.max(x, half), 1 - half) - half,
    top: Math.min(Math.max(y, half), 1 - half) - half,
  };
}

/** Where a coordinate falls inside that window, as a fraction of the box. */
export function viewProject(point: MapPoint, view: MapView) {
  const { left, top, span } = window_(view);
  const { x, y } = project(point);
  return { x: (x - left) / span, y: (y - top) / span };
}
