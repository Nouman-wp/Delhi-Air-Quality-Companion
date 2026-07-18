import { Link } from "react-router-dom";
import { Wind, Github, Heart } from "lucide-react";

const LINKS = [
  {
    heading: "Product",
    items: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Pollution Map", to: "/map" },
      { label: "AI Companion", to: "/chat" },
      { label: "Exposure History", to: "/history" },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/signup" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

const DATA_SOURCES = ["WAQI", "Open-Meteo", "OpenStreetMap", "OSRM", "Elasticsearch"];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-surface/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Wind size={18} />
            </span>
            AirWise AI
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
            Turning live air quality, weather, and routing data into healthier outdoor decisions for Delhi NCR.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {DATA_SOURCES.map((s) => (
              <span
                key={s}
                className="rounded-md border border-border bg-white/5 px-2 py-0.5 text-[11px] text-white/50"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {LINKS.map((group) => (
          <div key={group.heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{group.heading}</p>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-white/60 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} AirWise AI · For informational use, not medical advice.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart size={12} className="text-red-400" /> for Delhi
            <a
              href="https://github.com/Nouman-wp/Delhi-Air-Quality-Companion"
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1 transition-colors hover:text-white"
            >
              <Github size={13} /> Source
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
