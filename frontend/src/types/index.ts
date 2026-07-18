export type HealthProfile =
  | "adult"
  | "child"
  | "senior"
  | "asthma"
  | "copd"
  | "pregnant"
  | "athlete";

export type TravelMode = "walking" | "cycling" | "driving";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  healthProfile: HealthProfile;
  createdAt: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export type AQICategory =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

export interface AQIReading {
  lat: number;
  lon: number;
  aqi: number;
  pm25: number;
  pm10: number;
  category: AQICategory;
  color: string;
  stationName?: string;
  source: "waqi" | "simulated";
  timestamp: string;
}

export interface WeatherData {
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedKph: number;
  windDirectionDeg: number;
  uvIndex: number;
  condition: string;
  isDay: boolean;
  timestamp: string;
}

export interface RouteStep {
  lat: number;
  lon: number;
}

export interface RouteOption {
  id: string;
  label: string;
  mode: TravelMode;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteStep[];
  averageAqi: number;
  maxAqi: number;
  exposureScore: number;
  healthRating: "recommended" | "moderate" | "avoid";
  recommendation: string;
}

export interface ExposureRecord {
  id: string;
  userId: string;
  date: string;
  distanceMeters: number;
  mode: TravelMode;
  averageAqi: number;
  exposureScore: number;
  routeLabel?: string;
}

export interface ExposureAnalytics {
  totalDistanceMeters: number;
  averageAqi: number;
  bestDay: { date: string; averageAqi: number } | null;
  worstDay: { date: string; averageAqi: number } | null;
  dailyBreakdown: { date: string; exposureScore: number; averageAqi: number; distanceMeters: number }[];
}

export interface Place {
  id: string;
  name: string;
  type: "park" | "trail" | "sports-complex" | "garden";
  location: Coordinates;
  aqi?: number;
  description: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface SmartNotification {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
}

export interface SearchResult {
  name: string;
  placeName: string;
  lat: number;
  lon: number;
}
