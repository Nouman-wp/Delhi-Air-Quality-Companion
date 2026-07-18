import type { Request, Response } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { getRawRoutes } from "../services/routing.service.js";
import { getAqiAlongPath } from "../services/aqi.service.js";
import { getCurrentWeather } from "../services/weather.service.js";
import {
  averageOf,
  maxOf,
  computeExposureScore,
  healthRatingForScore,
  buildRecommendation,
} from "../services/exposure.service.js";
import { HttpError } from "../middleware/error.middleware.js";
import type { RouteOption } from "../types/index.js";

const coordsSchema = z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) });

const bodySchema = z.object({
  origin: coordsSchema,
  destination: coordsSchema,
  mode: z.enum(["walking", "cycling", "driving"]).default("walking"),
  healthProfile: z
    .enum(["adult", "child", "senior", "asthma", "copd", "pregnant", "athlete"])
    .optional(),
});

export async function compareRoutes(req: Request, res: Response): Promise<void> {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid request body.");
  const { origin, destination, mode, healthProfile } = parsed.data;

  const [{ routes: rawRoutes, source }, weather] = await Promise.all([
    getRawRoutes(origin, destination, mode),
    getCurrentWeather(origin),
  ]);

  const routes: RouteOption[] = await Promise.all(
    rawRoutes.map(async (raw): Promise<RouteOption> => {
      const aqiReadings = await getAqiAlongPath(raw.geometry);
      const averageAqi = averageOf(aqiReadings);
      const maxAqi = maxOf(aqiReadings);
      const exposureScore = computeExposureScore({
        averageAqi,
        durationSeconds: raw.durationSeconds,
        mode,
        humidity: weather.humidity,
      });
      const healthRating = healthRatingForScore(exposureScore);
      const recommendation = buildRecommendation({ healthRating, mode, maxAqi, healthProfile });

      return {
        id: uuid(),
        label: raw.label,
        mode,
        distanceMeters: raw.distanceMeters,
        durationSeconds: raw.durationSeconds,
        geometry: raw.geometry,
        averageAqi,
        maxAqi,
        exposureScore,
        healthRating,
        recommendation,
      };
    })
  );

  const recommendedRouteId = routes.reduce((best, r) =>
    r.exposureScore < best.exposureScore ? r : best
  ).id;

  res.json({ routes, recommendedRouteId, routingSource: source });
}
