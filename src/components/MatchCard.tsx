"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDateFr } from "@/lib/format";
import { safeHttpsUrl } from "@/lib/security/sanitize";
import type { Match } from "@/lib/types";

function dateParts(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    m: d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
    day: d.getDate(),
  };
}

export function MatchCard({
  match,
  href,
  adminActions,
}: {
  match: Match;
  href?: string;
  adminActions?: React.ReactNode;
}) {
  const scored =
    match.score_chalosse !== null && match.score_adversaire !== null;
  const logo = safeHttpsUrl(match.opponent_logo);
  const { m, day } = dateParts(match.match_date);

  const body = (
    <>
      <div className="flex items-center gap-3">
        <div className="date-badge">
          <span className="m">{m}</span>
          <span className="d">{day}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-[0.92rem] font-semibold">
              FC Chalosse
            </span>
            {scored ? (
              <span className="score-pill shrink-0">
                {match.score_chalosse}-{match.score_adversaire}
              </span>
            ) : (
              <span className="vs-mark shrink-0">VS</span>
            )}
            <span className="min-w-0 flex-1 truncate text-right text-[0.92rem] font-semibold">
              {match.opponent}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {formatDateFr(match.match_date)}
            {match.team_type === "reserve" ? " · Réserve" : " · Première"}
          </p>
        </div>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            referrerPolicy="no-referrer"
            alt=""
            className="h-9 w-9 shrink-0 rounded-full bg-neutral-100 object-contain"
          />
        ) : (
          <Image
            src="/chalosse.webp"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        )}
      </div>
    </>
  );

  return (
    <article className="match-card-wrap">
      {href ? (
        <Link href={href} className="match-row">
          {body}
        </Link>
      ) : (
        <div className="match-row">{body}</div>
      )}
      {adminActions ? <div className="match-actions">{adminActions}</div> : null}
    </article>
  );
}
