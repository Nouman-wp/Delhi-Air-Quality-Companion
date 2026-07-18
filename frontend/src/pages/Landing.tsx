import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Wind,
  Map,
  MessageCircle,
  Activity,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Search,
  Route,
  HeartPulse,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { GlassCard } from "../components/common/GlassCard";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { Footer } from "../components/layout/Footer";

const FEATURES = [
  {
    icon: Map,
    title: "Live AQI Heatmap",
    description: "A Strava-style pollution heatmap across all of Delhi NCR on a satellite map, updated in real time.",
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
    description: "Know when pollution is rising, when wind is clearing the air, and the best time to head out.",
  },
  {
    icon: Wind,
    title: "Nearby Safe Places",
    description: "Discover the cleanest parks and running routes near you, ranked by live air quality.",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Check the air",
    description: "See live AQI, weather, and personalized activity scores for exactly where you are.",
  },
  {
    icon: Route,
    title: "Plan the cleanest route",
    description: "Pick a destination and compare routes by the pollution you'd actually breathe on each.",
  },
  {
    icon: HeartPulse,
    title: "Decide with confidence",
    description: "Ask the AI companion anything and get advice tuned to your health profile.",
  },
];

function LandingNav() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Wind size={18} />
          </span>
          AirWise <span className="text-accent">AI</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/60 md:flex">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#how" className="transition-colors hover:text-white">How it works</a>
          <Link to="/map" className="transition-colors hover:text-white">Live map</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate("/login")}>
            Sign in
          </Button>
          <Button onClick={() => navigate("/dashboard")}>Open app</Button>
        </div>
      </div>
    </header>
  );
}

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <LandingNav />

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_60%)]" />
        <div className="pointer-events-none absolute left-1/2 top-40 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-3xl flex-col items-center"
        >
          <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-1.5 text-xs text-white/60">
            <span className="flex h-2 w-2 rounded-full bg-aqi-good shadow-[0_0_8px] shadow-aqi-good" />
            Live air quality for Delhi NCR
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Make every outdoor decision <span className="text-accent">healthier</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/60 md:text-lg">
            AirWise turns live air quality, weather, and routing data into clear answers — should you run, cycle,
            open your windows, or send your kids outside, right now.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate("/dashboard")}>
              Open Dashboard <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" onClick={() => navigate("/map")}>
              Explore the map
            </Button>
          </div>
        </motion.div>

        {/* Floating stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "Live AQI stations", value: "40+" },
            { label: "NCR coverage", value: "100%" },
            { label: "Route modes", value: "3" },
            { label: "API keys to start", value: "0" },
          ].map((stat) => (
            <GlassCard key={stat.label} className="p-4">
              <p className="text-2xl font-bold text-accent">{stat.value}</p>
              <p className="mt-1 text-xs text-white/50">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Everything you need to breathe smarter</h2>
          <p className="mt-3 text-white/55">
            Not just another AQI dashboard — a companion that turns data into decisions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <GlassCard className="h-full p-6 transition-transform hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <feature.icon size={20} />
                </span>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
            <p className="mt-3 text-white/55">Three steps from "is the air okay?" to a confident decision.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <step.icon size={20} />
                  </span>
                  <span className="text-sm font-semibold text-white/30">0{idx + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/20 via-card to-card p-10 text-center md:p-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <h2 className="relative text-2xl font-bold md:text-4xl">Ready to breathe smarter?</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-white/60">
            Start free — no credit card, no setup. Just open the app and see your air.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate("/signup")}>Create free account</Button>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Continue as guest
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
