import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Coordinates } from "../types";

export const DELHI_FALLBACK_CENTER: Coordinates = { lat: 28.6139, lon: 77.209 }; // Connaught Place

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported";

interface LocationContextValue {
  coords: Coordinates;
  status: LocationStatus;
  isPreciseLocation: boolean;
  requestLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coordinates>(DELHI_FALLBACK_CENTER);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [isPreciseLocation, setIsPreciseLocation] = useState(false);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setIsPreciseLocation(true);
        setStatus("granted");
      },
      () => {
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <LocationContext.Provider value={{ coords, status, isPreciseLocation, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

// Named useUserLocation (not useLocation) to avoid colliding with react-router-dom's useLocation.
export function useUserLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useUserLocation must be used within LocationProvider");
  return ctx;
}
