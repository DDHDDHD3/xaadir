export function XaadirSymbol({ size = 38 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2.6" />
    <path d="M12 11.5 20 20l8-8.5M12 28.5 20 20l4.6 4.8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="29" cy="28.8" r="4.2" fill="currentColor" />
    <path d="m27.3 28.8 1.2 1.2 2.3-2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function XaadirLogo({ compact = false }: { compact?: boolean }) {
  return <span className="xaadir-logo"><XaadirSymbol size={compact ? 30 : 39} />{!compact && <strong>Xaadir</strong>}</span>;
}
