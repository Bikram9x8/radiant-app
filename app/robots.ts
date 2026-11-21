import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// robots.txt: every crawler may read the whole site; the sitemap lists the public pages
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
