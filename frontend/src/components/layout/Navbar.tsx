import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { Wind } from "lucide-react";
import { ThemeToggle } from "../common/ThemeToggle";
import { NotificationPanel } from "../common/NotificationPanel";
import { UserMenu } from "./UserMenu";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/map", label: "Map" },
  { to: "/chat", label: "AI Chat" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
];

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl md:px-6">
      <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Wind size={18} />
        </span>
        <span className="hidden sm:inline">AirWise</span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={clsx(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              location.pathname === link.to
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  );
}
