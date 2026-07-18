import type { Request, Response } from "express";
import { findNearbySafePlaces } from "../services/places.service.js";
import { parseCoordsQuery } from "../utils/validation.util.js";

export async function nearbyPlaces(req: Request, res: Response): Promise<void> {
  const coords = parseCoordsQuery(req.query);
  const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 15;
  const places = await findNearbySafePlaces(coords, radiusKm);
  res.json({ places });
}
