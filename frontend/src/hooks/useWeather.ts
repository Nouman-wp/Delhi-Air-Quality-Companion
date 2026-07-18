import { useEffect, useState } from "react";
import type { Coordinates, WeatherData } from "../types";
import { getCurrentWeather } from "../services/api/weather.api";

const REFRESH_MS = 10 * 60 * 1000;

export function useWeather(coords: Coordinates | null) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const weather = await getCurrentWeather(coords!);
        if (!cancelled) {
          setData(weather);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Unable to load weather data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [coords?.lat, coords?.lon]);

  return { data, loading, error };
}
