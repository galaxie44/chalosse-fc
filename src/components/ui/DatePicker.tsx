"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function parse(iso: string) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatFr(iso: string) {
  const d = parse(iso);
  if (!d) return "Choisir une date";
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DatePicker({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = parse(value) ?? new Date();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysIn = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const out: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) out.push(null);
    for (let d = 1; d <= daysIn; d++) out.push(d);
    return out;
  }, [cursor]);

  const selectedIso = value;

  return (
    <div ref={wrap} className={`datepicker ${open ? "is-open" : ""}`}>
      <button
        id={id}
        type="button"
        className="select-trigger"
        aria-expanded={open}
        onClick={() => {
          setCursor(new Date(selected.getFullYear(), selected.getMonth(), 1));
          setOpen((v) => !v);
        }}
      >
        <span>{formatFr(value)}</span>
        <span className="select-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="cal-pop" role="dialog" aria-label="Calendrier">
          <div className="cal-head">
            <button
              type="button"
              className="cal-nav"
              aria-label="Mois précédent"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
              }
            >
              ‹
            </button>
            <p className="cal-title">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
            <button
              type="button"
              className="cal-nav"
              aria-label="Mois suivant"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
              }
            >
              ›
            </button>
          </div>
          <div className="cal-week">
            {WEEK.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="cal-grid">
            {cells.map((d, i) => {
              if (!d) return <span key={`e-${i}`} />;
              const iso = toIso(new Date(cursor.getFullYear(), cursor.getMonth(), d));
              const today = iso === toIso(new Date());
              const active = iso === selectedIso;
              return (
                <button
                  key={iso}
                  type="button"
                  className={`cal-day ${active ? "is-active" : ""} ${today ? "is-today" : ""}`}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
