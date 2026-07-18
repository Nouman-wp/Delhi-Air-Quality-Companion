import { apiClient } from "./client";
import type { Coordinates, HealthProfile, RouteOption, TravelMode } from "../../types";

export interface RouteComparisonResult {
  routes: RouteOption[];
  recommendedRouteId: string;
  routingSource: "mapbox" | "simulated";
}

export async function compareRoutes(params: {
  origin: Coordinates;
  destination: Coordinates;
  mode: TravelMode;
  healthProfile?: HealthProfile;
}): Promise<RouteComparisonResult> {
  const res = await apiClient.post("/routes/compare", params);
  return res.data;
}
