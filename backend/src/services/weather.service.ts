import type { Coordinates, WeatherData } from "../types/index.js";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

function fallbackWeather(): WeatherData {
  const hour = new Date().getHours();
  return {
    temperatureC: 27,
    feelsLikeC: 29,
    humidity: 58,
    windSpeedKph: 7,
    windDirectionDeg: 280,
    uvIndex: hour >= 10 && hour <= 16 ? 6 : 1,
    condition: "Haze",
    isDay: hour >= 6 && hour <= 18,
    timestamp: new Date().toISOString(),
  };
}

export async function getCurrentWeather(coords: Coordinates): Promise<WeatherData> {
  try {
    const url = new URL(OPEN_METEO_BASE);
    url.searchParams.set("latitude", String(coords.lat));
    url.searchParams.set("longitude", String(coords.lon));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code,is_day,uv_index"
    );
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString());
    if (!res.ok) return fallbackWeather();
    const json = (await res.json()) as any;
    const current = json.current;
    if (!current) return fallbackWeather();

    return {
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeedKph: current.wind_speed_10m,
      windDirectionDeg: current.wind_direction_10m,
      uvIndex: current.uv_index ?? 0,
      condition: WMO_CONDITIONS[current.weather_code] ?? "Unknown",
      isDay: current.is_day === 1,
      timestamp: current.time ?? new Date().toISOString(),
    };
  } catch {
    return fallbackWeather();
  }
}
