"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/lib/models";
export function RouteGuard({ role, children }: { role: UserRole; children: React.ReactNode }) { const {session,ready}=useAuth(); const router=useRouter(); const pathname=usePathname(); useEffect(()=>{ if(!ready)return; if(!session){router.replace(`/login?next=${encodeURIComponent(pathname)}`);return;} if(session.role!==role){router.replace(session.role === "ADMIN" ? "/admin" : "/teacher");}},[ready,session,role,router,pathname]); if(!ready || !session || session.role!==role) return <div className="route-loading" aria-label="Loading Xaadir" />; return <>{children}</>; }
