import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { getSessionUser } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getSessionUser();
  if (profile?.role !== "admin") {
    redirect("/");
  }
  return <AdminShell>{children}</AdminShell>;
}
