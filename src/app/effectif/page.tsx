"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ConfirmDialog } from "@/components/ui/ClubDialogs";
import { EmptyState, LoadingLine, PageIntro } from "@/components/ui/PageBits";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { deletePlayerAction } from "@/app/actions/club";
import { createClient } from "@/lib/supabase/client";
import { fullName } from "@/lib/format";
import type { Player } from "@/lib/types";

const POSTES = ["Tous", "Gardien", "Défenseur", "Milieu", "Attaquant", "Coach"];

export default function EffectifPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [q, setQ] = useState("");
  const [poste, setPoste] = useState("Tous");
  const [toDelete, setToDelete] = useState<Player | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("players").select("*");
    const list = ((data as Player[]) ?? []).sort((a, b) =>
      a.last_name.localeCompare(b.last_name, "fr"),
    );
    setPlayers(list);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!players) return [];
    const needle = q.trim().toLowerCase();
    return players.filter((p) => {
      if (poste !== "Tous" && p.position !== poste) return false;
      if (!needle) return true;
      return fullName(p).toLowerCase().includes(needle);
    });
  }, [players, q, poste]);

  return (
    <main>
      <PageIntro
        kicker="Groupe"
        title="Effectif"
        subtitle="Joueurs et staff du club."
      />

      {isAdmin && players && players.length > 0 ? (
        <Link href="/admin/joueur" className="btn-gold mb-4 inline-flex">
          Ajouter un joueur
        </Link>
      ) : null}

      {players !== null && players.length > 0 ? (
        <div className="filter-bar">
          <input
            className="field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un nom…"
            aria-label="Rechercher"
          />
          <Select
            value={poste}
            onChange={setPoste}
            options={POSTES.map((p) => ({ value: p, label: p }))}
          />
        </div>
      ) : null}

      {players === null ? (
        <LoadingLine />
      ) : players.length === 0 ? (
        <EmptyState
          title="Effectif vide"
          text="Ajoutez les joueurs pour constituer le groupe."
          actionHref={isAdmin ? "/admin/joueur" : undefined}
          actionLabel={isAdmin ? "Nouvelle recrue" : undefined}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun résultat"
          text="Essayez un autre nom ou un autre poste."
        />
      ) : (
        <>
          <p className="count-line">{filtered.length} joueur{filtered.length > 1 ? "s" : ""}</p>
          <ul className="stack-list cards-grid">
            {filtered.map((player) => (
              <li key={player.id} className="person-row">
                <span className="avatar">{player.last_name.slice(0, 1)}</span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate">{fullName(player)}</strong>
                  <span className="text-sm text-neutral-500">{player.position}</span>
                </div>
                {isAdmin ? (
                  <button
                    type="button"
                    className="action-link danger"
                    onClick={() => setToDelete(player)}
                  >
                    Retirer
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Retirer du club"
        message={
          toDelete
            ? `${fullName(toDelete)} sera retiré de l’effectif, des compos et des stats.`
            : ""
        }
        confirmLabel="Supprimer"
        pending={pending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          setPending(true);
          const result = await deletePlayerAction(toDelete.id);
          setPending(false);
          if (result.ok) {
            toast.success("Joueur retiré.");
            setToDelete(null);
            load();
          } else {
            toast.error(result.error);
          }
        }}
      />
    </main>
  );
}
