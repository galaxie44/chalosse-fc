"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const TITLES: Record<string, string> = {
  "/": "Club",
  "/effectif": "Effectif",
  "/calendrier": "Calendrier",
  "/stats": "Statistiques",
  "/classement": "Homme du match",
  "/aide": "Guide",
  "/admin": "Administration",
  "/admin/joueur": "Nouvelle recrue",
  "/admin/match": "Nouveau match",
  "/admin/compos": "Compositions",
  "/admin/stats": "Stats match",
  "/admin/comptes": "Comptes",
};

const DESKTOP_NAV = [
  { href: "/", label: "Club" },
  { href: "/calendrier", label: "Matchs" },
  { href: "/effectif", label: "Effectif" },
  { href: "/stats", label: "Stats" },
  { href: "/classement", label: "Notes" },
  { href: "/aide", label: "Aide" },
] as const;

const MOBILE_NAV = [
  { href: "/", label: "Club" },
  { href: "/calendrier", label: "Matchs" },
  { href: "/effectif", label: "Effectif" },
  { href: "/stats", label: "Stats" },
] as const;

function isAuthPath(path: string) {
  return (
    path.startsWith("/connexion") ||
    path.startsWith("/inscription") ||
    path.startsWith("/mdp-oublie") ||
    path.startsWith("/reinitialiser-mdp")
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function ClubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading, isAdmin, signOut } = useAuth();
  if (isAuthPath(pathname)) return <>{children}</>;

  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/match/") ? "Feuille de match" : "FC Chalosse");
  const showNav = Boolean(profile);

  return (
    <div className={`app-root ${showNav ? "with-nav" : ""}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="topbar-brand">
            <Image
              src="/chalosse.webp"
              alt=""
              width={36}
              height={36}
              className="topbar-logo"
            />
            <span>
              <strong>FC Chalosse</strong>
              <em>{title}</em>
            </span>
          </Link>

          {showNav ? (
            <nav className="desktop-nav" aria-label="Navigation principale">
              {DESKTOP_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive(pathname, item.href) ? "is-active" : ""}
                >
                  {item.label}
                </Link>
              ))}
              {isAdmin ? (
                <Link
                  href="/admin"
                  className={pathname.startsWith("/admin") ? "is-active" : ""}
                >
                  Admin
                </Link>
              ) : null}
            </nav>
          ) : null}

          <div className="topbar-actions">
            {profile ? (
              <button type="button" className="topbar-quit" onClick={signOut}>
                Quitter
              </button>
            ) : loading ? (
              <span className="topbar-muted">…</span>
            ) : (
              <Link href="/connexion" className="topbar-quit">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className={`app-body ${showNav ? "has-nav" : ""}`}>{children}</div>

      {showNav ? (
        <nav className="tabbar" aria-label="Navigation mobile">
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "is-active" : ""}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              href="/admin"
              className={pathname.startsWith("/admin") ? "is-active" : ""}
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/aide"
              className={pathname.startsWith("/aide") ? "is-active" : ""}
            >
              Aide
            </Link>
          )}
        </nav>
      ) : null}
    </div>
  );
}

export function PageHeader({ title }: { title: string }) {
  return <h1 className="sr-only">{title}</h1>;
}

export function BackHome() {
  return null;
}

export function SessionBar() {
  return null;
}
