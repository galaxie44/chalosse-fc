"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signInAction } from "@/app/actions/club";
import { AuthBrand } from "@/components/ui/AuthBrand";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function ConnexionPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("erreur") === "lien") {
      toast.error("Lien invalide ou expiré. Demandez un nouvel e-mail.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await signInAction({ email, password });
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
        <AuthBrand title="Connexion" subtitle="Espace club FC Chalosse" />
        <Field label="Adresse e-mail" htmlFor="email">
          <input
            id="email"
            className="field"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            required
          />
        </Field>
        <Field label="Mot de passe" htmlFor="password">
          <input
            id="password"
            className="field"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={72}
            required
          />
        </Field>
        <button type="submit" disabled={pending} className="btn-gold-block">
          {pending ? "Connexion…" : "Se connecter"}
        </button>
        <div className="auth-links">
          <Link href="/mdp-oublie" className="auth-link-muted">
            Mot de passe oublié ?
          </Link>
          <Link href="/inscription" className="auth-link">
            Créer un compte
          </Link>
        </div>
      </form>
    </main>
  );
}
