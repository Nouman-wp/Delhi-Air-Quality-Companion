import type { HealthProfile } from "../types";

const SENSITIVE_PROFILES: HealthProfile[] = ["child", "senior", "asthma", "copd", "pregnant"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Derives 0-100 "how good is it to do this activity right now" scores from
 * the current AQI. Running/cycling are penalized more steeply than general
 * outdoor activity since exertion increases inhalation rate; sensitive
 * health profiles get an additional penalty once AQI crosses 100.
 */
export function computeActivityScores(aqi: number, healthProfile: HealthProfile) {
  const sensitivePenalty = SENSITIVE_PROFILES.includes(healthProfile) && aqi > 100 ? 12 : 0;

  const outdoor = clamp(100 - (aqi - 30) * 0.4 - sensitivePenalty, 0, 100);
  const running = clamp(100 - (aqi - 30) * 0.55 - sensitivePenalty, 0, 100);
  const cycling = clamp(100 - (aqi - 30) * 0.5 - sensitivePenalty, 0, 100);

  return {
    outdoor: Math.round(outdoor),
    running: Math.round(running),
    cycling: Math.round(cycling),
  };
}

export function scoreLabel(score: number): string {
  if (score >= 75) return "Great";
  if (score >= 55) return "Fair";
  if (score >= 35) return "Poor";
  return "Avoid";
}

export function scoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 55) return "#eab308";
  if (score >= 35) return "#f97316";
  return "#ef4444";
}
