import { MapPinOff } from "lucide-react";
import type { AQIReading, Coordinates, RouteOption } from "../../types";
import { categoryLabel } from "../../utils/aqi";

interface MapFallbackProps {
  center: Coordinates;
  aqiGrid: AQIReading[];
  destination: Coordinates | null;
  routes: RouteOption[];
  selectedRouteId: string | null;
}

/**
 * Rendered instead of the interactive Mapbox map when no VITE_MAPBOX_TOKEN is
 * configured, so the Live AQI Map feature stays usable (a grid of nearby
 * readings) rather than showing a broken or blank map.
 */
export function MapFallback({ center, aqiGrid, destination }: MapFallbackProps) {
  const sorted = [...aqiGrid].sort((a, b) => a.aqi - b.aqi);

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 text-sm text-yellow-200">
        <MapPinOff size={18} className="mt-0.5 shrink-0" />
        <p>
          Interactive satellite map needs a Mapbox token. Add <code className="text-xs">VITE_MAPBOX_TOKEN</code> to
          <code className="text-xs"> frontend/.env</code> to enable it. Showing nearby AQI readings instead.
        </p>
      </div>

      <p className="mb-3 text-xs uppercase tracking-wide text-white/40">
        AQI near {center.lat.toFixed(3)}, {center.lon.toFixed(3)}
        {destination && ` → destination ${destination.lat.toFixed(3)}, ${destination.lon.toFixed(3)}`}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((point, idx) => (
          <div key={idx} className="glass rounded-xl p-3.5">
            <p className="text-2xl font-bold" style={{ color: point.color }}>
              {point.aqi}
            </p>
            <p className="text-xs text-white/50 mt-0.5">{categoryLabel(point.category)}</p>
            <p className="text-[11px] text-white/30 mt-2">
              {point.lat.toFixed(3)}, {point.lon.toFixed(3)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
