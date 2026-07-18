import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";
import { getStore } from "./dataStore.js";
import type { HealthProfile, PublicUser, User } from "../types/index.js";

const TOKEN_TTL = "30d";

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    healthProfile: user.healthProfile,
    createdAt: user.createdAt,
  };
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, env.jwtSecret) as { userId: string };
  } catch {
    return null;
  }
}

export async function registerUser(params: {
  email: string;
  password: string;
  name: string;
  healthProfile: HealthProfile;
}): Promise<{ user: PublicUser; token: string }> {
  const store = getStore();
  const existing = await store.getUserByEmail(params.email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(params.password, 10);
  const user: User = {
    id: uuid(),
    email: params.email.toLowerCase(),
    passwordHash,
    name: params.name,
    healthProfile: params.healthProfile,
    createdAt: new Date().toISOString(),
  };

  await store.createUser(user);
  return { user: toPublicUser(user), token: signToken(user.id) };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: PublicUser; token: string }> {
  const store = getStore();
  const user = await store.getUserByEmail(email);
  if (!user) throw new Error("Invalid email or password.");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password.");

  return { user: toPublicUser(user), token: signToken(user.id) };
}

export async function getUserById(id: string): Promise<User | null> {
  return getStore().getUserById(id);
}
