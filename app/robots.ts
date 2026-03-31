import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = "https://tools.ui-layouts.com";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/", "/admin/", "/example"],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
