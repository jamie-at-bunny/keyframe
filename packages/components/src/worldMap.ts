// The world map artwork (world-map.svg in the app's public/) and the projection
// that puts a city on it.
//
// The fit was derived rather than guessed: eight cities were placed on the
// artwork by eye, checked at full resolution, and then longitude was
// least-squares fitted to x and latitude to y. It comes out equirectangular in
// both axes. The equator lands at v = 0.572 rather than 0.5 because the map
// crops most of Antarctica, and the prime meridian at u = 0.457 rather than 0.5
// for the same kind of reason horizontally.
export const WORLD_MAP = "world-map.svg";
export const MAP_RATIO = 6995 / 3521;

// Fractions across and down the map image, so callers stay independent of how
// large the map is drawn.
export const project = (lat: number, lon: number) => ({
  u: 0.456678 + 0.0028846 * lon,
  v: 0.571968 - 0.0067649 * lat,
});

// Where the map sits: left edge, vertical centre and width, in stage pixels.
export type MapBox = { x: number; cy: number; w: number; h: number };

export const mapBox = (x: number, cy: number, w: number): MapBox => ({ x, cy, w, h: w / MAP_RATIO });

export const onMap = (box: MapBox, lat: number, lon: number) => {
  const { u, v } = project(lat, lon);

  return { x: box.x + u * box.w, y: box.cy - box.h / 2 + v * box.h };
};
