import type { AQICategory } from "../types";

export function aqiToColor(aqi: number): string {
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
}

export function aqiToCategory(aqi: number): AQICategory {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy-sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}

export function categoryLabel(category: AQICategory): string {
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

export function healthRatingColor(rating: "recommended" | "moderate" | "avoid"): string {
  switch (rating) {
    case "recommended":
      return "#22c55e";
    case "moderate":
      return "#eab308";
    case "avoid":
      return "#ef4444";
  }
}
