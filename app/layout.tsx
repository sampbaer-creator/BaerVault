import { ClerkProvider } from "@clerk/nextjs";
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { MobileViewportRuntime } from "@/components/shared/MobileViewportRuntime";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const preferenceBootstrap = `(function(){try{var root=document.documentElement;var defaults={theme:"system",accent:"navy",palette:"vault",density:"comfortable",reducedMotion:false};var saved=localStorage.getItem("bearvault-preferences");var value=saved?Object.assign({},defaults,JSON.parse(saved)):defaults;var system=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";root.dataset.theme=value.theme==="system"?system:value.theme;root.dataset.accent=value.accent;root.dataset.palette=value.palette;root.dataset.density=value.density;root.dataset.motion=value.reducedMotion?"reduced":"full";}catch(e){}})();`;

export const metadata: Metadata = {
  title: { default: "BearVault", template: "%s | BearVault" },
  description: "A calm, shared home for your household finances.",
  applicationName: "BearVault",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BearVault" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f8f7f2" }, { media: "(prefers-color-scheme: dark)", color: "#03031c" }],
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
        <ClerkProvider>
          <MantineProvider defaultColorScheme="auto"><PreferencesProvider>{children}</PreferencesProvider></MantineProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
