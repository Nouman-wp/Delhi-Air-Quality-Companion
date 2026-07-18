import { useEffect, useState } from "react";

/**
 * A tiny localStorage-backed store for the user's profile photo. The image is
 * kept as a data URL so it works fully offline and needs no upload endpoint —
 * a "demo image now, customisable later" avatar. A module-level listener set
 * keeps every mounted <Avatar> in sync the moment the photo changes.
 */
const KEY = "airwise-avatar";
const listeners = new Set<(value: string | null) => void>();

function read(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setAvatarImage(value: string | null): void {
  if (value) window.localStorage.setItem(KEY, value);
  else window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l(value));
}

export function useAvatar(): string | null {
  const [avatar, setAvatar] = useState<string | null>(read);
  useEffect(() => {
    const listener = (value: string | null) => setAvatar(value);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return avatar;
}
