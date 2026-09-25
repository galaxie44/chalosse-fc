"use client";

import Link from "next/link";
import { useState } from "react";
import { updatePasswordAction } from "@/app/actions/club";
import { AuthBrand } from "@/components/ui/AuthBrand";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function ReinitialiserMdpPage() {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    const result = await updatePasswordAction(password);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    window.location.assign("/");
  }

  return (
    <main className="auth-screen">
      <form onSubmit={onSubmit} className="auth-card" noValidate>
        <AuthBrand
          title="Nouveau mot de passe"
          subtitle="Au moins 6 caractères"
        />
        <Field label="Nouveau mot de passe" htmlFor="password">
          <input
            id="password"
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={6}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Field label="Confirmation" htmlFor="confirm">
          <input
            id="confirm"
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={6}
            maxLength={72}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </Field>
        <button type="submit" disabled={pending} className="btn-gold-block">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <div className="auth-links">
          <Link href="/connexion" className="auth-link">
            Retour à la connexion
          </Link>
        </div>
      </form>
    </main>
  );
}
