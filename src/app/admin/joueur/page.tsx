"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addPlayerAction } from "@/app/actions/club";
import { Field } from "@/components/ui/Field";
import { PageIntro } from "@/components/ui/PageBits";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

const POSTES = ["Gardien", "Défenseur", "Milieu", "Attaquant", "Coach"] as const;

export default function AjouterJoueurPage() {
  const router = useRouter();
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("Milieu");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await addPlayerAction({ firstName, lastName, position });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Joueur ajouté à l'effectif.");
    router.push("/effectif");
  }

  return (
    <main>
      <PageIntro
        kicker="Staff"
        title="Nouvelle recrue"
        subtitle="Ajoutez un joueur à l’effectif."
      />
      <form onSubmit={submit} className="card-club form-panel">
        <Field label="Prénom" htmlFor="prenom">
          <input
            id="prenom"
            className="field"
            maxLength={80}
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </Field>
        <Field label="Nom" htmlFor="nom">
          <input
            id="nom"
            className="field"
            maxLength={80}
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </Field>
        <Field label="Poste" htmlFor="poste">
          <Select
            id="poste"
            value={position}
            onChange={setPosition}
            options={POSTES.map((p) => ({ value: p, label: p }))}
          />
        </Field>
        <button type="submit" className="btn-gold-block" disabled={pending}>
          {pending ? "Ajout…" : "Ajouter à l'effectif"}
        </button>
      </form>
    </main>
  );
}
