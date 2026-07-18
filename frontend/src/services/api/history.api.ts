import { apiClient } from "./client";
import type { ExposureAnalytics, ExposureRecord, TravelMode } from "../../types";

export async function getExposureHistory(): Promise<ExposureRecord[]> {
  const res = await apiClient.get("/history");
  return res.data.history;
}

export async function getExposureAnalytics(): Promise<ExposureAnalytics> {
  const res = await apiClient.get("/history/analytics");
  return res.data;
}

export async function recordExposure(params: {
  distanceMeters: number;
  mode: TravelMode;
  averageAqi: number;
  exposureScore: number;
  routeLabel?: string;
}): Promise<ExposureRecord> {
  const res = await apiClient.post("/history", params);
  return res.data.record;
}
