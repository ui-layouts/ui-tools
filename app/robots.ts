import { siteConfig } from "@/lib/utils";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/", "/admin/"],
		},
		sitemap: `${siteConfig.url}/sitemap.xml`,
	};
}
