import { useRef, useState } from "react";
import { ChevronDown, User2 } from "lucide-react";
import { useHealthProfile } from "../../contexts/HealthProfileContext";
import { HEALTH_PROFILE_LABELS } from "../../utils/format";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import type { HealthProfile } from "../../types";
import clsx from "clsx";

const PROFILES: HealthProfile[] = ["adult", "child", "senior", "asthma", "copd", "pregnant", "athlete"];

export function ProfileSelector({ compact }: { compact?: boolean }) {
  const { profile, setProfile } = useHealthProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex items-center gap-2 rounded-xl border border-border bg-white/5 hover:bg-white/10 transition-colors",
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
        )}
      >
        <User2 size={compact ? 14 : 16} className="text-accent" />
        <span>{HEALTH_PROFILE_LABELS[profile]}</span>
        <ChevronDown size={14} className={clsx("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-glass p-1.5">
          {PROFILES.map((p) => (
            <button
              key={p}
              onClick={() => {
                setProfile(p);
                setOpen(false);
              }}
              className={clsx(
                "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                p === profile ? "bg-accent/20 text-accent" : "hover:bg-white/5 text-white/80"
              )}
            >
              {HEALTH_PROFILE_LABELS[p]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
