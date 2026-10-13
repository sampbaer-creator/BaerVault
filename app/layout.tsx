import { ClerkProvider } from "@clerk/nextjs";
import "@mantine/core/styles.css";

import { ColorSchemeScript } from "@mantine/core";
import { UiProvider } from "@/components/preferences/UiProvider";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";

import "./globals.css";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { MobileViewportRuntime } from "@/components/shared/MobileViewportRuntime";
import { PwaRuntime } from "@/components/shared/PwaRuntime";

const manrope = localFont({ src: "./fonts/Manrope-Variable.ttf", variable: "--font-manrope", weight: "200 800", display: "swap" });

const preferenceBootstrap = `(function(){try{var root=document.documentElement;var saved=JSON.parse(localStorage.getItem("bearvault-preferences")||"{}");var choice=["light","dark","system"].includes(saved.theme)?saved.theme:"system";var theme=choice==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":choice==="dark"?"dark":"light";root.dataset.theme=theme;root.style.colorScheme=theme;root.dataset.transparency=saved.opaqueNavigation===true?"opaque":"auto";delete root.dataset.palette;delete root.dataset.density;delete root.dataset.motion;}catch(e){var dark=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.style.colorScheme=dark?"dark":"light";}})();`;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baervault.com";
const description =
  "BearVault brings spending, accounts, budgets, goals, and investments into one calm, shared workspace for your whole household.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "BearVault: Household finances, clearly organized", template: "%s | BearVault" },
  description,
  applicationName: "BearVault",
  keywords: [
    "household budgeting app",
    "shared finance app",
    "family budget planner",
    "net worth tracker",
    "budgeting for couples",
    "personal finance dashboard",
  ],
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "BearVault" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "BearVault",
    title: "BearVault: Household finances, clearly organized",
    description,
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "BearVault" }],
  },
  twitter: {
    card: "summary",
    title: "BearVault: Household finances, clearly organized",
    description,
    images: ["/icon.png"],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1420" },
  ],
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
            fontFamily: "var(--font-body)",
            borderRadius: "0.6875rem",
          } }}
          localization={{
            signIn: { start: { title: "Sign in to BearVault" } },
            signUp: { start: { title: "Create your BearVault account" } },
          }}
        >
          <PreferencesProvider><UiProvider>{children}</UiProvider></PreferencesProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
