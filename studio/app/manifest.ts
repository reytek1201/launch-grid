import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LaunchGrid Studio",
    short_name: "LaunchGrid",
    description: "Custom websites for bands and restaurants, with a back office you run from your phone.",
    start_url: "/",
    display: "browser",
    background_color: "#F7F5EF",
    theme_color: "#F7F5EF",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any" }, { src: "/apple-icon", type: "image/png", sizes: "180x180" }],
  };
}
