import { Droplets, Wind, Sun } from "lucide-react";
import type { WeatherData } from "../../types";
import { GlassCard } from "../common/GlassCard";
import { LoaderOverlay } from "../common/Loader";

export function WeatherCard({ data, loading }: { data: WeatherData | null; loading: boolean }) {
  if (loading || !data) {
    return (
      <GlassCard className="p-6">
        <LoaderOverlay label="Loading weather…" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <p className="text-sm text-white/50">Weather</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight">{Math.round(data.temperatureC)}°</span>
        <span className="mb-1.5 text-sm text-white/50">feels like {Math.round(data.feelsLikeC)}°</span>
      </div>
      <p className="mt-1 text-sm text-white/60">{data.condition}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col items-start gap-1">
          <Droplets size={16} className="text-accent" />
          <p className="text-white/40 text-xs">Humidity</p>
          <p className="font-medium">{Math.round(data.humidity)}%</p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <Wind size={16} className="text-accent" />
          <p className="text-white/40 text-xs">Wind</p>
          <p className="font-medium">{Math.round(data.windSpeedKph)} kph</p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <Sun size={16} className="text-accent" />
          <p className="text-white/40 text-xs">UV Index</p>
          <p className="font-medium">{Math.round(data.uvIndex)}</p>
        </div>
      </div>
    </GlassCard>
  );
}
