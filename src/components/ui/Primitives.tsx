import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Button({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`button ${className}`} {...props}>{children}</button>;
}

export function Avatar({ name, colors, large = false }: { name: string; colors: [string, string]; large?: boolean }) {
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return <span className={`avatar ${large ? "avatar-large" : ""}`} style={{ "--avatar-bg": colors[0], "--avatar-hair": colors[1] } as React.CSSProperties} aria-hidden="true">
    <span className="avatar-hair" />
    <span className="avatar-face">{initials}</span>
  </span>;
}

export function StatusBadge({ children }: { children: ReactNode }) {
  const tone = String(children).toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${tone}`}>{children}</span>;
}
