import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wind, Map, MessageCircle, Activity, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "../components/common/Button";
import { GlassCard } from "../components/common/GlassCard";

const FEATURES = [
  {
    icon: Map,
    title: "Live AQI Map",
    description: "Satellite view with a Strava-style pollution heatmap across Delhi, updated in real time.",
  },
  {
    icon: TrendingUp,
    title: "Route Exposure Comparison",
    description: "Compare routes by ETA, average AQI, and total pollution exposure — not just distance.",
  },
  {
    icon: MessageCircle,
    title: "AI Health Companion",
    description: "Ask 'Can I run now?' or 'Is it safe for my child?' and get grounded, actionable answers.",
  },
  {
    icon: Activity,
    title: "Personalized Health Profiles",
    description: "Recommendations adapt for children, seniors, asthma, COPD, pregnancy, and athletes.",
  },
  {
    icon: ShieldCheck,
    title: "Smart Notifications",
    description: "Know when pollution is rising, when wind is clearing the air, and the best time to go outside.",
  },
  {
    icon: Wind,
    title: "Nearby Safe Places",
    description: "Discover the cleanest parks and running routes near you, ranked by live air quality.",
  },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="relative px-6 pt-28 pb-20 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-3xl flex-col items-center"
        >
          <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-1.5 text-xs text-white/60">
            <Wind size={14} className="text-accent" />
            Built for Delhi's air
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Make every outdoor decision <span className="text-accent">healthier</span>.
          </h1>
          <p className="mt-5 max-w-xl text-white/60 text-base md:text-lg">
            AirWise turns live air quality, weather, and routing data into clear answers — should you run, cycle,
            open your windows, or send your kids outside, right now.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate("/dashboard")}>Open Dashboard</Button>
            <Button variant="secondary" onClick={() => navigate("/signup")}>
              Create free account
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <GlassCard className="h-full p-6">
                <feature.icon className="text-accent" size={22} />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
