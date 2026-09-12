"use client";

import { BarChart3, CalendarDays, CircleHelp, ClipboardCheck, Clock3, Grid2X2, LogOut, Settings, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { XaadirLogo } from "@/components/brand/XaadirLogo";
import type { UserRole } from "@/lib/models";

type NavItem = readonly [string, string, typeof Grid2X2];
const adminPrimary: readonly NavItem[] = [
  ["Dashboard", "/admin", Grid2X2], ["Teachers", "/admin/teachers", UsersRound], ["Students", "/admin/students", UserRound],
  ["Classes", "/admin/classes", ClipboardCheck], ["Calendar", "/admin/calendar", CalendarDays], ["Analytics", "/admin/analytics", BarChart3],
];
const teacherPrimary: readonly NavItem[] = [
  ["Dashboard", "/teacher", Grid2X2], ["My Classes", "/teacher/classes", ClipboardCheck], ["Attendance", "/teacher/attendance", UsersRound],
  ["Schedule", "/teacher/schedule", CalendarDays], ["My Attendance", "/teacher/my-attendance", Clock3], ["Monthly Reports", "/teacher/reports", BarChart3],
];

export function Sidebar({ role, open, onClose }: { role: UserRole; open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const primary = role === "ADMIN" ? adminPrimary : teacherPrimary;
  const general: readonly NavItem[] = role === "ADMIN"
    ? [["Settings", "/admin/settings", Settings], ["Help", "/admin/help", CircleHelp], ["Logout", "/logout", LogOut]]
    : [["Help", "/teacher/help", CircleHelp], ["Logout", "/logout", LogOut]];
  const renderLinks = (items: readonly NavItem[]) => items.map(([label, href, Icon]) => {
    const active = pathname === href || (href !== "/admin" && href !== "/teacher" && pathname.startsWith(`${href}/`));
    return <Link key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={onClose}>{active && <span className="active-indicator" aria-hidden="true" />}<Icon /><span>{label}</span></Link>;
  });
  return <>
    <button className={`drawer-scrim ${open ? "is-open" : ""}`} aria-label="Close menu" onClick={onClose} />
    <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label={`${role === "ADMIN" ? "Administrator" : "Teacher"} navigation`}>
      <Link href={role === "ADMIN" ? "/admin" : "/teacher"} className="brand" onClick={onClose}><XaadirLogo /></Link>
      <nav className="nav-groups">
        <p className="nav-caption">MENU</p>
        <div className="nav-list">{renderLinks(primary)}</div>
        <p className="nav-caption general-label">GENERAL</p><div className="nav-list">{renderLinks(general)}</div>
      </nav>
    </aside>
  </>;
}
