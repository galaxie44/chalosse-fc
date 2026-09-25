"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { EmptyState, LoadingLine, PageIntro } from "@/components/ui/PageBits";
import { useToast } from "@/components/ui/Toast";
import { saveRatingsAction } from "@/app/actions/club";
import { createClient } from "@/lib/supabase/client";
import { formatDateFr, fullName } from "@/lib/format";
import type { Match, Player } from "@/lib/types";

type Rank = { name: string; moyenne: string };

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, isAdmin } = useAuth();
  const toast = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [voters, setVoters] = useState(0);
  const [tab, setTab] = useState<"noter" | "classement">("noter");
  const [pending, setPending] = useState(false);
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id || !profile) return;
    async function load() {
      const supabase = createClient();
      const { data: m } = await supabase.from("matches").select("*").eq("id", id).single();
      setMatch(m as Match);
      const { data: lineup } = await supabase
        .from("match_lineups")
        .select("player_id")
        .eq("match_id", id);
      const ids = (lineup ?? []).map((l: { player_id: string }) => l.player_id);
      if (ids.length === 0) {
        setPlayers([]);
        setLoaded(true);
        return;
      }
      const { data: plist } = await supabase.from("players").select("*").in("id", ids);
      setPlayers((plist as Player[]) ?? []);
      const { data: ratings } = await supabase.from("ratings").select("*").eq("match_id", id);
      const mine: Record<string, string> = {};
      const totals: Record<string, { t: number; n: number }> = {};
      const voterSet = new Set<string>();
      (ratings ?? []).forEach(
        (r: { player_id: string; voter_id: string; rating: number }) => {
          voterSet.add(r.voter_id);
          if (r.voter_id === profile!.id) mine[r.player_id] = String(r.rating);
          totals[r.player_id] = totals[r.player_id] ?? { t: 0, n: 0 };
          totals[r.player_id].t += Number(r.rating);
          totals[r.player_id].n += 1;
        },
      );
      setNotes(mine);
      setVoters(voterSet.size);
      const names = Object.fromEntries(
        ((plist as Player[]) ?? []).map((p) => [p.id, fullName(p)]),
      );
      setRanks(
        Object.entries(totals)
          .filter(([, v]) => v.n > 0)
          .map(([pid, v]) => ({
            name: names[pid] ?? "Joueur",
            moyenne: (v.t / v.n).toFixed(1),
          }))
          .sort((a, b) => Number(b.moyenne) - Number(a.moyenne)),
      );
      setLoaded(true);
    }
    load();
  }, [id, profile, tick]);

  async function save() {
    if (!profile || !id) return;
    setPending(true);
    const result = await saveRatingsAction(id, notes);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Notes enregistrées.");
    setTab("classement");
    setTick((n) => n + 1);
  }

  return (
    <main>
      <PageIntro
        kicker="Feuille de match"
        title={match ? match.opponent : "Match"}
        subtitle={
          match
            ? `${formatDateFr(match.match_date)} · ${
                match.team_type === "reserve" ? "Réserve" : "Première"
              }`
            : undefined
        }
      />

      <div className="rating-panel">
      <div className="segmented two mb-4">
        <button
          type="button"
          className={tab === "noter" ? "is-on" : ""}
          onClick={() => setTab("noter")}
        >
          Noter
        </button>
        <button
          type="button"
          className={tab === "classement" ? "is-on" : ""}
          onClick={() => setTab("classement")}
        >
          Classement
        </button>
      </div>

      {!loaded ? (
        <LoadingLine />
      ) : tab === "noter" ? (
        players.length === 0 ? (
          <EmptyState
            title="Pas de composition"
            text="Il faut d’abord poser la feuille de match."
            actionHref={isAdmin ? "/admin/compos" : "/calendrier"}
            actionLabel={isAdmin ? "Gérer les compos" : "Retour calendrier"}
          />
        ) : (
          <div className="card-club text-left">
            {players.map((p) => (
              <label
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-black/5 py-3.5 last:border-0"
              >
                <span className="min-w-0 truncate font-semibold">{fullName(p)}</span>
                <input
                  className="field w-[76px] min-h-11 shrink-0 p-2 text-center"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={10}
                  step={0.5}
                  value={notes[p.id] ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  aria-label={`Note de ${fullName(p)}`}
                />
              </label>
            ))}
            <button
              type="button"
              className="btn-gold-block mt-4"
              disabled={pending}
              onClick={save}
            >
              {pending ? "Enregistrement…" : "Valider mes notes"}
            </button>
          </div>
        )
      ) : ranks.length === 0 ? (
        <EmptyState
          title="Aucune note"
          text="Les moyennes apparaîtront dès que quelqu’un aura noté."
        />
      ) : (
        <div className="card-club text-left">
          {isAdmin ? (
            <p className="mb-3 rounded-2xl bg-[#f2f2f4] px-3 py-2 text-sm text-neutral-600">
              {voters} votant{voters > 1 ? "s" : ""}
            </p>
          ) : null}
          <ol className="stack-list !gap-0">
            {ranks.map((r, i) => (
              <li key={r.name} className="person-row !shadow-none !px-0">
                <span className="rank-num">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span>
                <span className="score-pill">{r.moyenne}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      </div>

      <p className="mt-5 text-center">
        <Link href="/calendrier" className="action-link">
          ← Calendrier
        </Link>
      </p>
    </main>
  );
}
