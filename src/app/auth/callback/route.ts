import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

const NEXT_ALLOWED = new Set(["/", "/reinitialiser-mdp"]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const nextRaw = searchParams.get("next") || "/";
  const next = NEXT_ALLOWED.has(nextRaw) ? nextRaw : "/";
  const supabase = await createServerSupabase();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
    }
    const dest = type === "recovery" ? "/reinitialiser-mdp" : next;
    return NextResponse.redirect(`${origin}${dest}`);
  }

  return NextResponse.redirect(`${origin}/connexion`);
}
