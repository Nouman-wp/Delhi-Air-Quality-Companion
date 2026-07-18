import clsx from "clsx";
import { Clock, Route as RouteIcon, Wind } from "lucide-react";
import type { RouteOption } from "../../types";
import { formatDistance, formatDuration } from "../../utils/format";
import { healthRatingColor } from "../../utils/aqi";
import { Badge } from "../common/Badge";

const RATING_LABEL: Record<RouteOption["healthRating"], string> = {
  recommended: "Recommended",
  moderate: "Moderate",
  avoid: "Avoid",
};

export function RouteComparisonCard({
  route,
  selected,
  onSelect,
}: {
  route: RouteOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const color = healthRatingColor(route.healthRating);

  return (
    <button
      onClick={onSelect}
      className={clsx(
        "w-full rounded-xl border p-4 text-left transition-all",
        selected ? "border-accent bg-accent/10" : "border-border bg-white/5 hover:bg-white/[0.07]"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{route.label}</p>
        <Badge color={color}>{RATING_LABEL[route.healthRating]}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/60">
        <span className="flex items-center gap-1">
          <Clock size={13} /> {formatDuration(route.durationSeconds)}
        </span>
        <span className="flex items-center gap-1">
          <RouteIcon size={13} /> {formatDistance(route.distanceMeters)}
        </span>
        <span className="flex items-center gap-1">
          <Wind size={13} /> AQI {route.averageAqi} avg / {route.maxAqi} max
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-xs text-white/40">Exposure Score</span>
        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden max-w-[100px]">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, route.exposureScore)}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color }}>
          {route.exposureScore}
        </span>
      </div>

      <p className="mt-2.5 text-xs text-white/50 leading-relaxed">{route.recommendation}</p>
    </button>
  );
}
