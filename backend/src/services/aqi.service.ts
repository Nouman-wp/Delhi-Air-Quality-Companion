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

// Delhi NCR bounding box — the heatmap always covers this whole region so the
// map never has empty patches, regardless of where the user is standing.
const NCR_BOUNDS = { latMin: 28.2, latMax: 29.05, lonMin: 76.75, lonMax: 77.65 };

// Spatially-correlated pollution structure: real-ish Delhi hotspots (traffic +
// industrial corridors push AQI up) and cleaner zones (the Ridge, Aravallis and
// outskirts pull it down). Modeled as smooth Gaussians so the field reads as
// continuous plumes rather than random noise.
const POLLUTION_SOURCES: { lat: number; lon: number; strength: number; sigma: number }[] = [
  { lat: 28.651, lon: 77.316, strength: 105, sigma: 0.08 }, // Anand Vihar
  { lat: 28.628, lon: 77.241, strength: 60, sigma: 0.07 }, // ITO / central traffic
  { lat: 28.53, lon: 77.28, strength: 70, sigma: 0.075 }, // Okhla industrial
  { lat: 28.7, lon: 77.155, strength: 80, sigma: 0.08 }, // Wazirpur / Bawana Rd
  { lat: 28.83, lon: 77.06, strength: 75, sigma: 0.09 }, // Narela / Bawana industrial
  { lat: 28.4, lon: 77.31, strength: 65, sigma: 0.085 }, // Faridabad industrial
  { lat: 28.67, lon: 77.45, strength: 70, sigma: 0.09 }, // Ghaziabad
  { lat: 28.585, lon: 77.06, strength: 55, sigma: 0.08 }, // Najafgarh / west
  // Cleaner pockets (negative strength)
  { lat: 28.54, lon: 77.17, strength: -55, sigma: 0.07 }, // Delhi Ridge / JNU
  { lat: 28.45, lon: 77.1, strength: -50, sigma: 0.09 }, // Aravalli south outskirts
  { lat: 28.76, lon: 77.23, strength: -30, sigma: 0.07 }, // Yamuna biodiversity park
];

function pollutionFieldAt(lat: number, lon: number, hour: number): number {
  const diurnalFactor = hour >= 12 && hour <= 16 ? 0.72 : hour >= 0 && hour <= 7 ? 1.28 : 1.0;
  let value = 155; // Delhi's realistic year-round baseline

  for (const src of POLLUTION_SOURCES) {
    const dLat = lat - src.lat;
    const dLon = (lon - src.lon) * Math.cos((lat * Math.PI) / 180);
    const dist2 = dLat * dLat + dLon * dLon;
    value += src.strength * Math.exp(-dist2 / (2 * src.sigma * src.sigma));
  }

  // Gentle low-frequency ripple so isopleths aren't perfectly circular.
  value += 12 * Math.sin(lat * 22 + 1.3) * Math.cos(lon * 19);
  value *= diurnalFactor;

  return Math.max(28, Math.min(480, Math.round(value)));
}

/**
 * Builds a dense, spatially-smooth AQI field across the whole of Delhi NCR so
 * the frontend can render a Strava-style heatmap with no empty spots. Uses the
 * simulated pollution-field model directly (rather than one WAQI call per cell,
 * which would just echo the same nearest-station reading everywhere) to produce
 * a continuous, realistic gradient. The live WAQI reading is still used for the
 * single "current location" spot on the dashboard.
 */
export async function getAqiGrid(center: Coordinates, _radiusKm = 8, gridSize = 34): Promise<AQIReading[]> {
  const hour = new Date().getHours();

  // Cover the NCR box, expanded if needed so the user's location is never on an
  // uncovered edge.
  const latMin = Math.min(NCR_BOUNDS.latMin, center.lat - 0.12);
  const latMax = Math.max(NCR_BOUNDS.latMax, center.lat + 0.12);
  const lonMin = Math.min(NCR_BOUNDS.lonMin, center.lon - 0.12);
  const lonMax = Math.max(NCR_BOUNDS.lonMax, center.lon + 0.12);

  const readings: AQIReading[] = [];
  const timestamp = new Date().toISOString();

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = latMin + (latMax - latMin) * (i / (gridSize - 1));
      const lon = lonMin + (lonMax - lonMin) * (j / (gridSize - 1));
      const aqi = pollutionFieldAt(lat, lon, hour);
      readings.push({
        lat,
        lon,
        aqi,
        pm25: Math.max(10, Math.round(aqi * 0.62)),
        pm10: Math.max(15, Math.round(aqi * 0.9)),
        category: aqiToCategory(aqi),
        color: aqiToColor(aqi),
        source: "simulated",
        timestamp,
      });
    }
  }

  return readings;
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
