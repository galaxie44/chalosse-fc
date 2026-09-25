"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHub = pathname === "/admin";
  return (
    <div>
      {!isHub ? (
        <Link href="/admin" className="back-link">
          ← Administration
        </Link>
      ) : null}
      {children}
    </div>
  );
}
