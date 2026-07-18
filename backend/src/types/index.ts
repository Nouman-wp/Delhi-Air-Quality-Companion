export type HealthProfile =
  | "adult"
  | "child"
  | "senior"
  | "asthma"
  | "copd"
  | "pregnant"
  | "athlete";

export type TravelMode = "walking" | "cycling" | "driving";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  healthProfile: HealthProfile;
  createdAt: string;
}

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

export type AQICategory =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

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

export interface Place {
  id: string;
  name: string;
  type: "park" | "trail" | "sports-complex" | "garden";
  location: Coordinates;
  aqi?: number;
  description: string;
}

export interface HealthAdvisory {
  id: string;
  text: string;
  tags: string[];
  vector?: number[];
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}
