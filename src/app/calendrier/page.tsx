"use client";

import { useEffect, useMemo, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { useAuth } from "@/components/AuthProvider";
import { ConfirmDialog, DateDialog, ScoreDialog } from "@/components/ui/ClubDialogs";
import { EmptyState, LoadingLine, PageIntro } from "@/components/ui/PageBits";
import { deleteMatchAction } from "@/app/actions/club";
import { createClient } from "@/lib/supabase/client";
import type { Match } from "@/lib/types";

export default function CalendrierPage() {
  const { isAdmin } = useAuth();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [filter, setFilter] = useState<"tous" | "a-venir" | "joues">("tous");
  const [scoreMatch, setScoreMatch] = useState<Match | null>(null);
  const [dateMatch, setDateMatch] = useState<Match | null>(null);
  const [toDelete, setToDelete] = useState<Match | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    setMatches((data as Match[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    if (!matches) return [];
    const today = new Date().toISOString().slice(0, 10);
    return matches.filter((m) => {
      if (filter === "a-venir") return m.match_date >= today && m.score_chalosse === null;
      if (filter === "joues") return m.score_chalosse !== null;
      return true;
    });
  }, [matches, filter]);

  const premiere = visible.filter((m) => m.team_type === "premiere");
  const reserve = visible.filter((m) => m.team_type === "reserve");

  function list(items: Match[]) {
    if (items.length === 0) {
      return <p className="muted-line">Aucun match dans ce filtre.</p>;
    }
    return items.map((match) => (
      <MatchCard
        key={match.id}
        match={match}
        href={`/match/${match.id}`}
        adminActions={
          isAdmin ? (
            <>
              <button
                type="button"
                className="action-link"
                onClick={(e) => {
                  e.preventDefault();
                  setScoreMatch(match);
                }}
              >
                Score
              </button>
              <button
                type="button"
                className="action-link"
                onClick={(e) => {
                  e.preventDefault();
                  setDateMatch(match);
                }}
              >
                Date
              </button>
              <button
                type="button"
                className="action-link danger"
                onClick={(e) => {
                  e.preventDefault();
                  setToDelete(match);
                }}
              >
                Retirer
              </button>
            </>
          ) : null
        }
      />
    ));
  }

  return (
    <main>
      <PageIntro
        kicker="Compétition"
        title="Calendrier"
        subtitle="Tous les matchs Première et Réserve."
      />
      {matches !== null && matches.length > 0 ? (
        <div className="segmented">
          {(
            [
              ["tous", "Tous"],
              ["a-venir", "À venir"],
              ["joues", "Joués"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? "is-on" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {matches === null ? (
        <LoadingLine />
      ) : matches.length === 0 ? (
        <EmptyState
          title="Calendrier vide"
          text="Créez un match pour commencer la saison."
          actionHref={isAdmin ? "/admin/match" : undefined}
          actionLabel={isAdmin ? "Nouveau match" : undefined}
        />
      ) : (
        <>
          <div className="match-board">
            <section>
              <h2 className="section-premiere">Première</h2>
              {list(premiere)}
            </section>
            <section>
              <h2 className="section-reserve">Réserve</h2>
              {list(reserve)}
            </section>
          </div>
        </>
      )}

      <ScoreDialog match={scoreMatch} onClose={() => setScoreMatch(null)} onSaved={load} />
      <DateDialog match={dateMatch} onClose={() => setDateMatch(null)} onSaved={load} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer le match"
        message={
          toDelete
            ? `Le match contre ${toDelete.opponent} sera définitivement retiré, ainsi que compos, stats et notes.`
            : ""
        }
        confirmLabel="Supprimer"
        pending={pending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          setPending(true);
          const result = await deleteMatchAction(toDelete.id);
          setPending(false);
          if (result.ok) {
            setToDelete(null);
            load();
          }
        }}
      />
    </main>
  );
}
