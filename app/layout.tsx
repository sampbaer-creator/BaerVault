import { ClerkProvider } from "@clerk/nextjs";
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "BearVault", template: "%s | BearVault" },
  description: "A calm, shared home for your household finances.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <ClerkProvider>
          <MantineProvider defaultColorScheme="auto"><PreferencesProvider>{children}</PreferencesProvider></MantineProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
