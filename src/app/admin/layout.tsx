import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard role="ADMIN"><AppShell role="ADMIN">{children}</AppShell></RouteGuard>;
}
