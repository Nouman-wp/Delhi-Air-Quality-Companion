import { apiClient } from "./client";
import type { HealthProfile, PublicUser } from "../../types";

export async function registerRequest(params: {
  email: string;
  password: string;
  name: string;
  healthProfile: HealthProfile;
}): Promise<PublicUser> {
  const res = await apiClient.post("/auth/register", params);
  return res.data.user;
}

export async function loginRequest(email: string, password: string): Promise<PublicUser> {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data.user;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function meRequest(): Promise<PublicUser | null> {
  try {
    const res = await apiClient.get("/auth/me");
    return res.data.user;
  } catch {
    return null;
  }
}

export async function updateHealthProfileRequest(healthProfile: HealthProfile): Promise<PublicUser> {
  const res = await apiClient.patch("/auth/profile", { healthProfile });
  return res.data.user;
}
