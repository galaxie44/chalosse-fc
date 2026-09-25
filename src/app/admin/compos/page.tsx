"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState, PageIntro } from "@/components/ui/PageBits";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { saveLineupAction } from "@/app/actions/club";
import { createClient } from "@/lib/supabase/client";
import { formatDateFr, fullName } from "@/lib/format";
import type { Match, Player } from "@/lib/types";

export default function ComposPage() {
  const toast = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [counts, setCounts] = useState<
    Record<string, { premiere: number; reserve: number }>
  >({});
  const [activeId, setActiveId] = useState("");
  const [activeTeam, setActiveTeam] = useState<"premiere" | "reserve">("premiere");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: m }, { data: p }, { data: lineups }] = await Promise.all([
        supabase.from("matches").select("*").order("match_date"),
        supabase.from("players").select("*"),
        supabase.from("match_lineups").select("match_id, player_id"),
      ]);
      const matchList = (m as Match[]) ?? [];
      setMatches(matchList);
      setPlayers((p as Player[]) ?? []);
      const c: Record<string, { premiere: number; reserve: number }> = {};
      ((p as Player[]) ?? []).forEach((pl) => {
        c[pl.id] = { premiere: 0, reserve: 0 };
      });
      const matchType = Object.fromEntries(matchList.map((x) => [x.id, x.team_type]));
      (lineups ?? []).forEach((l: { match_id: string; player_id: string }) => {
        const t = matchType[l.match_id];
        if (t && c[l.player_id]) c[l.player_id][t] += 1;
      });
      setCounts(c);
    }
    load();
  }, []);

  async function choose(id: string, team: "premiere" | "reserve") {
    setActiveId(id);
    setActiveTeam(team);
    if (!id) {
      setSelected(new Set());
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("match_lineups")
      .select("player_id")
      .eq("match_id", id);
    setSelected(new Set((data ?? []).map((x: { player_id: string }) => x.player_id)));
  }

  async function save() {
    if (!activeId) return;
    setPending(true);
    const result = await saveLineupAction(activeId, [...selected]);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Composition enregistrée (${selected.size} joueurs).`);
  }

  const premiere = matches.filter((m) => m.team_type === "premiere");
  const reserve = matches.filter((m) => m.team_type === "reserve");
  const sortedPlayers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return [...players]
      .filter((p) => !needle || fullName(p).toLowerCase().includes(needle))
      .sort((a, b) => {
        const ca = counts[a.id]?.[activeTeam] ?? 0;
        const cb = counts[b.id]?.[activeTeam] ?? 0;
        if (cb !== ca) return cb - ca;
        return fullName(a).localeCompare(fullName(b), "fr");
      });
  }, [players, counts, activeTeam, search]);

  return (
    <main>
      <PageIntro
        kicker="Staff"
        title="Compositions"
        subtitle="Choisissez un match, cochez les joueurs, validez."
      />

      <div className="page-layout-split">
        <div className="card-club space-y-4 text-left">
          <div>
            <p className="mb-1.5 text-sm font-medium text-neutral-500">Première</p>
            <Select
              value={activeTeam === "premiere" ? activeId : ""}
              placeholder="Choisir un match"
              onChange={(v) => choose(v, "premiere")}
              options={[
                { value: "", label: "Choisir un match" },
                ...premiere.map((m) => ({
                  value: m.id,
                  label: `${m.opponent} · ${formatDateFr(m.match_date)}`,
                })),
              ]}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-neutral-500">Réserve</p>
            <Select
              value={activeTeam === "reserve" ? activeId : ""}
              placeholder="Choisir un match"
              onChange={(v) => choose(v, "reserve")}
              options={[
                { value: "", label: "Choisir un match" },
                ...reserve.map((m) => ({
                  value: m.id,
                  label: `${m.opponent} · ${formatDateFr(m.match_date)}`,
                })),
              ]}
            />
          </div>
        </div>

        <div>
          {!activeId ? (
            <EmptyState
              title="Choisissez un match"
              text="Sélectionnez une rencontre Première ou Réserve pour composer l’équipe."
            />
          ) : players.length === 0 ? (
            <EmptyState
              title="Effectif vide"
              text="Ajoutez des joueurs avant de poser une composition."
              actionHref="/admin/joueur"
              actionLabel="Nouvelle recrue"
            />
          ) : (
            <div className="card-club text-left">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{selected.size} sélectionné(s)</p>
              </div>
              <input
                className="field mb-3"
                placeholder="Filtrer un nom…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="compo-list">
                {sortedPlayers.map((p) => {
                  const n = counts[p.id]?.[activeTeam] ?? 0;
                  const on = selected.has(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`compo-row ${on ? "is-on" : ""}`}
                      onClick={() => {
                        const next = new Set(selected);
                        if (on) next.delete(p.id);
                        else next.add(p.id);
                        setSelected(next);
                      }}
                    >
                      <span className="min-w-0 text-left">
                        <strong className="block truncate">{fullName(p)}</strong>
                        {n > 0 ? (
                          <span className="text-xs text-neutral-500">{n} matchs</span>
                        ) : null}
                      </span>
                      <span className="check-pill">{on ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="btn-gold-block mt-4"
                disabled={pending}
                onClick={save}
              >
                {pending ? "Enregistrement…" : "Valider la composition"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
