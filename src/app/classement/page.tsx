"use client";

import { useEffect, useState } from "react";
import { EmptyState, LoadingLine, PageIntro } from "@/components/ui/PageBits";
import { createClient } from "@/lib/supabase/client";
import { fullName } from "@/lib/format";
import type { Player } from "@/lib/types";

type Row = { name: string; moyenne: string };

export default function ClassementPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    async function run() {
      const supabase = createClient();
      const [{ data: players }, { data: ratings }] = await Promise.all([
        supabase.from("players").select("*"),
        supabase.from("ratings").select("player_id, rating"),
      ]);
      const map: Record<string, { name: string; total: number; n: number }> = {};
      ((players as Player[]) ?? []).forEach((p) => {
        map[p.id] = { name: fullName(p), total: 0, n: 0 };
      });
      (ratings ?? []).forEach((r: { player_id: string; rating: number }) => {
        if (!map[r.player_id]) return;
        map[r.player_id].total += Number(r.rating);
        map[r.player_id].n += 1;
      });
      setRows(
        Object.values(map)
          .filter((x) => x.n > 0)
          .map((x) => ({ name: x.name, moyenne: (x.total / x.n).toFixed(1) }))
          .sort((a, b) => Number(b.moyenne) - Number(a.moyenne)),
      );
    }
    run();
  }, []);

  return (
    <main>
      <PageIntro
        kicker="Notes"
        title="Homme du match"
        subtitle="Classement des moyennes sur la saison."
      />
      {rows === null ? (
        <LoadingLine />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Pas encore de notes"
          text="Ouvrez un match avec composition pour noter les joueurs."
          actionHref="/calendrier"
          actionLabel="Voir les matchs"
        />
      ) : (
        <ol className="stack-list cards-grid">
          {rows.map((r, i) => (
            <li key={r.name} className="person-row">
              <span className="rank-num">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span>
              <span className="score-pill">{r.moyenne}</span>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
