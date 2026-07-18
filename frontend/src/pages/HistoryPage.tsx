import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Wind, CalendarCheck, CalendarX } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getExposureAnalytics, getExposureHistory } from "../services/api/history.api";
import { GlassCard } from "../components/common/GlassCard";
import { Button } from "../components/common/Button";
import { LoaderOverlay } from "../components/common/Loader";
import { formatDate, formatDistance } from "../utils/format";
import { aqiToColor } from "../utils/aqi";
import type { ExposureAnalytics, ExposureRecord } from "../types";

const DEMO_DAILY_EXPOSURE = [
  { label: "Mon", exposureScore: 42, averageAqi: 78 },
  { label: "Tue", exposureScore: 58, averageAqi: 112 },
  { label: "Wed", exposureScore: 35, averageAqi: 65 },
  { label: "Thu", exposureScore: 71, averageAqi: 145 },
  { label: "Fri", exposureScore: 48, averageAqi: 88 },
  { label: "Sat", exposureScore: 29, averageAqi: 52 },
  { label: "Sun", exposureScore: 55, averageAqi: 98 },
] as const;

const CHART_HEIGHT_PX = 160;
const maxDemoExposure = Math.max(...DEMO_DAILY_EXPOSURE.map((d) => d.exposureScore));

export function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ExposureAnalytics | null>(null);
  const [records, setRecords] = useState<ExposureRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getExposureAnalytics(), getExposureHistory()])
      .then(([a, r]) => {
        setAnalytics(a);
        setRecords(r);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <LoaderOverlay />;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <GlassCard className="p-8">
          <h1 className="text-xl font-semibold">Sign in to see your exposure history</h1>
          <p className="mt-2 text-sm text-white/50">
            Track your daily and weekly pollution exposure once you're signed in.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (loading) return <LoaderOverlay label="Loading history…" />;

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Your Exposure Timeline</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5">
          <TrendingUp size={16} className="text-accent" />
          <p className="mt-2 text-xs text-white/50">Distance Tracked</p>
          <p className="text-xl font-bold mt-1">{formatDistance(analytics?.totalDistanceMeters ?? 0)}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <Wind size={16} className="text-accent" />
          <p className="mt-2 text-xs text-white/50">Average AQI Encountered</p>
          <p className="text-xl font-bold mt-1" style={{ color: aqiToColor(analytics?.averageAqi ?? 0) }}>
            {analytics?.averageAqi ?? "—"}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <CalendarCheck size={16} className="text-green-500" />
          <p className="mt-2 text-xs text-white/50">Best Air Day</p>
          <p className="text-sm font-semibold mt-1">
            {analytics?.bestDay ? `${formatDate(analytics.bestDay.date)} · AQI ${analytics.bestDay.averageAqi}` : "—"}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <CalendarX size={16} className="text-red-500" />
          <p className="mt-2 text-xs text-white/50">Worst Air Day</p>
          <p className="text-sm font-semibold mt-1">
            {analytics?.worstDay ? `${formatDate(analytics.worstDay.date)} · AQI ${analytics.worstDay.averageAqi}` : "—"}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold text-white/60 mb-5">Daily Exposure Score</h2>
        <div className="flex gap-2 h-40" role="img" aria-label="Daily exposure score bar chart">
          {DEMO_DAILY_EXPOSURE.map((day) => {
            const barHeight = Math.max(8, (day.exposureScore / maxDemoExposure) * CHART_HEIGHT_PX);
            return (
              <div key={day.label} className="flex flex-1 flex-col items-center min-w-0 h-full">
                <div className="flex-1 w-full flex items-end min-h-0">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: aqiToColor(day.averageAqi),
                    }}
                    title={`Exposure ${day.exposureScore}, AQI ${day.averageAqi}`}
                  />
                </div>
                <span className="mt-2 shrink-0 text-[10px] text-white/40">{day.label}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold text-white/60 mb-4">Recent Activity</h2>
        <div className="divide-y divide-border/60">
          {records.slice(0, 15).map((record) => (
            <div key={record.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{record.routeLabel ?? "Route"}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {formatDate(record.date)} · {record.mode} · {formatDistance(record.distanceMeters)}
                </p>
              </div>
              <span className="text-xs font-semibold" style={{ color: aqiToColor(record.averageAqi) }}>
                AQI {record.averageAqi}
              </span>
            </div>
          ))}
          {records.length === 0 && <p className="text-sm text-white/40 py-6 text-center">No activity yet.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
