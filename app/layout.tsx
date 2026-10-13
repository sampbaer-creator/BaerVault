import { ClerkProvider } from "@clerk/nextjs";
import "@mantine/core/styles.css";

import { ColorSchemeScript } from "@mantine/core";
import { UiProvider } from "@/components/preferences/UiProvider";
import type { Metadata, Viewport } from "next";
import Script from "next/script";

import "./globals.css";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { MobileViewportRuntime } from "@/components/shared/MobileViewportRuntime";
import { PwaRuntime } from "@/components/shared/PwaRuntime";

const preferenceBootstrap = `(function(){try{var root=document.documentElement;var saved=JSON.parse(localStorage.getItem("bearvault-preferences")||"{}");var choice=["light","dark","system"].includes(saved.theme)?saved.theme:"system";var theme=choice==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":choice==="dark"?"dark":"light";root.dataset.theme=theme;root.style.colorScheme=theme;delete root.dataset.palette;delete root.dataset.density;delete root.dataset.motion;}catch(e){var dark=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.style.colorScheme=dark?"dark":"light";}})();`;

export const metadata: Metadata = {
  title: { default: "BaerVault", template: "%s | BaerVault" },
  description: "A calm, shared home for your household finances.",
  applicationName: "BaerVault",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "BaerVault" },
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Script id="bearvault-preferences" strategy="beforeInteractive">
          {preferenceBootstrap}
        </Script>
        <MobileViewportRuntime />
        <PwaRuntime />
        <ClerkProvider
          appearance={{ variables: {
            colorPrimary: "var(--app-accent)",
            colorPrimaryForeground: "var(--app-on-accent)",
            colorBackground: "var(--app-surface)",
            colorForeground: "var(--app-text-strong)",
            colorMutedForeground: "var(--app-text-muted)",
            colorNeutral: "var(--app-text-strong)",
            colorInput: "var(--app-surface-raised)",
            colorInputForeground: "var(--app-text-strong)",
            colorBorder: "var(--app-border)",
            colorDanger: "var(--app-danger)",
            fontFamily: "var(--font-system)",
            borderRadius: "0.6875rem",
          } }}
          localization={{
            signIn: { start: { title: "Sign in to BaerVault" } },
            signUp: { start: { title: "Create your BaerVault account" } },
          }}
        >
          <UiProvider><PreferencesProvider>{children}</PreferencesProvider></UiProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
