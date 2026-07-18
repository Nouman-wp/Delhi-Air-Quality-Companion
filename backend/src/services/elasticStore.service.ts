import { Client } from "@elastic/elasticsearch";
import type {
  User,
  AQIReading,
  ExposureRecord,
  Place,
  HealthAdvisory,
  Coordinates,
} from "../types/index.js";
import type { DataStore, ExposureAnalytics, AdvisoryMatch } from "../types/store.types.js";
import { EMBEDDING_DIMS } from "../utils/embedding.util.js";
import { env } from "../config/env.js";

const INDEX = {
  users: "airwise-users",
  aqi: "airwise-aqi-cache",
  exposure: "airwise-exposure",
  places: "airwise-places",
  advisories: "airwise-advisories",
};

export class ElasticStore implements DataStore {
  readonly backend = "elasticsearch" as const;
  private client: Client;

  constructor() {
    this.client = new Client({
      node: env.elasticsearchNode!,
      auth: env.elasticsearchApiKey
        ? { apiKey: env.elasticsearchApiKey }
        : env.elasticsearchUsername && env.elasticsearchPassword
          ? { username: env.elasticsearchUsername, password: env.elasticsearchPassword }
          : undefined,
    });
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async init(): Promise<void> {
    await this.ensureIndex(INDEX.users, {
      properties: {
        id: { type: "keyword" },
        email: { type: "keyword" },
        passwordHash: { type: "keyword", index: false },
        name: { type: "text" },
        healthProfile: { type: "keyword" },
        createdAt: { type: "date" },
      },
    });
    await this.ensureIndex(INDEX.aqi, {
      properties: {
        location: { type: "geo_point" },
        lat: { type: "float" },
        lon: { type: "float" },
        aqi: { type: "integer" },
        pm25: { type: "float" },
        pm10: { type: "float" },
        category: { type: "keyword" },
        color: { type: "keyword" },
        stationName: { type: "text" },
        source: { type: "keyword" },
        timestamp: { type: "date" },
      },
    });
    await this.ensureIndex(INDEX.exposure, {
      properties: {
        id: { type: "keyword" },
        userId: { type: "keyword" },
        date: { type: "date" },
        distanceMeters: { type: "float" },
        mode: { type: "keyword" },
        averageAqi: { type: "float" },
        exposureScore: { type: "float" },
        routeLabel: { type: "text" },
      },
    });
    await this.ensureIndex(INDEX.places, {
      properties: {
        id: { type: "keyword" },
        name: { type: "text" },
        type: { type: "keyword" },
        location: { type: "geo_point" },
        description: { type: "text" },
      },
    });
    await this.ensureIndex(INDEX.advisories, {
      properties: {
        id: { type: "keyword" },
        text: { type: "text" },
        tags: { type: "keyword" },
        vector: {
          type: "dense_vector",
          dims: EMBEDDING_DIMS,
          index: true,
          similarity: "cosine",
        },
      },
    });
  }

  private async ensureIndex(name: string, mappings: Record<string, unknown>): Promise<void> {
    const exists = await this.client.indices.exists({ index: name });
    if (!exists) {
      await this.client.indices.create({ index: name, mappings: mappings as any });
    }
  }

  async createUser(user: User): Promise<void> {
    await this.client.index({ index: INDEX.users, id: user.id, document: user, refresh: "wait_for" });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const res = await this.client.search<User>({
      index: INDEX.users,
      query: { term: { email } },
      size: 1,
    });
    return res.hits.hits[0]?._source ?? null;
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const res = await this.client.get<User>({ index: INDEX.users, id });
      return res._source ?? null;
    } catch {
      return null;
    }
  }

  async updateUserHealthProfile(id: string, healthProfile: User["healthProfile"]): Promise<void> {
    await this.client.update({
      index: INDEX.users,
      id,
      doc: { healthProfile },
      refresh: "wait_for",
    });
  }

  async cacheAqiReading(reading: AQIReading): Promise<void> {
    await this.client.index({
      index: INDEX.aqi,
      document: { ...reading, location: { lat: reading.lat, lon: reading.lon } },
    });
  }

  async getCachedAqiNear(coords: Coordinates, maxAgeMinutes: number): Promise<AQIReading | null> {
    const res = await this.client.search<AQIReading>({
      index: INDEX.aqi,
      size: 1,
      query: {
        bool: {
          filter: [
            { range: { timestamp: { gte: `now-${maxAgeMinutes}m` } } },
            {
              geo_distance: {
                distance: "5km",
                location: { lat: coords.lat, lon: coords.lon },
              },
            },
          ],
        },
      },
      sort: [
        {
          _geo_distance: {
            location: { lat: coords.lat, lon: coords.lon },
            order: "asc",
            unit: "km",
          } as any,
        },
      ],
    });
    return res.hits.hits[0]?._source ?? null;
  }

  async recordExposure(record: ExposureRecord): Promise<void> {
    await this.client.index({ index: INDEX.exposure, id: record.id, document: record });
  }

  async getExposureHistory(userId: string, limit = 100): Promise<ExposureRecord[]> {
    const res = await this.client.search<ExposureRecord>({
      index: INDEX.exposure,
      size: limit,
      query: { term: { userId } },
      sort: [{ date: { order: "desc" } }],
    });
    return res.hits.hits.map((h) => h._source!).filter(Boolean);
  }

  async getExposureAnalytics(userId: string): Promise<ExposureAnalytics> {
    const res = await this.client.search({
      index: INDEX.exposure,
      size: 0,
      query: { term: { userId } },
      aggs: {
        total_distance: { sum: { field: "distanceMeters" } },
        avg_aqi: { avg: { field: "averageAqi" } },
        by_day: {
          date_histogram: { field: "date", calendar_interval: "day", format: "yyyy-MM-dd" },
          aggs: {
            avg_aqi: { avg: { field: "averageAqi" } },
            avg_exposure: { avg: { field: "exposureScore" } },
            total_distance: { sum: { field: "distanceMeters" } },
          },
        },
      },
    });

    const aggs = res.aggregations as any;
    const buckets: any[] = aggs?.by_day?.buckets ?? [];
    const dailyBreakdown = buckets
      .filter((b) => b.doc_count > 0)
      .map((b) => ({
        date: b.key_as_string,
        averageAqi: Math.round(b.avg_aqi.value ?? 0),
        exposureScore: Math.round(b.avg_exposure.value ?? 0),
        distanceMeters: b.total_distance.value ?? 0,
      }));

    const bestDay = dailyBreakdown.length
      ? dailyBreakdown.reduce((a, b) => (a.averageAqi <= b.averageAqi ? a : b))
      : null;
    const worstDay = dailyBreakdown.length
      ? dailyBreakdown.reduce((a, b) => (a.averageAqi >= b.averageAqi ? a : b))
      : null;

    return {
      totalDistanceMeters: aggs?.total_distance?.value ?? 0,
      averageAqi: Math.round(aggs?.avg_aqi?.value ?? 0),
      bestDay: bestDay ? { date: bestDay.date, averageAqi: bestDay.averageAqi } : null,
      worstDay: worstDay ? { date: worstDay.date, averageAqi: worstDay.averageAqi } : null,
      dailyBreakdown,
    };
  }

  async upsertPlaces(places: Place[]): Promise<void> {
    if (places.length === 0) return;
    const operations = places.flatMap((p) => [
      { index: { _index: INDEX.places, _id: p.id } },
      { ...p, location: { lat: p.location.lat, lon: p.location.lon } },
    ]);
    await this.client.bulk({ operations, refresh: "wait_for" });
  }

  async searchNearbyPlaces(coords: Coordinates, radiusKm: number): Promise<Place[]> {
    const res = await this.client.search<any>({
      index: INDEX.places,
      size: 50,
      query: {
        geo_distance: {
          distance: `${radiusKm}km`,
          location: { lat: coords.lat, lon: coords.lon },
        },
      },
      sort: [
        {
          _geo_distance: {
            location: { lat: coords.lat, lon: coords.lon },
            order: "asc",
            unit: "km",
          } as any,
        },
      ],
    });
    return res.hits.hits.map((h) => h._source!).filter(Boolean);
  }

  async upsertAdvisories(advisories: HealthAdvisory[]): Promise<void> {
    if (advisories.length === 0) return;
    const operations = advisories.flatMap((a) => [
      { index: { _index: INDEX.advisories, _id: a.id } },
      { id: a.id, text: a.text, tags: a.tags, vector: a.vector },
    ]);
    await this.client.bulk({ operations, refresh: "wait_for" });
  }

  async searchAdvisories(queryText: string, queryVector: number[], topK = 4): Promise<AdvisoryMatch[]> {
    const res = await this.client.search<HealthAdvisory>({
      index: INDEX.advisories,
      knn: {
        field: "vector",
        query_vector: queryVector,
        k: topK,
        num_candidates: 50,
      },
      size: topK,
    });
    return res.hits.hits.map((h) => ({ ...(h._source as HealthAdvisory), score: h._score ?? 0 }));
  }
}
