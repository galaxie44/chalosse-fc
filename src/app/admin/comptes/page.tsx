"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ConfirmDialog } from "@/components/ui/ClubDialogs";
import { EmptyState, LoadingLine, PageIntro } from "@/components/ui/PageBits";
import { useToast } from "@/components/ui/Toast";
import { deleteAccountAction } from "@/app/actions/club";
import { createClient } from "@/lib/supabase/client";
import { fullName } from "@/lib/format";
import type { Profile } from "@/lib/types";

export default function ComptesPage() {
  const { isAdmin, profile } = useAuth();
  const toast = useToast();
  const [accounts, setAccounts] = useState<Profile[] | null>(null);
  const [toDelete, setToDelete] = useState<Profile | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").order("last_name");
    setAccounts((data as Profile[]) ?? []);
  }

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  return (
    <main>
      <PageIntro
        kicker="Staff"
        title="Comptes"
        subtitle="Accès à l’application. L’effectif sportif se gère à part."
      />

      {accounts === null ? (
        <LoadingLine />
      ) : accounts.length === 0 ? (
        <EmptyState title="Aucun compte" text="Personne n’est inscrit pour le moment." />
      ) : (
        <ul className="stack-list cards-grid">
          {accounts.map((acc) => (
            <li key={acc.id} className="account-card">
              <div className="min-w-0">
                <strong className="block truncate">{fullName(acc)}</strong>
                <span className="mt-0.5 block break-all text-xs text-neutral-500">
                  {acc.email}
                </span>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                    acc.role === "admin"
                      ? "bg-[#1d1d1f] text-white"
                      : "bg-[#f2f2f4] text-[#1d1d1f]"
                  }`}
                >
                  {acc.role === "admin" ? "Admin" : "Utilisateur"}
                </span>
              </div>
              {acc.id === profile?.id ? (
                <p className="mt-3 text-sm text-neutral-500">C’est vous</p>
              ) : (
                <button
                  type="button"
                  className="action-link danger mt-3"
                  onClick={() => setToDelete(acc)}
                >
                  Supprimer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer le compte"
        message={
          toDelete
            ? `Le compte de ${fullName(toDelete)} sera retiré.`
            : ""
        }
        confirmLabel="Supprimer"
        pending={pending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          setPending(true);
          const result = await deleteAccountAction(toDelete.id);
          setPending(false);
          if (result.ok) {
            toast.success("Compte retiré.");
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
