import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "BearVault",
    short_name: "BearVault",
    description: "A calm, shared home for your household finances.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f7f8fa",
    theme_color: "#0879dd",
    lang: "en-US",
    dir: "ltr",
    categories: ["finance", "productivity"],
    prefer_related_applications: false,
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
