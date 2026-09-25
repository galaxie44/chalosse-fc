"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { publicError, requireAdmin, requireUser, requestIp } from "@/lib/auth/guards";
import { headers } from "next/headers";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import {
  dateSchema,
  emailSchema,
  loginSchema,
  nameSchema,
  opponentSchema,
  passwordSchema,
  positionSchema,
  signupSchema,
  teamSchema,
  uuidSchema,
} from "@/lib/security/schemas";
import {
  isUuid,
  parseNote,
  parseScore,
  safeHttpsUrl,
} from "@/lib/security/sanitize";
import { z } from "zod";

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(message: string): ActionResult {
  return { ok: false, error: message };
}

async function limited(prefix: string, max: number, windowMs: number) {
  const ip = await requestIp();
  const res = rateLimit(clientKey(prefix, ip), max, windowMs);
  if (!res.ok) throw new Error("RATE_LIMIT");
}

export async function signInAction(form: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  try {
    await limited("login", 8, 10 * 60 * 1000);
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return fail("Email ou mot de passe incorrect.");
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return fail("Email ou mot de passe incorrect.");
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function signUpAction(form: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<ActionResult> {
  try {
    await limited("signup", 5, 15 * 60 * 1000);
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Données invalides.");
    }
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
        },
      },
    });
    if (error) {
      return fail("Impossible de créer le compte. Vérifiez les informations.");
    }
    if (!data.session) {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (loginError) {
        return fail(
          "Compte créé, mais la connexion automatique a échoué. Connectez-vous manuellement.",
        );
      }
    }
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return { ok: true };
}

function requestOrigin(h: Headers) {
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto =
    host.startsWith("localhost") || host.startsWith("127.")
      ? "http"
      : h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  try {
    await limited("reset", 5, 15 * 60 * 1000);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return fail("Adresse e-mail invalide.");
    const h = await headers();
    const origin = requestOrigin(h);
    const supabase = await createServerSupabase();
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${origin}/auth/callback?next=/reinitialiser-mdp`,
    });
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function updatePasswordAction(password: string): Promise<ActionResult> {
  try {
    await limited("new-pass", 8, 15 * 60 * 1000);
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Mot de passe invalide.");
    }
    const { supabase, user } = await requireUser();
    if (!user) return fail("Lien expiré. Demandez un nouvel e-mail.");
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    if (error) return fail("Impossible de changer le mot de passe. Le lien a peut-être expiré.");
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function addPlayerAction(form: {
  firstName: string;
  lastName: string;
  position: string;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const firstName = nameSchema.parse(form.firstName);
    const lastName = nameSchema.parse(form.lastName);
    const position = positionSchema.parse(form.position);
    const { error } = await supabase.from("players").insert({
      first_name: firstName,
      last_name: lastName,
      position,
    });
    if (error) return fail("Impossible d'ajouter le joueur.");
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message || "Données invalides.");
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function addMatchAction(form: {
  team: string;
  opponent: string;
  date: string;
  logo?: string;
}): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const team_type = teamSchema.parse(form.team);
    const opponent = opponentSchema.parse(form.opponent);
    const match_date = dateSchema.parse(form.date);
    const opponent_logo = safeHttpsUrl(form.logo || null);
    if (form.logo?.trim() && !opponent_logo) {
      return fail("Le logo doit être une URL https valide.");
    }
    const { error } = await supabase.from("matches").insert({
      team_type,
      opponent,
      match_date,
      opponent_logo,
    });
    if (error) return fail("Impossible d'ajouter le match.");
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return fail(e.issues[0]?.message || "Données invalides.");
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function updateScoreAction(
  matchId: string,
  chalosse: string,
  adversaire: string | null,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!isUuid(matchId)) return fail("Match invalide.");
    if (chalosse.trim() === "") {
      const { error } = await supabase
        .from("matches")
        .update({ score_chalosse: null, score_adversaire: null })
        .eq("id", matchId);
      if (error) return fail("Score non mis à jour.");
      return { ok: true };
    }
    const c = parseScore(chalosse);
    const a = parseScore(adversaire ?? "");
    if (c === null || a === null) return fail("Scores invalides (0 à 99).");
    const { error } = await supabase
      .from("matches")
      .update({ score_chalosse: c, score_adversaire: a })
      .eq("id", matchId);
    if (error) return fail("Score non mis à jour.");
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function updateDateAction(
  matchId: string,
  date: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    uuidSchema.parse(matchId);
    const match_date = dateSchema.parse(date);
    const { error } = await supabase
      .from("matches")
      .update({ match_date })
      .eq("id", matchId);
    if (error) return fail("Date non mise à jour.");
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return fail("Date invalide.");
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function deleteMatchAction(matchId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    uuidSchema.parse(matchId);
    const { error } = await supabase.from("matches").delete().eq("id", matchId);
    if (error) return fail("Suppression impossible.");
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function deletePlayerAction(playerId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    uuidSchema.parse(playerId);
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    if (error) return fail("Suppression impossible.");
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function saveLineupAction(
  matchId: string,
  playerIds: string[],
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    uuidSchema.parse(matchId);
    const unique = [...new Set(playerIds.filter((id) => isUuid(id)))].slice(0, 30);
    await supabase.from("match_lineups").delete().eq("match_id", matchId);
    if (unique.length) {
      const { error } = await supabase.from("match_lineups").insert(
        unique.map((player_id) => ({ match_id: matchId, player_id })),
      );
      if (error) return fail("Composition non enregistrée.");
    }
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function saveStatsAction(
  matchId: string,
  rows: {
    playerId: string;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
  }[],
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    uuidSchema.parse(matchId);
    const payload = rows.slice(0, 30).map((r) => {
      if (!isUuid(r.playerId)) throw new Error("INVALID");
      const clamp = (n: number) => {
        if (!Number.isInteger(n) || n < 0 || n > 20) throw new Error("INVALID");
        return n;
      };
      return {
        match_id: matchId,
        player_id: r.playerId,
        goals: clamp(r.goals),
        assists: clamp(r.assists),
        yellow_cards: clamp(r.yellow),
        red_cards: clamp(r.red),
      };
    });
    const { error } = await supabase.from("match_stats").upsert(payload);
    if (error) return fail("Stats non enregistrées.");
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function saveRatingsAction(
  matchId: string,
  notes: Record<string, string>,
): Promise<ActionResult> {
  try {
    await limited("notes", 30, 10 * 60 * 1000);
    const { supabase, user } = await requireUser();
    uuidSchema.parse(matchId);
    const { data: lineup } = await supabase
      .from("match_lineups")
      .select("player_id")
      .eq("match_id", matchId);
    const allowed = new Set((lineup ?? []).map((l: { player_id: string }) => l.player_id));
    const rows = Object.entries(notes)
      .map(([playerId, raw]) => {
        if (!allowed.has(playerId) || !isUuid(playerId)) return null;
        const rating = parseNote(raw);
        if (rating === null) return null;
        return {
          match_id: matchId,
          player_id: playerId,
          voter_id: user!.id,
          rating,
          updated_at: new Date().toISOString(),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
    if (!rows.length) return fail("Saisissez au moins une note entre 0 et 10.");
    const { error } = await supabase.from("ratings").upsert(rows);
    if (error) return fail("Notes non enregistrées.");
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}

export async function deleteAccountAction(userId: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAdmin();
    uuidSchema.parse(userId);
    if (userId === user!.id) return fail("Vous ne pouvez pas supprimer votre compte.");
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) return fail("Suppression impossible.");
    return { ok: true };
  } catch (e) {
    return fail(publicError(e instanceof Error ? e.message : e));
  }
}
