export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export const HEALTH_PROFILE_LABELS: Record<string, string> = {
  adult: "Adult",
  child: "Child",
  senior: "Senior Citizen",
  asthma: "Asthma",
  copd: "COPD",
  pregnant: "Pregnant",
  athlete: "Athlete",
};
