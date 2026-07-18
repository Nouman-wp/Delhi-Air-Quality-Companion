import { useEffect, useRef, useState } from "react";
import { Bell, TriangleAlert, Info, Wind } from "lucide-react";
import clsx from "clsx";
import { useUserLocation } from "../../contexts/LocationContext";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { getSmartNotifications } from "../../services/api/notifications.api";
import type { SmartNotification } from "../../types";

const SEVERITY_STYLES: Record<SmartNotification["severity"], string> = {
  info: "text-accent",
  warning: "text-yellow-500",
  critical: "text-red-500",
};

function SeverityIcon({ severity }: { severity: SmartNotification["severity"] }) {
  if (severity === "critical") return <TriangleAlert size={16} className={SEVERITY_STYLES[severity]} />;
  if (severity === "warning") return <Wind size={16} className={SEVERITY_STYLES[severity]} />;
  return <Info size={16} className={SEVERITY_STYLES[severity]} />;
}

export function NotificationPanel() {
  const { coords } = useUserLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SmartNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    getSmartNotifications(coords)
      .then(setItems)
      .catch(() => setItems([]));
  }, [coords.lat, coords.lon]);

  const criticalCount = items.filter((i) => i.severity !== "info").length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Bell size={18} />
        {criticalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
            {criticalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-glass p-2 max-h-96 overflow-y-auto scrollbar-thin">
          <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
            Smart Notifications
          </p>
          {items.length === 0 && <p className="px-2 py-3 text-sm text-white/50">No notifications right now.</p>}
          {items.map((item) => (
            <div key={item.id} className="flex gap-2.5 rounded-lg px-2 py-2.5 hover:bg-white/5">
              <div className="mt-0.5 shrink-0">
                <SeverityIcon severity={item.severity} />
              </div>
              <div>
                <p className={clsx("text-sm font-medium", SEVERITY_STYLES[item.severity])}>{item.title}</p>
                <p className="text-xs text-white/60 mt-0.5">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
