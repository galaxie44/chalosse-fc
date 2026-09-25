import Link from "next/link";

export function EmptyState({
  title,
  text,
  actionHref,
  actionLabel,
}: {
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      <p className="empty-text">{text}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-gold mt-4 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="page-intro">
      {kicker ? <p className="page-kicker">{kicker}</p> : null}
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </header>
  );
}

export function LoadingLine({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="loading-block" aria-busy="true" aria-live="polite">
      <span className="loading-bar" />
      <p className="muted-line">{label}</p>
    </div>
  );
}
