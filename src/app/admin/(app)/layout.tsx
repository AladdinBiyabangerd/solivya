import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/auth";
import { AdminShell } from "../components/AdminShell";

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
