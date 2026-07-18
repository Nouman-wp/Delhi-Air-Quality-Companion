import { getCurrentAqi } from "./aqi.service.js";
import { getCurrentWeather } from "./weather.service.js";
import type { Coordinates } from "../types/index.js";

export interface SmartNotification {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
}

/**
 * Rule-based situational notifications derived from live AQI + weather.
 * No background scheduler is needed since Delhi's pollution patterns are
 * strongly diurnal — the current hour combined with current readings is
 * enough to give a meaningfully accurate "what's changing soon" signal.
 */
export async function generateSmartNotifications(coords: Coordinates): Promise<SmartNotification[]> {
  const [aqi, weather] = await Promise.all([getCurrentAqi(coords), getCurrentWeather(coords)]);
  const notifications: SmartNotification[] = [];
  const hour = new Date().getHours();

  if (aqi.aqi > 200) {
    notifications.push({
      id: "aqi-high",
      severity: "critical",
      title: "Air quality is unhealthy right now",
      message: `AQI is ${aqi.aqi} nearby. Outdoor exercise is not recommended — consider an indoor workout instead.`,
    });
  } else if (aqi.aqi > 150) {
    notifications.push({
      id: "aqi-elevated",
      severity: "warning",
      title: "Elevated pollution levels",
      message: `AQI is ${aqi.aqi}. Sensitive groups should limit prolonged outdoor exertion.`,
    });
  }

  if (hour >= 5 && hour <= 8 && aqi.aqi > 150) {
    notifications.push({
      id: "morning-inversion",
      severity: "warning",
      title: "Poor conditions likely to persist this morning",
      message: "Early-morning temperature inversion is trapping pollutants. Conditions typically improve by early afternoon.",
    });
  }

  if (hour >= 11 && hour <= 15 && aqi.aqi <= 150) {
    notifications.push({
      id: "good-window",
      severity: "info",
      title: "Good time for outdoor activity",
      message: `Midday AQI (${aqi.aqi}) is relatively favorable. A good window for a run or walk.`,
    });
  }

  if (weather.windSpeedKph > 12) {
    notifications.push({
      id: "wind-improving",
      severity: "info",
      title: "Wind conditions improving",
      message: `Wind speed is ${Math.round(weather.windSpeedKph)} kph, helping disperse pollutants faster than usual.`,
    });
  }

  if (hour >= 18 || hour <= 4) {
    notifications.push({
      id: "evening-buildup",
      severity: "info",
      title: "Poor conditions expected overnight",
      message: "Calmer winds and cooler air after sunset tend to trap pollutants. Expect AQI to climb into the night.",
    });
  }

  if (notifications.length === 0) {
    notifications.push({
      id: "all-clear",
      severity: "info",
      title: "Conditions look stable",
      message: `AQI is ${aqi.aqi}, within a manageable range. No immediate concerns.`,
    });
  }

  return notifications;
}
