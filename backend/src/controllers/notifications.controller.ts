import type { Request, Response } from "express";
import { generateSmartNotifications } from "../services/notifications.service.js";
import { parseCoordsQuery } from "../utils/validation.util.js";

export async function notifications(req: Request, res: Response): Promise<void> {
  const coords = parseCoordsQuery(req.query);
  const items = await generateSmartNotifications(coords);
  res.json({ notifications: items });
}
