import Link from "next/link";
import { PageIntro } from "@/components/ui/PageBits";

const TILES = [
  {
    href: "/admin/joueur",
    title: "Joueur",
    text: "Ajouter une recrue",
  },
  {
    href: "/admin/match",
    title: "Match",
    text: "Créer une rencontre",
  },
  {
    href: "/admin/compos",
    title: "Compos",
    text: "Feuille de match",
  },
  {
    href: "/admin/stats",
    title: "Stats",
    text: "Buts et cartons",
  },
  {
    href: "/admin/comptes",
    title: "Comptes",
    text: "Accès à l’app",
  },
] as const;

export default function AdminHubPage() {
  return (
    <main>
      <PageIntro
        kicker="Staff"
        title="Administration"
        subtitle="Tout ce qu’il faut pour gérer le club."
      />
      <nav className="admin-grid" aria-label="Actions administrateur">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="admin-tile">
            <strong>{t.title}</strong>
            <span>{t.text}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
