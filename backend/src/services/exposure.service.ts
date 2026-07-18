import type { AQIReading, HealthProfile, RouteOption, TravelMode } from "../types/index.js";

const MODE_VENTILATION_MULTIPLIER: Record<TravelMode, number> = {
  walking: 1.0,
  cycling: 1.7,
  driving: 0.35, // largely enclosed cabin, windows assumed up
};

const SENSITIVE_PROFILES: HealthProfile[] = ["child", "senior", "asthma", "copd", "pregnant"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Exposure Score models cumulative pollutant dose rather than a snapshot
 * AQI reading: it combines ambient pollution level, time spent breathing it
 * in, how hard the body is working (ventilation rate by travel mode), and a
 * humidity adjustment (fine particulates penetrate deeper in humid air).
 * Scaled so everyday commutes land roughly on a 0-100 band, with an
 * unclamped ceiling so extreme exposure is still visibly distinguishable.
 */
export function computeExposureScore(params: {
  averageAqi: number;
  durationSeconds: number;
  mode: TravelMode;
  humidity?: number;
}): number {
  const { averageAqi, durationSeconds, mode, humidity = 50 } = params;
  const durationMinutes = durationSeconds / 60;
  const modeMultiplier = MODE_VENTILATION_MULTIPLIER[mode];
  const humidityFactor = clamp(1 + (humidity - 50) / 200, 0.9, 1.15);

  const raw = (averageAqi / 100) * durationMinutes * modeMultiplier * humidityFactor;
  return Math.round(clamp(raw * 2.3, 0, 150));
}

export function healthRatingForScore(score: number): RouteOption["healthRating"] {
  if (score <= 35) return "recommended";
  if (score <= 65) return "moderate";
  return "avoid";
}

export function buildRecommendation(params: {
  healthRating: RouteOption["healthRating"];
  mode: TravelMode;
  maxAqi: number;
  healthProfile?: HealthProfile;
}): string {
  const { healthRating, mode, maxAqi, healthProfile } = params;
  const isSensitive = healthProfile && SENSITIVE_PROFILES.includes(healthProfile);

  if (healthRating === "recommended") {
    return `Good choice — low pollution exposure for ${mode}. Safe to proceed as planned.`;
  }
  if (healthRating === "moderate") {
    const maskNote = isSensitive ? " Consider wearing an N95 mask given your health profile." : "";
    return `Moderate exposure for ${mode}. Fine for most people, but pace yourself.${maskNote}`;
  }
  const alt =
    mode === "driving"
      ? "Keep windows closed and recirculate cabin air."
      : "Consider postponing, switching to an enclosed vehicle, or picking a cleaner route.";
  const peak = maxAqi > 250 ? " Peak AQI on this route is hazardous." : "";
  return `High exposure — avoid if possible.${peak} ${alt}`;
}

export function averageOf(readings: AQIReading[]): number {
  if (readings.length === 0) return 0;
  return Math.round(readings.reduce((sum, r) => sum + r.aqi, 0) / readings.length);
}

export function maxOf(readings: AQIReading[]): number {
  if (readings.length === 0) return 0;
  return Math.max(...readings.map((r) => r.aqi));
}
