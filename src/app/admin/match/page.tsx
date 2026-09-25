"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addMatchAction } from "@/app/actions/club";
import { Field } from "@/components/ui/Field";
import { DatePicker } from "@/components/ui/DatePicker";
import { PageIntro } from "@/components/ui/PageBits";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

export default function AjouterMatchPage() {
  const router = useRouter();
  const toast = useToast();
  const [team, setTeam] = useState<"premiere" | "reserve">("premiere");
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");
  const [logo, setLogo] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      toast.error("Choisissez une date.");
      return;
    }
    setPending(true);
    const result = await addMatchAction({ team, opponent, date, logo });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Match ajouté.");
    router.push("/calendrier");
  }

  return (
    <main>
      <PageIntro
        kicker="Staff"
        title="Nouveau match"
        subtitle="Première ou Réserve, adversaire et date."
      />
      <form onSubmit={submit} className="card-club form-panel">
        <Field label="Équipe" htmlFor="team">
          <Select
            id="team"
            value={team}
            onChange={(v) => setTeam(v as "premiere" | "reserve")}
            options={[
              { value: "premiere", label: "Équipe Première" },
              { value: "reserve", label: "Équipe Réserve" },
            ]}
          />
        </Field>
        <Field label="Adversaire" htmlFor="adv">
          <input
            id="adv"
            className="field"
            maxLength={80}
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            required
          />
        </Field>
        <Field label="Date" htmlFor="date">
          <DatePicker id="date" value={date} onChange={setDate} />
        </Field>
        <Field
          label="Logo adverse (optionnel)"
          htmlFor="logo"
          hint="URL https uniquement"
        >
          <input
            id="logo"
            className="field"
            type="url"
            inputMode="url"
            placeholder="https://"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
          />
        </Field>
        <button type="submit" className="btn-gold-block" disabled={pending}>
          {pending ? "Ajout…" : "Ajouter le match"}
        </button>
      </form>
    </main>
  );
}
