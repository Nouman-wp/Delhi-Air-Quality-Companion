import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { HealthProfile } from "../types";
import { useAuth } from "./AuthContext";
import { updateHealthProfileRequest } from "../services/api/auth.api";

const STORAGE_KEY = "airwise:healthProfile";

interface HealthProfileContextValue {
  profile: HealthProfile;
  setProfile: (profile: HealthProfile) => Promise<void>;
}

const HealthProfileContext = createContext<HealthProfileContextValue | null>(null);

export function HealthProfileProvider({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuth();
  const [profile, setProfileState] = useState<HealthProfile>(() => {
    return (localStorage.getItem(STORAGE_KEY) as HealthProfile) || "adult";
  });

  useEffect(() => {
    if (user) setProfileState(user.healthProfile);
  }, [user]);

  const setProfile = useCallback(
    async (next: HealthProfile) => {
      setProfileState(next);
      localStorage.setItem(STORAGE_KEY, next);
      if (user) {
        const updated = await updateHealthProfileRequest(next);
        setUser(updated);
      }
    },
    [user, setUser]
  );

  return (
    <HealthProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </HealthProfileContext.Provider>
  );
}

export function useHealthProfile(): HealthProfileContextValue {
  const ctx = useContext(HealthProfileContext);
  if (!ctx) throw new Error("useHealthProfile must be used within HealthProfileProvider");
  return ctx;
}
