import type { MetadataRoute } from "next";
import { APP_THEME_BACKGROUND_COLOR, APP_THEME_COLOR } from "@nasi/theme";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nasi Store",
    short_name: "Nasi Store",
    description: "Nasi Store ecommerce platform",
    start_url: "/",
    display: "standalone",
    background_color: APP_THEME_BACKGROUND_COLOR,
    theme_color: APP_THEME_COLOR,
    orientation: "portrait",
    icons: [
      {
        src: "/appicon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/appicon-maskable-light.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
