"use client";

import { Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { MetricGrid, ProjectAnalytics, ProjectList, ProjectProgress, ReminderCard, TeamCollaboration, TimeTracker } from "./Cards";
import { Button } from "@/components/ui/Primitives";

export function DashboardExperience() {
  const router = useRouter();
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  return <main className="dashboard-main">
    <section className="dashboard-intro reveal"><div><h1>Dashboard</h1><p>Monitor today&apos;s attendance, classes and teaching activity.</p></div><div className="intro-actions"><Button className="button-primary" onClick={() => router.push("/admin/students")}><Plus /> Add Student</Button><input ref={fileRef} type="file" accept=".csv" hidden onChange={(event) => event.target.files?.[0] && notify(`Selected ${event.target.files[0].name}`)} /><Button className="button-secondary" onClick={() => fileRef.current?.click()}><Upload /> Import Register</Button></div></section>
    <MetricGrid />
    <section className="dashboard-board"><ProjectAnalytics /><ReminderCard /><ProjectList onNew={() => router.push("/admin/calendar")} /><TeamCollaboration onAdd={() => router.push("/admin/teachers")} /><ProjectProgress /><TimeTracker /></section>
    <div className="toast" data-open={Boolean(toast)} role="status">{toast}</div>
  </main>;
}
