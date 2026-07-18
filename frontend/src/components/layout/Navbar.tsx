import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Wind, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ProfileSelector } from "../common/ProfileSelector";
import { NotificationPanel } from "../common/NotificationPanel";
import { Button } from "../common/Button";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/map", label: "Map" },
  { to: "/chat", label: "AI Chat" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 hidden md:flex items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-lg px-6 py-3">
      <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
        <Wind className="text-accent" size={22} />
        AirWise
      </Link>

      <nav className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={clsx(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              location.pathname === link.to
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        <NotificationPanel />
        <ProfileSelector />
        {user ? (
          <Button variant="ghost" onClick={() => logout()} className="!px-2.5">
            <LogOut size={16} />
          </Button>
        ) : (
          <Button variant="primary" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
