"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/components/ui/Toast";
import { updateDateAction, updateScoreAction } from "@/app/actions/club";
import type { Match } from "@/lib/types";

export function ScoreDialog({
  match,
  onClose,
  onSaved,
}: {
  match: Match | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [chalosse, setChalosse] = useState("");
  const [adv, setAdv] = useState("");
  const [clear, setClear] = useState(false);
  const [pending, setPending] = useState(false);

  const open = Boolean(match);

  useEffect(() => {
    if (!match) return;
    setClear(false);
    setChalosse(match.score_chalosse?.toString() ?? "");
    setAdv(match.score_adversaire?.toString() ?? "");
  }, [match]);

  return (
    <Dialog
      open={open}
      title={match ? `Score — ${match.opponent}` : "Score"}
      onClose={onClose}
    >
      {match ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const result = await updateScoreAction(
              match.id,
              clear ? "" : chalosse,
              clear ? null : adv,
            );
            setPending(false);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Score enregistré.");
            onSaved();
            onClose();
          }}
        >
          <label className="mb-3 flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={clear}
              onChange={(e) => setClear(e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Effacer le score (remettre VS)
          </label>
          {!clear ? (
            <>
              <Field label="FC Chalosse" htmlFor="score-c">
                <input
                  id="score-c"
                  className="field"
                  inputMode="numeric"
                  min={0}
                  max={99}
                  value={chalosse}
                  onChange={(e) => setChalosse(e.target.value)}
                  required
                />
              </Field>
              <Field label={match.opponent} htmlFor="score-a">
                <input
                  id="score-a"
                  className="field"
                  inputMode="numeric"
                  min={0}
                  max={99}
                  value={adv}
                  onChange={(e) => setAdv(e.target.value)}
                  required
                />
              </Field>
            </>
          ) : null}
          <button type="submit" className="btn-gold-block" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      ) : null}
    </Dialog>
  );
}

export function DateDialog({
  match,
  onClose,
  onSaved,
}: {
  match: Match | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [date, setDate] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (match) setDate(match.match_date);
  }, [match]);

  return (
    <Dialog
      open={Boolean(match)}
      title="Modifier la date"
      onClose={onClose}
    >
      {match ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const result = await updateDateAction(match.id, date || match.match_date);
            setPending(false);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Date mise à jour.");
            onSaved();
            onClose();
          }}
        >
          <Field label="Date du match" htmlFor="match-date">
            <DatePicker id="match-date" value={date || match.match_date} onChange={setDate} />
          </Field>
          <button type="submit" className="btn-gold-block" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer la date"}
          </button>
        </form>
      ) : null}
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} title={title} onClose={onCancel}>
      <p className="mb-4 text-sm font-medium">{message}</p>
      <div className="flex gap-2">
        <button type="button" className="btn-dark flex-1" onClick={onCancel}>
          Annuler
        </button>
        <button
          type="button"
          className="btn-danger flex-1"
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? "Suppression…" : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
