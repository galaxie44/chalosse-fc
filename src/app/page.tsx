"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { useAuth } from "@/components/AuthProvider";
import { ScoreDialog } from "@/components/ui/ClubDialogs";
import { EmptyState, PageIntro } from "@/components/ui/PageBits";
import { createClient } from "@/lib/supabase/client";
import type { Match } from "@/lib/types";

function closestMatch(list: Match[]) {
  if (list.length === 0) return null;
  const now = Date.now();
  return [...list].sort((a, b) => {
    const da = Math.abs(new Date(a.match_date).getTime() - now);
    const db = Math.abs(new Date(b.match_date).getTime() - now);
    return da - db;
  })[0];
}

export default function HomePage() {
  const { isAdmin, profile, loading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [scoreMatch, setScoreMatch] = useState<Match | null>(null);

  async function reload() {
    const supabase = createClient();
    const { data } = await supabase.from("matches").select("*");
    setMatches((data as Match[]) ?? []);
  }

  useEffect(() => {
    reload();
  }, []);

  const premiere = closestMatch(matches.filter((m) => m.team_type === "premiere"));
  const reserve = closestMatch(matches.filter((m) => m.team_type === "reserve"));
  const empty = !premiere && !reserve;

  return (
    <main>
      <PageIntro
        kicker="FC Chalosse"
        title={profile ? `Bonjour${profile.first_name ? `, ${profile.first_name}` : ""}` : "Club"}
        subtitle="Prochains matchs, notes et vie du groupe."
      />

      {!loading && !profile ? (
        <Link href="/connexion" className="btn-gold mb-5 inline-flex min-w-[180px]">
          Se connecter
        </Link>
      ) : null}

      {empty ? (
        <EmptyState
          title="Rien à l’affiche"
          text="Dès qu’un match est créé, il apparaîtra ici."
          actionHref={isAdmin ? "/admin/match" : "/calendrier"}
          actionLabel={isAdmin ? "Créer un match" : "Voir le calendrier"}
        />
      ) : (
        <div className="home-grid">
          <section>
            <div className="section-row">
              <h2 className="section-premiere">Première</h2>
            </div>
            {premiere ? (
              <MatchCard
                match={premiere}
                href={`/match/${premiere.id}`}
                adminActions={
                  isAdmin ? (
                    <button
                      type="button"
                      className="action-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setScoreMatch(premiere);
                      }}
                    >
                      Modifier le score
                    </button>
                  ) : null
                }
              />
            ) : (
              <p className="muted-line">Aucun match Première.</p>
            )}
          </section>

          <section>
            <div className="section-row">
              <h2 className="section-reserve">Réserve</h2>
            </div>
            {reserve ? (
              <MatchCard
                match={reserve}
                href={`/match/${reserve.id}`}
                adminActions={
                  isAdmin ? (
                    <button
                      type="button"
                      className="action-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setScoreMatch(reserve);
                      }}
                    >
                      Modifier le score
                    </button>
                  ) : null
                }
              />
            ) : (
              <p className="muted-line">Aucun match Réserve.</p>
            )}
          </section>
        </div>
      )}

      <div className="quick-links mt-5">
        <Link href="/classement">Homme du match</Link>
        <Link href="/aide">Guide</Link>
        {isAdmin ? <Link href="/admin">Administration</Link> : null}
      </div>

      <ScoreDialog
        match={scoreMatch}
        onClose={() => setScoreMatch(null)}
        onSaved={reload}
      />
    </main>
  );
}
