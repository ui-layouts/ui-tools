import { TOOL_SLUGS, siteConfig } from "@/lib/utils";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: siteConfig.url,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		...TOOL_SLUGS.map((tool) => ({
			url: `${siteConfig.url}/${tool}`,
			lastModified: new Date(),
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
	];
}
