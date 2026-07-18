import { z } from "zod";
import { HttpError } from "../middleware/error.middleware.js";
import type { Coordinates } from "../types/index.js";

const coordsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export function parseCoordsQuery(query: unknown): Coordinates {
  const parsed = coordsSchema.safeParse(query);
  if (!parsed.success) throw new HttpError(400, "Valid lat and lon query parameters are required.");
  return parsed.data;
}
