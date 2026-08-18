import { ClerkProvider } from "@clerk/nextjs";
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import "./redesign.css";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { MobileViewportRuntime } from "@/components/shared/MobileViewportRuntime";
import { PwaRuntime } from "@/components/shared/PwaRuntime";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const preferenceBootstrap = `(function(){try{var root=document.documentElement;var saved=JSON.parse(localStorage.getItem("bearvault-preferences")||"{}");var choice=["light","dark","system"].includes(saved.theme)?saved.theme:"system";var theme=choice==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":choice==="dark"?"dark":"light";root.dataset.theme=theme;root.style.colorScheme=theme;delete root.dataset.palette;delete root.dataset.density;delete root.dataset.motion;}catch(e){var dark=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.style.colorScheme=dark?"dark":"light";}})();`;

export const metadata: Metadata = {
  title: { default: "BearVault", template: "%s | BearVault" },
  description: "A calm, shared home for your household finances.",
  applicationName: "BearVault",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "BearVault" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0879dd",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Script id="bearvault-preferences" strategy="beforeInteractive">
          {preferenceBootstrap}
        </Script>
        <MobileViewportRuntime />
        <PwaRuntime />
        <ClerkProvider>
          <MantineProvider defaultColorScheme="auto"><PreferencesProvider>{children}</PreferencesProvider></MantineProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
