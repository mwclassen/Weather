import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Weather Forecast",
    short_name: "Forecast",
    description: "Weather forecast powered by OpenWeatherMap",
    start_url: "/",
    display: "standalone",
    background_color: "#6CB4EE",
    theme_color: "#00d4aa",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
