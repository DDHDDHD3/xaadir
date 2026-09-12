"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, readSession, writeSession, type DemoSession } from "@/lib/auth";
const AuthContext = createContext<{ session: DemoSession | null; ready: boolean; signIn: (session: DemoSession) => void; signOut: () => void }>({ session: null, ready: false, signIn: () => {}, signOut: () => {} });
export function AuthProvider({ children }: { children: React.ReactNode }) { const [session,setSession]=useState<DemoSession|null>(null); const [ready,setReady]=useState(false); useEffect(()=>{ // localStorage is intentionally read after hydration to keep SSR deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(readSession()); setReady(true);
  },[]); const value=useMemo(()=>({session,ready,signIn:(next:DemoSession)=>{writeSession(next);setSession(next)},signOut:()=>{clearSession();setSession(null)}}),[session,ready]); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export function useAuth() { return useContext(AuthContext); }
