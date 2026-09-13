"use client";
import type { UserRole, UserAccount, XaadirDataState } from "./models";
import { xaadirSeedData } from "./mock-data";

export type DemoSession = { userId: string; email: string; name: string; role: UserRole; teacherId?: string };
const KEY = "xaadir-demo-session";
function accountData(): XaadirDataState {
  const raw = window.localStorage.getItem("xaadir-data");
  return raw ? { ...xaadirSeedData, ...JSON.parse(raw) } : xaadirSeedData;
}
export function readAccounts(): UserAccount[] {
  try { return accountData().accounts; } catch { return []; }
}
export class AuthenticationError extends Error {
  readonly code = "ACCOUNT_INACTIVE";
  constructor() { super("Your account is currently inactive. Please contact your school administrator."); }
}
export function authenticate(email: string, password: string): DemoSession | null {
  const normalized = email.trim().toLowerCase();
  const account = readAccounts().find((item) => item.email.toLowerCase() === normalized);
  if (!account || account.password !== password) return null;
  if (account.status === "INACTIVE") throw new AuthenticationError();
  const data = accountData();
  const teacher = data.teachers.find((item) => item.id === account.teacherId);
  const name = teacher?.fullName ?? data.users.find((item) => item.role === account.role && (item.email === account.email || item.id === "user-admin"))?.name ?? account.email;
  return { userId: account.id, email: account.email, name, role: account.role, ...(account.teacherId ? { teacherId: account.teacherId } : {}) };
}
export function readSession(): DemoSession | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    const session = raw ? JSON.parse(raw) as DemoSession : null;
    if (session && !readAccounts().some((account) => account.email === session.email && account.role === session.role && account.teacherId === session.teacherId && account.status === "ACTIVE")) {
      clearSession(); return null;
    }
    return session;
  } catch { return null; }
}
export function writeSession(session: DemoSession) { window.localStorage.setItem(KEY, JSON.stringify(session)); }
export function clearSession() { window.localStorage.removeItem(KEY); }
