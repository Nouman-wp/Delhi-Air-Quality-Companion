import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { LayoutDashboard, Map, MessageCircle, History, Settings } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/map", label: "Map", icon: Map },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-border/60 bg-background/95 backdrop-blur-lg px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={clsx(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
              active ? "text-accent" : "text-white/50"
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
