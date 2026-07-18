import type { Request, Response } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { getStore } from "../services/dataStore.js";
import { HttpError } from "../middleware/error.middleware.js";
import type { ExposureRecord } from "../types/index.js";

const recordSchema = z.object({
  distanceMeters: z.number().min(0),
  mode: z.enum(["walking", "cycling", "driving"]),
  averageAqi: z.number().min(0),
  exposureScore: z.number().min(0),
  routeLabel: z.string().optional(),
  date: z.string().optional(),
});

export async function listHistory(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new HttpError(401, "Not authenticated.");
  const history = await getStore().getExposureHistory(req.userId, 200);
  res.json({ history });
}

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new HttpError(401, "Not authenticated.");
  const analytics = await getStore().getExposureAnalytics(req.userId);
  res.json(analytics);
}

export async function recordExposure(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw new HttpError(401, "Not authenticated.");
  const parsed = recordSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid input.");

  const record: ExposureRecord = {
    id: uuid(),
    userId: req.userId,
    date: parsed.data.date ?? new Date().toISOString().slice(0, 10),
    distanceMeters: parsed.data.distanceMeters,
    mode: parsed.data.mode,
    averageAqi: parsed.data.averageAqi,
    exposureScore: parsed.data.exposureScore,
    routeLabel: parsed.data.routeLabel,
  };

  await getStore().recordExposure(record);
  res.status(201).json({ record });
}
