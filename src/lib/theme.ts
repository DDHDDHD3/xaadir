export type ThemeMode = "system" | "light" | "dark";
export const THEME_KEY = "xaadir-theme";
export function readThemeMode(): ThemeMode {
  try {
    const mode = localStorage.getItem("xaadir-theme");
    if (mode === "light" || mode === "dark") return mode;
  } catch { /* System appearance also works when browser storage is blocked. */ }
  return "system";
}

// Self-contained so the exact same resolution runs before first paint and in React.
export function initializeTheme() {
  let mode = "system";
  try {
    const stored = localStorage.getItem("xaadir-theme");
    if (stored === "light" || stored === "dark") mode = stored;
  } catch { /* Follow the device without requiring storage. */ }
  const resolved = mode === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : mode;
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#101713" : "#f1f2f0");
}
