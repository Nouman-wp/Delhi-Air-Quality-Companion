import { useMemo } from "react";
import clsx from "clsx";
import { useAvatar } from "../../hooks/useAvatar";

interface AvatarProps {
  name?: string | null;
  size?: number;
  className?: string;
  /** When false, the shared localStorage photo is ignored (used for previews). */
  usePhoto?: boolean;
}

const GRADIENTS = [
  ["#3b82f6", "#8b5cf6"],
  ["#06b6d4", "#3b82f6"],
  ["#22c55e", "#14b8a6"],
  ["#f97316", "#ef4444"],
  ["#a855f7", "#ec4899"],
  ["#eab308", "#f97316"],
];

function initials(name?: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function Avatar({ name, size = 36, className, usePhoto = true }: AvatarProps) {
  const photo = useAvatar();
  const active = usePhoto ? photo : null;
  const [from, to] = useMemo(() => GRADIENTS[hashIndex(name || "guest", GRADIENTS.length)], [name]);
  const label = initials(name);

  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-white/10",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: active ? undefined : `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {active ? (
        <img src={active} alt={name ?? "Profile"} className="h-full w-full object-cover" />
      ) : label ? (
        <span className="on-accent">{label}</span>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" width={size * 0.6} height={size * 0.6}>
          <circle cx="12" cy="8" r="4" fill="#ffffff" opacity="0.9" />
          <path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7" fill="#ffffff" opacity="0.9" />
        </svg>
      )}
    </div>
  );
}
