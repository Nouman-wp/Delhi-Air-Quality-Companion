import type {
  User,
  AQIReading,
  ExposureRecord,
  Place,
  HealthAdvisory,
  Coordinates,
} from "./index.js";

export interface ExposureAnalytics {
  totalDistanceMeters: number;
  averageAqi: number;
  bestDay: { date: string; averageAqi: number } | null;
  worstDay: { date: string; averageAqi: number } | null;
  dailyBreakdown: { date: string; exposureScore: number; averageAqi: number; distanceMeters: number }[];
}

export interface AdvisoryMatch extends HealthAdvisory {
  score: number;
}

/**
 * Storage abstraction implemented either by Elasticsearch (preferred, and
 * required for the geo / time-series / vector-search features this product
 * is built around) or an in-memory fallback so the app keeps working end to
 * end when no Elastic deployment is configured or reachable.
 */
export interface DataStore {
  readonly backend: "elasticsearch" | "memory";

  init(): Promise<void>;

  createUser(user: User): Promise<void>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  updateUserHealthProfile(id: string, healthProfile: User["healthProfile"]): Promise<void>;

  cacheAqiReading(reading: AQIReading): Promise<void>;
  getCachedAqiNear(coords: Coordinates, maxAgeMinutes: number): Promise<AQIReading | null>;

  recordExposure(record: ExposureRecord): Promise<void>;
  getExposureHistory(userId: string, limit?: number): Promise<ExposureRecord[]>;
  getExposureAnalytics(userId: string): Promise<ExposureAnalytics>;

  upsertPlaces(places: Place[]): Promise<void>;
  searchNearbyPlaces(coords: Coordinates, radiusKm: number): Promise<Place[]>;

  upsertAdvisories(advisories: HealthAdvisory[]): Promise<void>;
  searchAdvisories(queryText: string, queryVector: number[], topK?: number): Promise<AdvisoryMatch[]>;
}
