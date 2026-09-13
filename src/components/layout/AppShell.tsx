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
  const { state, setActor } = useXaadirData(); const { session } = useAuth();
  useEffect(() => { setActor(isAdmin ? mockActors.admin : { userId: session?.userId ?? "", schoolId: state.school.id, role: "TEACHER", teacherId: session?.teacherId }); }, [isAdmin, setActor, session, state.school.id]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      if (viewport && viewport.scale === 1) {
        document.documentElement.style.setProperty("--visible-height", `${viewport.height}px`);
        document.documentElement.style.setProperty("--visible-top", `${viewport.offsetTop}px`);
      }
    };
    update(); viewport?.addEventListener("resize", update); viewport?.addEventListener("scroll", update);
    return () => { viewport?.removeEventListener("resize", update); viewport?.removeEventListener("scroll", update); };
  }, []);
  const currentTeacher = state.teachers.find((teacher) => teacher.id === session?.teacherId); const admin = state.adminProfile;
  return <div className={`dashboard-shell app-shell role-${role.toLowerCase()}`} data-app-root>
    <Sidebar role={role} open={drawer} onClose={() => setDrawer(false)} />
    <div className="main-column">
      <Header onMenu={() => setDrawer(true)} teacher={!isAdmin} profileImage={currentTeacher?.profileImage ?? (isAdmin ? admin.profileImage : undefined)} name={currentTeacher?.fullName ?? (isAdmin ? admin.fullName : session?.name ?? "Xaadir")} email={isAdmin ? admin.email : session?.email ?? ""} />
      <main className="teacher-main">{children}</main>
    </div>
  </div>;
}
