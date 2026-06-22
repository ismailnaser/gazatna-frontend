import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منصة غزتنا — مدرسة غزتنا النموذجية",
    short_name: "غزتنا",
    description:
      "منصة تعليمية رقمية لمدرسة غزتنا — متابعة العلامات، الواجبات، الجداول، والشهادات.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#424cf3",
    dir: "rtl",
    lang: "ar",
    categories: ["education"],
    icons: [
      {
        src: "/images/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/pwa-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
