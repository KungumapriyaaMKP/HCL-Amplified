import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://questlearn.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/community", "/leaderboard", "/login", "/signup", "/resources"],
      disallow: ["/api/", "/goals/*/modules/*/proctored"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
