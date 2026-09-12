import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard role="TEACHER"><AppShell role="TEACHER">{children}</AppShell></RouteGuard>;
}
