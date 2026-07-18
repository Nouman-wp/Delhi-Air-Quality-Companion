import type {
  User,
  AQIReading,
  ExposureRecord,
  Place,
  HealthAdvisory,
  Coordinates,
} from "../types/index.js";
import type { DataStore, ExposureAnalytics, AdvisoryMatch } from "../types/store.types.js";
import { cosineSimilarity } from "../utils/embedding.util.js";

function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export class MemoryStore implements DataStore {
  readonly backend = "memory" as const;

  private users: User[] = [];
  private aqiCache: AQIReading[] = [];
  private exposures: ExposureRecord[] = [];
  private places: Place[] = [];
  private advisories: HealthAdvisory[] = [];

  async init(): Promise<void> {
    // nothing to bootstrap for an in-memory store
  }

  async createUser(user: User): Promise<void> {
    this.users.push(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async updateUserHealthProfile(id: string, healthProfile: User["healthProfile"]): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (user) user.healthProfile = healthProfile;
  }

  async cacheAqiReading(reading: AQIReading): Promise<void> {
    this.aqiCache.push(reading);
    if (this.aqiCache.length > 5000) this.aqiCache.shift();
  }

  async getCachedAqiNear(coords: Coordinates, maxAgeMinutes: number): Promise<AQIReading | null> {
    const cutoff = Date.now() - maxAgeMinutes * 60_000;
    let best: { reading: AQIReading; distance: number } | null = null;
    for (const reading of this.aqiCache) {
      if (new Date(reading.timestamp).getTime() < cutoff) continue;
      const distance = haversineKm(coords, { lat: reading.lat, lon: reading.lon });
      if (distance > 5) continue;
      if (!best || distance < best.distance) best = { reading, distance };
    }
    return best?.reading ?? null;
  }

  async recordExposure(record: ExposureRecord): Promise<void> {
    this.exposures.push(record);
  }

  async getExposureHistory(userId: string, limit = 100): Promise<ExposureRecord[]> {
    return this.exposures
      .filter((e) => e.userId === userId)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, limit);
  }

  async getExposureAnalytics(userId: string): Promise<ExposureAnalytics> {
    const records = this.exposures.filter((e) => e.userId === userId);
    if (records.length === 0) {
      return { totalDistanceMeters: 0, averageAqi: 0, bestDay: null, worstDay: null, dailyBreakdown: [] };
    }
    const byDate = new Map<string, ExposureRecord[]>();
    for (const r of records) {
      const list = byDate.get(r.date) ?? [];
      list.push(r);
      byDate.set(r.date, list);
    }
    const dailyBreakdown = Array.from(byDate.entries())
      .map(([date, recs]) => ({
        date,
        exposureScore: Math.round(recs.reduce((s, r) => s + r.exposureScore, 0) / recs.length),
        averageAqi: Math.round(recs.reduce((s, r) => s + r.averageAqi, 0) / recs.length),
        distanceMeters: recs.reduce((s, r) => s + r.distanceMeters, 0),
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    const totalDistanceMeters = records.reduce((s, r) => s + r.distanceMeters, 0);
    const averageAqi = Math.round(records.reduce((s, r) => s + r.averageAqi, 0) / records.length);
    const best = dailyBreakdown.reduce((a, b) => (a.averageAqi <= b.averageAqi ? a : b));
    const worst = dailyBreakdown.reduce((a, b) => (a.averageAqi >= b.averageAqi ? a : b));

    return {
      totalDistanceMeters,
      averageAqi,
      bestDay: { date: best.date, averageAqi: best.averageAqi },
      worstDay: { date: worst.date, averageAqi: worst.averageAqi },
      dailyBreakdown,
    };
  }

  async upsertPlaces(places: Place[]): Promise<void> {
    for (const place of places) {
      const idx = this.places.findIndex((p) => p.id === place.id);
      if (idx >= 0) this.places[idx] = place;
      else this.places.push(place);
    }
  }

  async searchNearbyPlaces(coords: Coordinates, radiusKm: number): Promise<Place[]> {
    return this.places
      .map((p) => ({ place: p, distance: haversineKm(coords, p.location) }))
      .filter((x) => x.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map((x) => x.place);
  }

  async upsertAdvisories(advisories: HealthAdvisory[]): Promise<void> {
    for (const advisory of advisories) {
      const idx = this.advisories.findIndex((a) => a.id === advisory.id);
      if (idx >= 0) this.advisories[idx] = advisory;
      else this.advisories.push(advisory);
    }
  }

  async searchAdvisories(_queryText: string, queryVector: number[], topK = 4): Promise<AdvisoryMatch[]> {
    return this.advisories
      .map((a) => ({ ...a, score: a.vector ? cosineSimilarity(a.vector, queryVector) : 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
