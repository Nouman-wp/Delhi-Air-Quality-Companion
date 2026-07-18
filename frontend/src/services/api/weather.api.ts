import { apiClient } from "./client";
import type { Coordinates, WeatherData } from "../../types";

export async function getCurrentWeather(coords: Coordinates): Promise<WeatherData> {
  const res = await apiClient.get("/weather/current", { params: coords });
  return res.data;
}
