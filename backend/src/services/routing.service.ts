import { env } from "../config/env.js";
import type { Coordinates, RouteStep, TravelMode } from "../types/index.js";

export interface RawRoute {
  label: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteStep[];
}

const MAPBOX_PROFILE: Record<TravelMode, string> = {
  walking: "walking",
  cycling: "cycling",
  driving: "driving",
};

const AVERAGE_SPEED_KPH: Record<TravelMode, number> = {
  walking: 5,
  cycling: 15,
  driving: 24, // Delhi urban traffic average
};

function haversineMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchFromMapbox(
  origin: Coordinates,
  destination: Coordinates,
  mode: TravelMode
): Promise<RawRoute[] | null> {
  if (!env.mapboxToken) return null;
  try {
    const profile = MAPBOX_PROFILE[mode];
    const coords = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?alternatives=true&geometries=geojson&overview=full&access_token=${env.mapboxToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as any;
    if (!json.routes?.length) return null;

    return json.routes.map((route: any, idx: number): RawRoute => ({
      label: idx === 0 ? "Fastest Route" : `Alternative Route ${idx + 1}`,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geometry: route.geometry.coordinates.map(([lon, lat]: [number, number]) => ({ lat, lon })),
    }));
  } catch {
    return null;
  }
}

/** Builds a slightly-curved synthetic path between two points via a midpoint offset. */
function buildOffsetPath(origin: Coordinates, destination: Coordinates, offsetFraction: number): RouteStep[] {
  const steps = 12;
  const midLat = (origin.lat + destination.lat) / 2;
  const midLon = (origin.lon + destination.lon) / 2;

  const dLat = destination.lat - origin.lat;
  const dLon = destination.lon - origin.lon;
  const length = Math.sqrt(dLat * dLat + dLon * dLon) || 1;
  const perpLat = -dLon / length;
  const perpLon = dLat / length;

  const controlLat = midLat + perpLat * offsetFraction * length;
  const controlLon = midLon + perpLon * offsetFraction * length;

  const points: RouteStep[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat =
      (1 - t) * (1 - t) * origin.lat + 2 * (1 - t) * t * controlLat + t * t * destination.lat;
    const lon =
      (1 - t) * (1 - t) * origin.lon + 2 * (1 - t) * t * controlLon + t * t * destination.lon;
    points.push({ lat, lon });
  }
  return points;
}

function simulateRoutes(origin: Coordinates, destination: Coordinates, mode: TravelMode): RawRoute[] {
  const directDistance = haversineMeters(origin, destination);
  const speedMps = (AVERAGE_SPEED_KPH[mode] * 1000) / 3600;

  const variants = [
    { label: "Fastest Route", offset: 0.06, distanceFactor: 1.15 },
    { label: "Alternative Route 2", offset: -0.18, distanceFactor: 1.3 },
  ];

  return variants.map((v) => {
    const distanceMeters = directDistance * v.distanceFactor;
    return {
      label: v.label,
      distanceMeters,
      durationSeconds: distanceMeters / speedMps,
      geometry: buildOffsetPath(origin, destination, v.offset),
    };
  });
}

export async function getRawRoutes(
  origin: Coordinates,
  destination: Coordinates,
  mode: TravelMode
): Promise<{ routes: RawRoute[]; source: "mapbox" | "simulated" }> {
  const live = await fetchFromMapbox(origin, destination, mode);
  if (live && live.length > 0) return { routes: live, source: "mapbox" };
  return { routes: simulateRoutes(origin, destination, mode), source: "simulated" };
}
