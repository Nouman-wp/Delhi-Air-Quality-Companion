import type { Request, Response } from "express";
import { searchPlaces } from "../services/search.service.js";

export async function search(req: Request, res: Response): Promise<void> {
  const query = String(req.query.q ?? "");
  const results = await searchPlaces(query);
  res.json({ results });
}
