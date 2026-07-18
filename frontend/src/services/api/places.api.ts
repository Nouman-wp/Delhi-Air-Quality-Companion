import { apiClient } from "./client";
import type { Coordinates, Place } from "../../types";

export async function getNearbyPlaces(coords: Coordinates, radiusKm = 15): Promise<Place[]> {
  const res = await apiClient.get("/places/nearby", { params: { ...coords, radiusKm } });
  return res.data.places;
}
