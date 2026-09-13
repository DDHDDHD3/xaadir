import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "./globals.css";
import type { Viewport } from "next";
import { initializeTheme } from "@/lib/theme";
import { XaadirDataProvider } from "@/components/providers/XaadirDataProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata = {
  title: "Xaadir School Management",
  description: "Xaadir school attendance and administration",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content",
  themeColor: "#f1f2f0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(${initializeTheme.toString()})()` }} /></head><body><ThemeProvider><AuthProvider><XaadirDataProvider>{children}</XaadirDataProvider></AuthProvider></ThemeProvider></body></html>;
}
