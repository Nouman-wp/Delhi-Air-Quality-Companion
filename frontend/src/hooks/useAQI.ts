import { useEffect, useState } from "react";
import type { AQIReading, Coordinates } from "../types";
import { getCurrentAqi } from "../services/api/aqi.api";

const REFRESH_MS = 5 * 60 * 1000;

export function useAQI(coords: Coordinates | null) {
  const [data, setData] = useState<AQIReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const reading = await getCurrentAqi(coords!);
        if (!cancelled) {
          setData(reading);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Unable to load air quality data.");
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
