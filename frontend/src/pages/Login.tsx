import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wind } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { GlassCard } from "../components/common/GlassCard";
import { Button } from "../components/common/Button";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Login failed.");
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
        <h1 className="mt-6 text-xl font-semibold text-center">Welcome back</h1>
        <p className="mt-1 text-sm text-white/50 text-center">Sign in to track your exposure history.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-accent/60"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-white/50">
          No account?{" "}
          <Link to="/signup" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
