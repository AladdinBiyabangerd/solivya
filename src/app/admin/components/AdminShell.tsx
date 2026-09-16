import { marketingHomeHref } from "@/lib/site";
import { headers } from "next/headers";
import { AdminChrome } from "./AdminChrome";

type Props = {
  children: React.ReactNode;
};

export async function AdminShell({ children }: Props) {
  const host = (await headers()).get("host") ?? "";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
  const landingHref = marketingHomeHref({ isLocal });

  return <AdminChrome landingHref={landingHref}>{children}</AdminChrome>;
}
