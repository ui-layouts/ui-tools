import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://tools.ui-layouts.com";

	const tools = [
		"background-snippets",
		"clip-paths",
		"color-lab",
		"mesh-gradients",
		"shadows",
		"svg-line-draw",
	];

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		...tools.map((tool) => ({
			url: `${baseUrl}/${tool}`,
			lastModified: new Date(),
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
	];
}
