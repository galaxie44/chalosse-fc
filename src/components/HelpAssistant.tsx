"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { HelpMarkdown } from "@/components/HelpMarkdown";
import {
  topicsFor,
  welcomeMarkdown,
  type HelpRole,
  type HelpTopic,
} from "@/lib/help/content";

type Message = { id: string; from: "bot" | "user"; text: string };

function roleFromAuth(
  loading: boolean,
  profile: { role: string; first_name: string } | null,
): HelpRole {
  if (loading) return "invite";
  if (!profile) return "invite";
  if (profile.role === "admin") return "admin";
  return "utilisateur";
}

export function HelpAssistant() {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const role = roleFromAuth(loading, profile);
  const topics = useMemo(() => topicsFor(role), [role]);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const loggedIn = Boolean(profile);
  const onAuthPage =
    pathname.startsWith("/connexion") ||
    pathname.startsWith("/inscription") ||
    pathname.startsWith("/mdp-oublie") ||
    pathname.startsWith("/reinitialiser-mdp");

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        from: "bot",
        text: welcomeMarkdown(role, profile?.first_name),
      },
    ]);
  }, [role, profile?.first_name]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function ask(topic: HelpTopic) {
    setMessages((prev) => [
      ...prev,
      { id: `u-${topic.id}-${Date.now()}`, from: "user", text: topic.question },
      { id: `b-${topic.id}-${Date.now()}`, from: "bot", text: topic.answer },
    ]);
  }

  function reset() {
    setMessages([
      {
        id: "welcome",
        from: "bot",
        text: welcomeMarkdown(role, profile?.first_name),
      },
    ]);
  }

  const roleLabel =
    role === "admin"
      ? "Admin"
      : role === "utilisateur"
        ? "Joueur"
        : "Visiteur";

  if (onAuthPage) return null;

  return (
    <div
      className={`help-fab pointer-events-none fixed right-4 z-[80] flex flex-col items-end gap-3 ${
        loggedIn ? "bottom-28 md:bottom-7" : "bottom-6"
      }`}
    >
      {open ? (
        <section
          className="pointer-events-auto flex h-[min(480px,68vh)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
          aria-label="Assistant d'aide"
        >
          <header className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Aide</p>
              <p className="text-xs text-neutral-500">{roleLabel}</p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-neutral-500"
              onClick={() => setOpen(false)}
            >
              Fermer
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3 text-left text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.from === "user"
                    ? "ml-8 rounded-2xl bg-[#1d1d1f] px-3 py-2 font-medium text-white"
                    : "mr-4 rounded-2xl bg-[#f2f2f4] px-3 py-2"
                }
              >
                {m.from === "user" ? m.text : <HelpMarkdown source={m.text} />}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-black/5 p-2">
            <p className="mb-1.5 px-2 text-xs font-medium text-neutral-500">
              Questions
            </p>
            <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
              {topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="rounded-2xl bg-[#f2f2f4] px-3 py-2 text-left text-[0.8rem] font-medium hover:bg-[#ececee]"
                  onClick={() => ask(t)}
                >
                  {t.question}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 w-full rounded-full bg-[#f2f2f4] py-2 text-sm font-medium"
              onClick={reset}
            >
              Recommencer
            </button>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1d1d1f] text-lg font-medium text-white shadow-lg"
        aria-expanded={open}
        aria-label={open ? "Fermer l'aide" : "Ouvrir l'aide"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "×" : "?"}
      </button>
    </div>
  );
}
