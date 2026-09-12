import { Bell, Check, ChevronDown, Mail, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Primitives";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export function Header({ onMenu, name = "Amina Warsame", email = "admin@xaadir.edu", teacher = false }: { onMenu: () => void; name?: string; email?: string; teacher?: boolean }) {
  const router = useRouter(); const { signOut } = useAuth();
  const [panel, setPanel] = useState<"notifications" | "profile" | "search" | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPanel("search"); setTimeout(() => searchRef.current?.focus(), 0); }
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return <header className="topbar">
    <button className="menu-toggle" type="button" aria-label="Open navigation" onClick={onMenu}><Menu /></button>
    <button className="search-control" type="button" onClick={() => setPanel("search")}><Search /><span>{teacher ? "Search classes, students..." : "Search task"}</span><kbd>⌘ K</kbd></button>
    <div className="header-actions">
      <button className="icon-button" type="button" aria-label="Messages"><Mail /></button>
      <div className="popover-wrap"><button className="icon-button" type="button" aria-label="Notifications" aria-expanded={panel === "notifications"} onClick={() => setPanel(panel === "notifications" ? null : "notifications")}><Bell /></button>
        <div className="popover notification-popover" data-open={panel === "notifications"}><strong>Notifications</strong><span><Check size={16} /> You are all caught up.</span></div>
      </div>
      <div className="popover-wrap profile-wrap"><button className="profile-control" type="button" aria-expanded={panel === "profile"} onClick={() => setPanel(panel === "profile" ? null : "profile")}><Avatar name={name} colors={["#e7a6ad", "#38281f"]} large /><span><strong>{name}</strong><small>{email}</small></span><ChevronDown size={16} /></button>
        <div className="popover profile-popover" data-open={panel === "profile"}><strong>{name}</strong><span>{name.includes("Ahmed") ? "Teacher" : "Administrator"}</span><span>{email}</span>{!name.includes("Ahmed") && <><button type="button" onClick={() => router.push("/admin/settings")}>View profile</button><button type="button" onClick={() => router.push("/admin/settings")}>Account settings</button></>}<button type="button" onClick={() => { signOut(); router.replace("/login"); }}>Logout</button></div>
      </div>
    </div>
    <div className="dialog-backdrop" data-open={panel === "search"} onMouseDown={() => setPanel(null)}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search workspace" onMouseDown={(event) => event.stopPropagation()}><Search /><input ref={searchRef} placeholder={teacher ? "Search your classes, students, reports..." : "Search task"} aria-label="Search workspace" /><button type="button" aria-label="Close search" onClick={() => setPanel(null)}><X /></button>{teacher ? <div className="command-suggestions"><strong>Quick actions</strong><button type="button" onClick={() => router.push("/teacher/attendance")}>Take Attendance</button><button type="button" onClick={() => router.push("/teacher/classes")}>Open My Classes</button><button type="button" onClick={() => router.push("/teacher/reports")}>Generate Monthly Report</button><strong>Shortcuts</strong><button type="button" onClick={() => router.push("/teacher/schedule")}>Today&apos;s Schedule</button></div> : <p>Search projects, people, and tasks.</p>}</div>
    </div>
  </header>;
}
