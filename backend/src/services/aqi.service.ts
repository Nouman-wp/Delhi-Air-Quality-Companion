import { env } from "../config/env.js";
import type { AQIReading, Coordinates } from "../types/index.js";
import { pm25ToAqi, aqiToCategory, aqiToColor, seededRandom } from "../utils/aqi.util.js";
import { getStore } from "./dataStore.js";

const WAQI_BASE = "https://api.waqi.info";

async function fetchFromWaqi(coords: Coordinates): Promise<AQIReading | null> {
  if (!env.waqiToken) return null;
  try {
    const res = await fetch(
      `${WAQI_BASE}/feed/geo:${coords.lat};${coords.lon}/?token=${env.waqiToken}`
    );
    if (!res.ok) return null;
    const json = (await res.json()) as any;
    if (json.status !== "ok" || !json.data || json.data.aqi === "-") return null;

    const aqi = Number(json.data.aqi);
    const pm25 = json.data.iaqi?.pm25?.v ?? null;
    const pm10 = json.data.iaqi?.pm10?.v ?? null;
    const category = aqiToCategory(aqi);

    return {
      lat: coords.lat,
      lon: coords.lon,
      aqi,
      pm25: pm25 ?? Math.round(aqi * 0.6),
      pm10: pm10 ?? Math.round(aqi * 0.85),
      category,
      color: aqiToColor(aqi),
      stationName: json.data.city?.name,
      source: "waqi",
      timestamp: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Generates realistic, stable-per-location, time-of-day-aware simulated AQI
 * so the product remains fully demonstrable without a WAQI token or when the
 * live API is unreachable. Delhi's real diurnal pattern (worse at
 * night/early morning, better in early afternoon) is modeled directly.
 */
function simulateAqi(coords: Coordinates): AQIReading {
  const hour = new Date().getHours();
  const diurnalFactor = hour >= 12 && hour <= 16 ? 0.75 : hour >= 0 && hour <= 7 ? 1.25 : 1.0;
  const locationSeed = coords.lat * 1000 + coords.lon * 1000;
  const noise = seededRandom(locationSeed + hour) * 60 - 30;

  const baseAqi = 180; // Delhi's realistic year-round baseline
  const aqi = Math.max(35, Math.round(baseAqi * diurnalFactor + noise));
  const pm25 = Math.max(10, Math.round(aqi * 0.62));
  const pm10 = Math.max(15, Math.round(aqi * 0.9));

  return {
    lat: coords.lat,
    lon: coords.lon,
    aqi,
    pm25,
    pm10,
    category: aqiToCategory(aqi),
    color: aqiToColor(aqi),
    stationName: "Simulated (no live station nearby)",
    source: "simulated",
    timestamp: new Date().toISOString(),
  };
}

export async function getCurrentAqi(coords: Coordinates): Promise<AQIReading> {
  const store = getStore();
  const cached = await store.getCachedAqiNear(coords, 15).catch(() => null);
  if (cached) return cached;

  const live = await fetchFromWaqi(coords);
  const reading = live ?? simulateAqi(coords);

  store.cacheAqiReading(reading).catch(() => {});
  return reading;
}

/**
 * Samples a coarse grid of points around a center so the frontend can render
 * a Strava-style AQI heatmap overlay. Uses the simulated model directly
 * (rather than one WAQI call per cell, which would just return the same
 * nearest-station reading for every nearby point and produce a flat, un-map-
 * like overlay) so the heatmap shows a realistic-looking spatial gradient.
 * The live WAQI reading is still used for the single "current location" spot.
 */
export async function getAqiGrid(center: Coordinates, radiusKm = 8, gridSize = 7): Promise<AQIReading[]> {
  const degreesPerKm = 1 / 111; // approx at Delhi's latitude
  const span = radiusKm * degreesPerKm;
  const points: Coordinates[] = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const fracLat = i / (gridSize - 1) - 0.5;
      const fracLon = j / (gridSize - 1) - 0.5;
      points.push({
        lat: center.lat + fracLat * span * 2,
        lon: center.lon + fracLon * span * 2,
      });
    }
  }

  return points.map((p) => simulateAqi(p));
}

export async function getAqiAlongPath(points: Coordinates[]): Promise<AQIReading[]> {
  const sampled = samplePoints(points, 6);
  return Promise.all(sampled.map((p) => getCurrentAqi(p)));
}

function samplePoints(points: Coordinates[], maxSamples: number): Coordinates[] {
  if (points.length <= maxSamples) return points;
  const step = (points.length - 1) / (maxSamples - 1);
  return Array.from({ length: maxSamples }, (_, i) => points[Math.round(i * step)]);
}

export function pm25ToAqiValue(pm25: number): number {
  return pm25ToAqi(pm25);
}
