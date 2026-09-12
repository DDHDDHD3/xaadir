import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "./globals.css";
import { XaadirDataProvider } from "@/components/providers/XaadirDataProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata = {
  title: "Xaadir School Management",
  description: "Xaadir school attendance and administration",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Browser extensions may inject attributes into <html> before React hydration.
  return <html lang="en" suppressHydrationWarning><body><AuthProvider><XaadirDataProvider>{children}</XaadirDataProvider></AuthProvider></body></html>;
}
