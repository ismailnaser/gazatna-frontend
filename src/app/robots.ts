import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/teacher", "/parent", "/login", "/api"],
      },
    ],
    sitemap: "https://gzs.edu.ps/sitemap.xml",
  };
}
