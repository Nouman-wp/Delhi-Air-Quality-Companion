import type { Request, Response } from "express";
import { z } from "zod";
import { registerUser, loginUser, getUserById, toPublicUser } from "../services/auth.service.js";
import { getStore } from "../services/dataStore.js";
import { isProduction } from "../config/env.js";
import { HttpError } from "../middleware/error.middleware.js";

const HEALTH_PROFILES = ["adult", "child", "senior", "asthma", "copd", "pregnant", "athlete"] as const;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  healthProfile: z.enum(HEALTH_PROFILES).default("adult"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid input.");

  try {
    const { user, token } = await registerUser(parsed.data);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user, token });
  } catch (err) {
    throw new HttpError(409, err instanceof Error ? err.message : "Registration failed.");
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Email and password are required.");

  try {
    const { user, token } = await loginUser(parsed.data.email, parsed.data.password);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ user, token });
  } catch (err) {
    throw new HttpError(401, err instanceof Error ? err.message : "Login failed.");
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie("token");
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = req.userId ? await getUserById(req.userId) : null;
  if (!user) throw new HttpError(401, "Not authenticated.");
  res.json({ user: toPublicUser(user) });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const schema = z.object({ healthProfile: z.enum(HEALTH_PROFILES) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Invalid health profile.");
  if (!req.userId) throw new HttpError(401, "Not authenticated.");

  await getStore().updateUserHealthProfile(req.userId, parsed.data.healthProfile);
  const user = await getUserById(req.userId);
  res.json({ user: user ? toPublicUser(user) : null });
}
