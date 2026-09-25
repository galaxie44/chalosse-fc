"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { signUpAction } from "@/app/actions/club";
import { AuthBrand } from "@/components/ui/AuthBrand";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function InscriptionPage() {
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const strength = useMemo(() => {
    if (password.length === 0) return "";
    if (password.length < 6) return "Trop court (6 caractères minimum).";
    return "Mot de passe valide.";
  }, [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await signUpAction({ firstName, lastName, email, password });
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
          title="Inscription"
          subtitle="Rejoindre l’application du club"
        />
        <div className="auth-row">
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
        </div>
        <Field label="Adresse e-mail" htmlFor="email">
          <input
            id="email"
            className="field"
            type="email"
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Mot de passe" htmlFor="password" hint={strength}>
          <input
            id="password"
            className="field"
            type="password"
            minLength={6}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <button type="submit" disabled={pending} className="btn-gold-block">
          {pending ? "Création…" : "Créer mon compte"}
        </button>
        <div className="auth-links">
          <Link href="/connexion" className="auth-link">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </form>
    </main>
  );
}
