import { useEffect, useState } from "react";
import clsx from "clsx";
import { PersonStanding, Bike, Car, X } from "lucide-react";
import { useUserLocation } from "../contexts/LocationContext";
import { useHealthProfile } from "../contexts/HealthProfileContext";
import { getAqiGrid } from "../services/api/aqi.api";
import { compareRoutes } from "../services/api/routes.api";
import { getNearbyPlaces } from "../services/api/places.api";
import { recordExposure } from "../services/api/history.api";
import { useAuth } from "../contexts/AuthContext";
import { MapView } from "../components/map/MapView";
import { SearchBar } from "../components/map/SearchBar";
import { AQILegend } from "../components/map/AQILegend";
import { RouteComparisonCard } from "../components/map/RouteComparisonCard";
import { LoaderOverlay } from "../components/common/Loader";
import type { AQIReading, Coordinates, Place, RouteOption, SearchResult, TravelMode } from "../types";

const MODES: { value: TravelMode; label: string; icon: typeof PersonStanding }[] = [
  { value: "walking", label: "Walk", icon: PersonStanding },
  { value: "cycling", label: "Cycle", icon: Bike },
  { value: "driving", label: "Drive", icon: Car },
];

export function MapPage() {
  const { coords } = useUserLocation();
  const { profile } = useHealthProfile();
  const { user } = useAuth();

  const [aqiGrid, setAqiGrid] = useState<AQIReading[]>([]);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [mode, setMode] = useState<TravelMode>("walking");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);

  useEffect(() => {
    getAqiGrid(coords).then(setAqiGrid).catch(() => setAqiGrid([]));
  }, [coords.lat, coords.lon]);

  useEffect(() => {
    if (destination) return;
    getNearbyPlaces(coords).then(setNearbyPlaces).catch(() => setNearbyPlaces([]));
  }, [coords.lat, coords.lon, destination]);

  useEffect(() => {
    if (!destination) {
      setRoutes([]);
      setSelectedRouteId(null);
      return;
    }
    let cancelled = false;
    setRoutesLoading(true);
    compareRoutes({ origin: coords, destination, mode, healthProfile: profile })
      .then((result) => {
        if (cancelled) return;
        setRoutes(result.routes);
        setSelectedRouteId(result.recommendedRouteId);
      })
      .catch(() => {
        if (!cancelled) setRoutes([]);
      })
      .finally(() => {
        if (!cancelled) setRoutesLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination?.lat, destination?.lon, mode]);

  function handleSelectRoute(route: RouteOption) {
    setSelectedRouteId(route.id);
    if (user) {
      recordExposure({
        distanceMeters: route.distanceMeters,
        mode: route.mode,
        averageAqi: route.averageAqi,
        exposureScore: route.exposureScore,
        routeLabel: route.label,
      }).catch(() => {});
    }
  }

  return (
    <div className="relative h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
      <div className="absolute inset-0">
        <MapView
          center={coords}
          aqiGrid={aqiGrid}
          destination={destination}
          routes={routes}
          selectedRouteId={selectedRouteId}
          onMapClick={setDestination}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1000] flex flex-col md:flex-row">
        <div className="pointer-events-auto w-full md:w-[380px] md:h-full md:overflow-y-auto scrollbar-thin bg-background/95 backdrop-blur-xl p-4 space-y-3">
          <SearchBar onSelect={(result: SearchResult) => setDestination({ lat: result.lat, lon: result.lon })} />

          {destination && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-card/90 backdrop-blur-lg px-4 py-2.5 text-xs text-white/60">
              <span>Destination set — comparing routes</span>
              <button
                onClick={() => setDestination(null)}
                className="flex items-center gap-1 text-white/40 hover:text-white"
              >
                <X size={14} /> Clear
              </button>
            </div>
          )}

          {destination && (
            <div className="flex gap-2 rounded-xl border border-border bg-card/90 backdrop-blur-lg p-1.5">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
                    mode === m.value ? "bg-accent text-white" : "text-white/50 hover:bg-white/5"
                  )}
                >
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>
          )}

          {destination ? (
            <div className="space-y-2.5">
              {routesLoading && (
                <div className="rounded-xl border border-border bg-card/90 backdrop-blur-lg">
                  <LoaderOverlay label="Comparing routes…" />
                </div>
              )}
              {!routesLoading &&
                routes.map((route) => (
                  <RouteComparisonCard
                    key={route.id}
                    route={route}
                    selected={route.id === selectedRouteId}
                    onSelect={() => handleSelectRoute(route)}
                  />
                ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/90 backdrop-blur-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">
                Nearby Safe Places
              </p>
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto scrollbar-thin">
                {nearbyPlaces.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => setDestination(place.location)}
                    className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{place.name}</p>
                      {place.aqi !== undefined && (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: place.aqi <= 100 ? "#22c55e" : place.aqi <= 200 ? "#eab308" : "#ef4444" }}
                        >
                          AQI {place.aqi}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{place.description}</p>
                  </button>
                ))}
                {nearbyPlaces.length === 0 && <p className="text-sm text-white/40 px-3 py-2">Loading places…</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 md:left-[396px] z-[1000] hidden sm:block">
        <div className="pointer-events-auto">
          <AQILegend />
        </div>
      </div>
    </div>
  );
}
