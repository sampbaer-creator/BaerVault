import { ClerkProvider } from "@clerk/nextjs";
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { MobileViewportRuntime } from "@/components/shared/MobileViewportRuntime";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

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
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MobileViewportRuntime />
        <ClerkProvider>
          <MantineProvider defaultColorScheme="auto"><PreferencesProvider>{children}</PreferencesProvider></MantineProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
