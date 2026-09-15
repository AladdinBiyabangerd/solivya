import { marketingHomeHref } from "@/lib/site";
import { headers } from "next/headers";
import { AdminChrome } from "./AdminChrome";

export type AdminNav = "home" | "new" | "profile" | "edit";

type Props = {
  active: AdminNav;
  children: React.ReactNode;
};

export async function AdminShell({ active, children }: Props) {
  const host = (await headers()).get("host") ?? "";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
  const landingHref = marketingHomeHref({ isLocal });

  return (
    <AdminChrome active={active} landingHref={landingHref}>
      {children}
    </AdminChrome>
  );
}
