"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import type { UserRole } from "@/lib/models";
import { mockActors, useXaadirData } from "@/components/providers/XaadirDataProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export function AppShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const isAdmin = role === "ADMIN";
  const { setActor } = useXaadirData(); const { session } = useAuth();
  useEffect(() => { setActor(isAdmin ? mockActors.admin : mockActors.teacher); }, [isAdmin, setActor]);
  return <div className={`dashboard-shell app-shell role-${role.toLowerCase()}`} data-app-root>
    <Sidebar role={role} open={drawer} onClose={() => setDrawer(false)} />
    <div className="main-column">
      <Header onMenu={() => setDrawer(true)} teacher={!isAdmin} name={session?.name ?? (isAdmin ? "Xaadir School Admin" : "Ahmed Hassan")} email={session?.email ?? (isAdmin ? "admin.xaadir.demo@gmail.com" : "teacher.xaadir.demo@gmail.com")} />
      <main className="teacher-main">{children}</main>
    </div>
  </div>;
}
