"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import styles from "./admin.module.css";

export { styles };

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </header>
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={styles.primaryButton} {...props}>{children}</button>;
}

export function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={styles.secondaryButton} {...props}>{children}</button>;
}

export function QuietButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={styles.quietButton} {...props}>{children}</button>;
}

export function SummaryGrid({ children }: { children: ReactNode }) {
  return <section className={styles.summaryGrid}>{children}</section>;
}

export function SummaryCard({ label, value, note, accent = false, icon }: { label: string; value: string | number; note: string; accent?: boolean; icon?: ReactNode }) {
  return (
    <article className={`${styles.summaryCard} ${accent ? styles.summaryAccent : ""}`}>
      <div className={styles.summaryTop}><span>{label}</span>{icon}</div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className={styles.searchField}>
      <Search aria-hidden="true" />
      <input aria-label={placeholder} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function SelectField({ value, onChange, label, children }: { value: string; onChange: (value: string) => void; label: string; children: ReactNode }) {
  return (
    <label className={styles.selectField}>
      <span className={styles.srOnly}>{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
      <ChevronDown aria-hidden="true" />
    </label>
  );
}

export function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`${styles.field} ${wide ? styles.fieldWide : ""}`}><span>{label}</span>{children}</label>;
}

export function StatusPill({ children, tone }: { children: ReactNode; tone?: "positive" | "warning" | "danger" | "neutral" }) {
  return <span className={`${styles.statusPill} ${styles[`tone${(tone ?? "neutral").replace(/^./, (value) => value.toUpperCase())}`]}`}>{children}</span>;
}

export function InitialAvatar({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
  let hue = 134;
  for (const character of name) hue = (hue + character.charCodeAt(0) * 7) % 360;
  return <span className={`${styles.avatar} ${large ? styles.avatarLarge : ""}`} style={{ "--avatarHue": hue } as React.CSSProperties}>{initials}</span>;
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className={styles.emptyState}><span><Search /></span><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

export function Drawer({ open, title, subtitle, children, onClose, footer }: { open: boolean; title: string; subtitle?: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className={styles.drawer} role="dialog" aria-modal="true" aria-label={title}>
        <header><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button type="button" onClick={onClose} aria-label="Close"><X /></button></header>
        <div className={styles.drawerBody}>{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  );
}

export function ConfirmDialog({ open, title, detail, confirmLabel = "Remove", onCancel, onConfirm }: { open: boolean; title: string; detail: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className={`${styles.overlay} ${styles.centeredOverlay}`} role="presentation">
      <section className={styles.confirmDialog} role="alertdialog" aria-modal="true" aria-label={title}>
        <span className={styles.dangerIcon}><AlertCircle /></span>
        <h2>{title}</h2><p>{detail}</p>
        <div><SecondaryButton onClick={onCancel}>Cancel</SecondaryButton><button type="button" className={styles.dangerButton} onClick={onConfirm}>{confirmLabel}</button></div>
      </section>
    </div>
  );
}

export function FormShell({ id, children, onSubmit }: { id?: string; children: ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form id={id} className={styles.form} onSubmit={onSubmit}>{children}</form>;
}

export function FormSection({ title, detail, children }: { title: string; detail?: string; children: ReactNode }) {
  return <section className={styles.formSection}><div className={styles.formSectionHeading}><h3>{title}</h3>{detail && <p>{detail}</p>}</div><div className={styles.formGrid}>{children}</div></section>;
}

export function OperationNotice({ state }: { state?: { ok: boolean; message: string } | null }) {
  if (!state) return null;
  return <div className={`${styles.notice} ${state.ok ? styles.noticeSuccess : styles.noticeError}`}>{state.ok ? <CheckCircle2 /> : <AlertCircle />}{state.message}</div>;
}

export function LoadingState({ label = "Loading school records" }: { label?: string }) {
  return <div className={styles.loadingState}><LoaderCircle /> <span>{label}</span></div>;
}

export function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}
