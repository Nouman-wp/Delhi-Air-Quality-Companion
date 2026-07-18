import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, User2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useHealthProfile } from "../contexts/HealthProfileContext";
import { useUserLocation } from "../contexts/LocationContext";
import { GlassCard } from "../components/common/GlassCard";
import { Button } from "../components/common/Button";
import { HEALTH_PROFILE_LABELS } from "../utils/format";
import type { HealthProfile } from "../types";
import clsx from "clsx";

const PROFILES: HealthProfile[] = ["adult", "child", "senior", "asthma", "copd", "pregnant", "athlete"];

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { profile, setProfile } = useHealthProfile();
  const { status, isPreciseLocation, requestLocation } = useUserLocation();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-8 space-y-5">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
            <User2 size={20} />
          </div>
          <div>
            <p className="font-medium">{user ? user.name : "Guest"}</p>
            <p className="text-xs text-white/40">{user ? user.email : "Sign in to save your data"}</p>
          </div>
        </div>
        {user ? (
          <Button variant="danger" className="mt-5" onClick={() => logout()}>
            <LogOut size={15} /> Sign out
          </Button>
        ) : (
          <Button className="mt-5" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold text-white/60 mb-4">Health Profile</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PROFILES.map((p) => (
            <button
              key={p}
              onClick={() => setProfile(p)}
              className={clsx(
                "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                p === profile ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-white/5"
              )}
            >
              {HEALTH_PROFILE_LABELS[p]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/40">
          Recommendations across the app adapt to this profile automatically.
        </p>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold text-white/60 mb-3">Location</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            {isPreciseLocation ? "Using your precise location" : "Using an approximate Delhi location"}
          </p>
          <Button variant="secondary" onClick={requestLocation} loading={status === "requesting"}>
            <MapPin size={15} /> Refresh
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
