"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveStatsAction } from "@/app/actions/club";
import { createClient } from "@/lib/supabase/client";
import { EmptyState, PageIntro } from "@/components/ui/PageBits";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { formatDateFr, fullName } from "@/lib/format";
import type { Match, MatchStat, Player } from "@/lib/types";

type Draft = Record<
  string,
  { goals: string; assists: string; yellow_cards: string; red_cards: string }
>;

export default function SaisirStatsPage() {
  const toast = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchId, setMatchId] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [draft, setDraft] = useState<Draft>({});
  const [pending, setPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    createClient()
      .from("matches")
      .select("*")
      .order("match_date")
      .then(({ data }) => setMatches((data as Match[]) ?? []));
  }, []);

  async function onMatch(id: string) {
    setMatchId(id);
    if (!id) {
      setPlayers([]);
      return;
    }
    const supabase = createClient();
    const { data: lineup } = await supabase
      .from("match_lineups")
      .select("player_id")
      .eq("match_id", id);
    const ids = (lineup ?? []).map((l: { player_id: string }) => l.player_id);
    if (!ids.length) {
      setPlayers([]);
      toast.info("Aucune compo faite pour ce match.");
      return;
    }
    const [{ data: plist }, { data: stats }] = await Promise.all([
      supabase.from("players").select("*").in("id", ids),
      supabase.from("match_stats").select("*").eq("match_id", id),
    ]);
    const list = (plist as Player[]) ?? [];
    setPlayers(list);
    const byId = Object.fromEntries(
      ((stats as MatchStat[]) ?? []).map((s) => [s.player_id, s]),
    );
    const d: Draft = {};
    list.forEach((p) => {
      const s = byId[p.id];
      d[p.id] = {
        goals: String(s?.goals ?? 0),
        assists: String(s?.assists ?? 0),
        yellow_cards: String(s?.yellow_cards ?? 0),
        red_cards: String(s?.red_cards ?? 0),
      };
    });
    setDraft(d);
  }

  async function save() {
    if (!matchId) return;
    setPending(true);
    const result = await saveStatsAction(
      matchId,
      players.map((p) => ({
        playerId: p.id,
        goals: parseInt(draft[p.id]?.goals || "0", 10) || 0,
        assists: parseInt(draft[p.id]?.assists || "0", 10) || 0,
        yellow: parseInt(draft[p.id]?.yellow_cards || "0", 10) || 0,
        red: parseInt(draft[p.id]?.red_cards || "0", 10) || 0,
      })),
    );
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Stats enregistrées.");
    router.push("/stats");
  }

  return (
    <main>
      <PageIntro
        kicker="Staff"
        title="Stats du match"
        subtitle="Buts, passes et cartons après la composition."
      />
      <div className="page-layout-split">
        <div className="card-club text-left">
          <Field label="Match" htmlFor="sel-match">
            <Select
              id="sel-match"
              value={matchId}
              placeholder="Choisir un match"
              onChange={onMatch}
              options={[
                { value: "", label: "Choisir un match" },
                ...matches.map((m) => ({
                  value: m.id,
                  label: `${m.team_type === "premiere" ? "1ère" : "Rés."} · ${m.opponent} (${formatDateFr(m.match_date)})`,
                })),
              ]}
            />
          </Field>
        </div>
        <div>
          {matchId && players.length === 0 ? (
            <EmptyState
              title="Pas de composition"
              text="Posez d’abord la feuille de match pour saisir les stats."
              actionHref="/admin/compos"
              actionLabel="Compositions"
            />
          ) : null}
          {players.length > 0 ? (
            <div className="card-club text-left">
              {players.map((p) => (
                <div key={p.id} className="border-b border-black/5 py-3 last:border-0">
                  <p className="mb-2 font-semibold">{fullName(p)}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        ["goals", "Buts"],
                        ["assists", "Passes"],
                        ["yellow_cards", "Jaunes"],
                        ["red_cards", "Rouges"],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex flex-col items-center text-[0.7rem] font-medium text-neutral-500"
                      >
                        {label}
                        <input
                          className="field mt-1 min-h-11 p-1 text-center font-semibold text-ink"
                          type="number"
                          min={0}
                          max={20}
                          inputMode="numeric"
                          value={draft[p.id]?.[key] ?? "0"}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              [p.id]: { ...prev[p.id], [key]: e.target.value },
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn-gold-block mt-4"
                disabled={pending}
                onClick={save}
              >
                {pending ? "Enregistrement…" : "Enregistrer les stats"}
              </button>
            </div>
          ) : !matchId ? (
            <EmptyState
              title="Sélectionnez un match"
              text="Choisissez une rencontre pour saisir buts, passes et cartons."
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
