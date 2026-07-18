import { useNavigate } from "react-router-dom";
import { Activity, Bike, PersonStanding, MapPin } from "lucide-react";
import { useUserLocation } from "../contexts/LocationContext";
import { useHealthProfile } from "../contexts/HealthProfileContext";
import { useAuth } from "../contexts/AuthContext";
import { useAQI } from "../hooks/useAQI";
import { useWeather } from "../hooks/useWeather";
import { AQICard } from "../components/cards/AQICard";
import { WeatherCard } from "../components/cards/WeatherCard";
import { ScoreCard } from "../components/cards/ScoreCard";
import { GlassCard } from "../components/common/GlassCard";
import { Button } from "../components/common/Button";
import { computeActivityScores } from "../utils/scores";

export function Dashboard() {
  const navigate = useNavigate();
  const { coords, status, isPreciseLocation, requestLocation } = useUserLocation();
  const { profile } = useHealthProfile();
  const { user } = useAuth();
  const { data: aqi, loading: aqiLoading } = useAQI(coords);
  const { data: weather, loading: weatherLoading } = useWeather(coords);

  const scores = aqi ? computeActivityScores(aqi.aqi, profile) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{user ? `Hi, ${user.name.split(" ")[0]}` : "Good to see you"}</h1>
          <p className="text-sm text-white/50 mt-1">Here's how the air looks around you right now.</p>
        </div>
        {!isPreciseLocation && status !== "requesting" && (
          <Button variant="secondary" onClick={requestLocation}>
            <MapPin size={15} />
            Use precise location
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AQICard data={aqi} loading={aqiLoading} />
        <WeatherCard data={weather} loading={weatherLoading} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white/60 mb-3">Activity Scores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScoreCard title="Outdoor Score" icon={Activity} score={scores?.outdoor ?? 0} />
          <ScoreCard title="Running Score" icon={PersonStanding} score={scores?.running ?? 0} />
          <ScoreCard title="Cycling Score" icon={Bike} score={scores?.cycling ?? 0} />
        </div>
      </div>

      <GlassCard className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Planning to go somewhere?</h3>
          <p className="text-sm text-white/50 mt-1">Compare routes by pollution exposure, not just distance.</p>
        </div>
        <Button onClick={() => navigate("/map")}>Open Map</Button>
      </GlassCard>
    </div>
  );
}
