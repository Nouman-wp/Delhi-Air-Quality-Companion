import { apiClient } from "./client";
import type { AQIReading, Coordinates } from "../../types";

export async function getCurrentAqi(coords: Coordinates): Promise<AQIReading> {
  const res = await apiClient.get("/aqi/current", { params: coords });
  return res.data;
}

export async function getAqiGrid(coords: Coordinates, radiusKm = 8): Promise<AQIReading[]> {
  const res = await apiClient.get("/aqi/grid", { params: { ...coords, radiusKm } });
  return res.data.points;
}
