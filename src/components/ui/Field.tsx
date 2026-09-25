"use client";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 text-left">
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.8rem] font-medium text-neutral-500">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs font-medium text-ink/70">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs font-bold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const cls =
    tone === "error"
      ? "bg-red-50 text-red-800"
      : tone === "success"
        ? "bg-green-50 text-green-900"
        : "bg-neutral-100 text-ink";
  return (
    <p className={`mb-3 px-3 py-2 text-sm font-bold ${cls}`} role="status">
      {children}
    </p>
  );
}
