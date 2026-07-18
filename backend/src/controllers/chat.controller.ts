import type { Request, Response } from "express";
import { z } from "zod";
import { generateChatReply } from "../services/ai.service.js";
import { getUserById } from "../services/auth.service.js";
import { HttpError } from "../middleware/error.middleware.js";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .default([]),
  location: z.object({ lat: z.number(), lon: z.number() }).optional(),
});

export async function chat(req: Request, res: Response): Promise<void> {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid request.");

  const user = req.userId ? await getUserById(req.userId) : null;

  const { reply, groundedOn } = await generateChatReply({
    message: parsed.data.message,
    history: parsed.data.history,
    location: parsed.data.location,
    healthProfile: user?.healthProfile,
  });

  res.json({ reply, groundedOn });
}
