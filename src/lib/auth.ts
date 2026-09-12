"use client";
import type { UserRole } from "./models";
export type DemoSession = { email: string; name: string; role: UserRole; teacherId?: string };
export const DEMO_USERS = [
  { email: "admin.xaadir.demo@gmail.com", password: "XaadirAdmin#2026", name: "Xaadir School Admin", role: "ADMIN" as const },
  { email: "teacher.xaadir.demo@gmail.com", password: "XaadirTeacher#2026", name: "Ahmed Hassan", role: "TEACHER" as const, teacherId: "teacher-ahmed" },
];
const KEY = "xaadir-demo-session";
export function authenticate(email: string, password: string): DemoSession | null { const user = DEMO_USERS.find((item) => item.email === email.trim().toLowerCase() && item.password === password); if (!user) return null; return { email: user.email, name: user.name, role: user.role, ...(user.teacherId ? { teacherId: user.teacherId } : {}) }; }
export function readSession(): DemoSession | null { try { const raw = window.localStorage.getItem(KEY); return raw ? JSON.parse(raw) as DemoSession : null; } catch { return null; } }
export function writeSession(session: DemoSession) { window.localStorage.setItem(KEY, JSON.stringify(session)); }
export function clearSession() { window.localStorage.removeItem(KEY); }
