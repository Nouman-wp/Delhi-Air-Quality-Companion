import { motion } from "framer-motion";
import type { AQIReading } from "../../types";
import { categoryLabel } from "../../utils/aqi";
import { GlassCard } from "../common/GlassCard";
import { LoaderOverlay } from "../common/Loader";

export function AQICard({ data, loading }: { data: AQIReading | null; loading: boolean }) {
  if (loading || !data) {
    return (
      <GlassCard className="p-6">
        <LoaderOverlay label="Loading air quality…" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div
        className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: data.color }}
      />
      <div className="relative">
        <p className="text-sm text-white/50">Current AQI</p>
        <div className="mt-2 flex items-end gap-3">
          <motion.span
            key={data.aqi}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold tracking-tight"
            style={{ color: data.color }}
          >
            {data.aqi}
          </motion.span>
          <span className="mb-2 text-sm font-medium" style={{ color: data.color }}>
            {categoryLabel(data.category)}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-white/40">PM2.5</p>
            <p className="font-medium">{data.pm25} µg/m³</p>
          </div>
          <div>
            <p className="text-white/40">PM10</p>
            <p className="font-medium">{data.pm10} µg/m³</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/30">
          {data.stationName ?? "Nearest station"} · {data.source === "waqi" ? "Live reading" : "Estimated"}
        </p>
      </div>
    </GlassCard>
  );
}
