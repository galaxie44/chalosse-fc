"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordResetAction } from "@/app/actions/club";
import { AuthBrand } from "@/components/ui/AuthBrand";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export default function MdpOubliePage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await requestPasswordResetAction(email);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDone(true);
    toast.success("Si un compte correspond, un e-mail a été envoyé.");
  }

  return (
    <main className="auth-screen">
      <form onSubmit={onSubmit} className="auth-card" noValidate>
        <AuthBrand
          title="Mot de passe oublié"
          subtitle="Recevez un lien de réinitialisation par e-mail"
        />
        {done ? (
          <p className="auth-done">
            Vérifiez votre boîte mail. Le lien expire après quelques minutes.
          </p>
        ) : (
          <>
            <Field label="Adresse e-mail" htmlFor="email">
              <input
                id="email"
                className="field"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                required
              />
            </Field>
            <button type="submit" disabled={pending} className="btn-gold-block">
              {pending ? "Envoi…" : "Envoyer le lien"}
            </button>
          </>
        )}
        <div className="auth-links">
          <Link href="/connexion" className="auth-link">
            Retour à la connexion
          </Link>
        </div>
      </form>
    </main>
  );
}
