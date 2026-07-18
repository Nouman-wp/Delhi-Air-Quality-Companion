import { useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, LogIn, LogOut, Settings, Trash2, UserPlus } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../contexts/AuthContext";
import { useHealthProfile } from "../../contexts/HealthProfileContext";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { setAvatarImage, useAvatar } from "../../hooks/useAvatar";
import { HEALTH_PROFILE_LABELS } from "../../utils/format";
import type { HealthProfile } from "../../types";
import { Avatar } from "../common/Avatar";

const PROFILES: HealthProfile[] = ["adult", "child", "senior", "asthma", "copd", "pregnant", "athlete"];

export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, setProfile } = useHealthProfile();
  const photo = useAvatar();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const displayName = user?.name ?? "Guest";
  const subtitle = user?.email ?? "Not signed in";

  function onPickPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarImage(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-white/5 p-1 pr-1 transition-colors hover:bg-white/10"
        aria-label="Account menu"
      >
        <Avatar name={displayName} size={30} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-glass">
          {/* Identity + photo */}
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="relative">
              <Avatar name={displayName} size={48} />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-accent on-accent transition-transform hover:scale-110"
                title="Change photo"
              >
                <Camera size={12} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{displayName}</p>
              <p className="truncate text-xs text-white/50">{subtitle}</p>
              {photo && (
                <button
                  onClick={() => setAvatarImage(null)}
                  className="mt-1 flex items-center gap-1 text-[11px] text-white/40 hover:text-red-400"
                >
                  <Trash2 size={11} /> Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Health profile */}
          <div className="p-3">
            <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Health profile
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PROFILES.map((p) => (
                <button
                  key={p}
                  onClick={() => setProfile(p)}
                  className={clsx(
                    "rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                    p === profile ? "bg-accent/20 text-accent" : "text-white/70 hover:bg-white/5"
                  )}
                >
                  {HEALTH_PROFILE_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border/60 p-2">
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5"
            >
              <Settings size={16} /> Settings
            </Link>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <LogOut size={16} /> Sign out
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5"
                >
                  <LogIn size={16} /> Sign in
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
                >
                  <UserPlus size={16} /> Create account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
