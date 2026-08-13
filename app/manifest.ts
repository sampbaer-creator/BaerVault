import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "BearVault",
    short_name: "BearVault",
    description: "A calm, shared home for your household finances.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8f7f2",
    theme_color: "#000080",
    lang: "en-US",
    dir: "ltr",
    categories: ["finance", "productivity"],
    prefer_related_applications: false,
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
