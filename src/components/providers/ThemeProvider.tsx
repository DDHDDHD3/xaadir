"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readThemeMode, THEME_KEY, type ThemeMode } from "@/lib/theme";
export type { ThemeMode } from "@/lib/theme";
type ThemeContextValue = { mode: ThemeMode; resolvedTheme: "light" | "dark"; setMode: (mode: ThemeMode) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const apply = useCallback((next: ThemeMode, animate = true) => {
    const resolved = next === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : next;
    const root = document.documentElement;
    if (animate && root.dataset.theme !== resolved) root.setAttribute("data-theme-transition", "");
    root.dataset.theme = resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#101713" : "#f1f2f0");
    setModeState(next);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    // Initial markup is deterministic; the early script already painted the correct palette.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    apply(readThemeMode(), false);
    const sync = (event: StorageEvent) => { if (event.key === THEME_KEY || event.key === null) apply(readThemeMode()); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [apply]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => { if (mode === "system") apply(mode); };
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [mode, apply]);
  useEffect(() => {
    const timer = window.setTimeout(() => document.documentElement.removeAttribute("data-theme-transition"), 200);
    return () => window.clearTimeout(timer);
  }, [resolvedTheme]);
  const setMode = useCallback((next: ThemeMode) => {
    try { localStorage.setItem(THEME_KEY, next); } catch { /* Keep the selection for this open page. */ }
    apply(next);
  }, [apply]);
  const value = useMemo(() => ({ mode, resolvedTheme, setMode }), [mode, resolvedTheme, setMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider.");
  return value;
}

export function ThemePicker() {
  const { mode, setMode } = useTheme();
  return <fieldset className="theme-picker"><legend>Appearance</legend><p>Choose how Xaadir follows your device.</p><div>
    {([["system", "System", "Follow device appearance"], ["light", "Light", "Always use light"], ["dark", "Dark", "Always use dark"]] as const).map(([value, label, detail]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>{label}<span>{detail}</span></button>)}
  </div></fieldset>;
}
