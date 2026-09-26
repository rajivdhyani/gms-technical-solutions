import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing here is secret, but there is no reason to spend crawl
        // budget on the admin panel or the enquiry endpoint.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
