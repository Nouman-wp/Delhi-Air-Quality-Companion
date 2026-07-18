import type { Request, Response } from "express";
import { getCurrentWeather } from "../services/weather.service.js";
import { parseCoordsQuery } from "../utils/validation.util.js";

export async function currentWeather(req: Request, res: Response): Promise<void> {
  const coords = parseCoordsQuery(req.query);
  const weather = await getCurrentWeather(coords);
  res.json(weather);
}
