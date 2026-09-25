"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { EmptyState, LoadingLine, PageIntro } from "@/components/ui/PageBits";
import { createClient } from "@/lib/supabase/client";
import { fullName } from "@/lib/format";
import type { MatchStat, Player } from "@/lib/types";

type Row = {
  id: string;
  name: string;
  mj: number;
  buts: number;
  passes: number;
  jaunes: number;
  rouges: number;
  moyenne: string;
};

export default function StatsPage() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    async function run() {
      const supabase = createClient();
      const [{ data: players }, { data: lineups }, { data: stats }, { data: ratings }] =
        await Promise.all([
          supabase.from("players").select("*"),
          supabase.from("match_lineups").select("player_id"),
          supabase.from("match_stats").select("*"),
          supabase.from("ratings").select("player_id, rating"),
        ]);

      const map: Record<string, Row & { total: number; votes: number }> = {};
      ((players as Player[]) ?? []).forEach((p) => {
        map[p.id] = {
          id: p.id,
          name: fullName(p),
          mj: 0,
          buts: 0,
          passes: 0,
          jaunes: 0,
          rouges: 0,
          moyenne: "-",
          total: 0,
          votes: 0,
        };
      });
      (lineups ?? []).forEach((l: { player_id: string }) => {
        if (map[l.player_id]) map[l.player_id].mj += 1;
      });
      ((stats as MatchStat[]) ?? []).forEach((s) => {
        if (!map[s.player_id]) return;
        map[s.player_id].buts += s.goals;
        map[s.player_id].passes += s.assists;
        map[s.player_id].jaunes += s.yellow_cards;
        map[s.player_id].rouges += s.red_cards;
      });
      (ratings ?? []).forEach((r: { player_id: string; rating: number }) => {
        if (!map[r.player_id]) return;
        map[r.player_id].total += Number(r.rating);
        map[r.player_id].votes += 1;
      });
      const list = Object.values(map)
        .map((r) => ({
          ...r,
          moyenne: r.votes > 0 ? (r.total / r.votes).toFixed(1) : "-",
        }))
        .sort((a, b) => b.buts - a.buts || b.mj - a.mj);
      setRows(list);
    }
    run();
  }, []);

  return (
    <main>
      <PageIntro
        kicker="Saison"
        title="Statistiques"
        subtitle="Buts, passes, notes et cartons de chaque joueur."
      />
      {rows === null ? (
        <LoadingLine />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Pas encore d’effectif"
          text="Ajoutez des joueurs pour voir apparaître les stats de saison."
          actionHref={isAdmin ? "/admin/joueur" : "/effectif"}
          actionLabel={isAdmin ? "Ajouter un joueur" : "Voir l’effectif"}
        />
      ) : (
        <ul className="stack-list stats-grid-list">
          {rows.map((r) => (
            <li key={r.id} className="stat-card">
              <div className="stat-card-head">
                <strong>{r.name}</strong>
                <span className="stat-note">{r.moyenne}</span>
              </div>
              <div className="stat-grid">
                <div>
                  <em>MJ</em>
                  <b>{r.mj}</b>
                </div>
                <div>
                  <em>Buts</em>
                  <b>{r.buts}</b>
                </div>
                <div>
                  <em>Passes</em>
                  <b>{r.passes}</b>
                </div>
                <div>
                  <em>Jaunes</em>
                  <b>{r.jaunes}</b>
                </div>
                <div>
                  <em>Rouges</em>
                  <b>{r.rouges}</b>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isAdmin && rows && rows.length > 0 ? (
        <p className="mt-5 text-center text-sm text-neutral-500">
          Saisir un match :{" "}
          <Link href="/admin/stats" className="font-semibold text-ink underline">
            Stats match
          </Link>
        </p>
      ) : null}
    </main>
  );
}
