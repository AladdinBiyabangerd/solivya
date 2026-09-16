import { AdminChrome } from "./AdminChrome";

type Props = {
  children: React.ReactNode;
};

export async function AdminShell({ children }: Props) {
  // Same-origin path so soft navigation works (absolute apex URLs force reload).
  return <AdminChrome landingHref="/">{children}</AdminChrome>;
}
