import type { AQICategory } from "../types/index.js";

/**
 * US EPA PM2.5 breakpoints (µg/m³ -> AQI). Used to derive an AQI value
 * when a provider gives raw pollutant concentrations instead of an index.
 */
const PM25_BREAKPOINTS = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

export function pm25ToAqi(pm25: number): number {
  const bp =
    PM25_BREAKPOINTS.find((b) => pm25 >= b.cLow && pm25 <= b.cHigh) ??
    PM25_BREAKPOINTS[PM25_BREAKPOINTS.length - 1];
  const aqi =
    ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
  return Math.round(aqi);
}

export function aqiToCategory(aqi: number): AQICategory {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy-sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}

export function aqiToColor(aqi: number): string {
  if (aqi <= 50) return "#22c55e"; // green
  if (aqi <= 100) return "#eab308"; // yellow
  if (aqi <= 150) return "#f97316"; // orange
  if (aqi <= 200) return "#ef4444"; // red
  if (aqi <= 300) return "#a855f7"; // purple
  return "#7f1d1d"; // maroon - hazardous
}

export function aqiToLabel(category: AQICategory): string {
  switch (category) {
    case "good":
      return "Good";
    case "moderate":
      return "Moderate";
    case "unhealthy-sensitive":
      return "Unhealthy for Sensitive Groups";
    case "unhealthy":
      return "Unhealthy";
    case "very-unhealthy":
      return "Very Unhealthy";
    case "hazardous":
      return "Hazardous";
  }
}

/** Deterministic pseudo-random generator so simulated data is stable per-location. */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
