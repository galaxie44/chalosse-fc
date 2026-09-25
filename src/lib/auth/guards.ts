import { createServerSupabase } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function getSessionUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, role")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, profile };
}

export async function requireUser() {
  const session = await getSessionUser();
  if (!session.user || !session.profile) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile!.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requestIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export function publicError(code: unknown) {
  if (code === "UNAUTHENTICATED") return "Vous devez être connecté.";
  if (code === "FORBIDDEN") return "Accès refusé.";
  if (code === "RATE_LIMIT") return "Trop de tentatives. Réessayez plus tard.";
  if (typeof code === "string" && code.length < 120) return code;
  return "Une erreur est survenue.";
}
