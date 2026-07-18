import type { Request, Response } from "express";
import { getCurrentAqi, getAqiGrid } from "../services/aqi.service.js";
import { parseCoordsQuery } from "../utils/validation.util.js";

export async function currentAqi(req: Request, res: Response): Promise<void> {
  const coords = parseCoordsQuery(req.query);
  const reading = await getCurrentAqi(coords);
  res.json(reading);
}

export async function aqiGrid(req: Request, res: Response): Promise<void> {
  const coords = parseCoordsQuery(req.query);
  const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 8;
  const grid = await getAqiGrid(coords, radiusKm);
  res.json({ points: grid });
}
