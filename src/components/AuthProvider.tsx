"use client";

import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/app/actions/club";
import type { Profile } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthState = {
  loading: boolean;
  profile: Profile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const load = useCallback(
    async (userId?: string) => {
      if (!supabase) {
        setProfile(null);
        setLoading(false);
        return;
      }
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id;
      }
      if (!userId) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role")
        .eq("id", userId)
        .maybeSingle();
      setProfile((data as Profile) ?? null);
      setLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setLoading(false);
        return;
      }
      const uid = session?.user.id;
      // Évite le deadlock supabase-js si on interroge Auth/DB dans le callback.
      setTimeout(() => {
        void load(uid);
      }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [load, supabase]);

  async function signOut() {
    await signOutAction();
    window.location.href = "/connexion";
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        profile,
        isAdmin: profile?.role === "admin",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth hors AuthProvider");
  return ctx;
}
