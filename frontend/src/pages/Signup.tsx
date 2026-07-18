import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wind } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { GlassCard } from "../components/common/GlassCard";
import { Button } from "../components/common/Button";
import { HEALTH_PROFILE_LABELS } from "../utils/format";
import type { HealthProfile } from "../types";

const PROFILES: HealthProfile[] = ["adult", "child", "senior", "asthma", "copd", "pregnant", "athlete"];

export function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [healthProfile, setHealthProfile] = useState<HealthProfile>("adult");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password, healthProfile });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <GlassCard className="w-full max-w-sm p-8" strong>
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg justify-center">
          <Wind className="text-accent" size={22} />
          AirWise
        </Link>
        <h1 className="mt-6 text-xl font-semibold text-center">Create your account</h1>
        <p className="mt-1 text-sm text-white/50 text-center">Track exposure history and get personalized advice.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-white/50">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="text-xs text-white/50">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="text-xs text-white/50">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="text-xs text-white/50">Health profile</label>
            <select
              value={healthProfile}
              onChange={(e) => setHealthProfile(e.target.value as HealthProfile)}
              className="mt-1 w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-accent/60"
            >
              {PROFILES.map((p) => (
                <option key={p} value={p} className="bg-card">
                  {HEALTH_PROFILE_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
