import HomeIndex from "@/components/view/home";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "UI Tools for Designers and Developers",
	description:
		"Free open-source UI tools for developers and designers: generate shadows, clip-paths, mesh gradients, color palettes, backgrounds, and SVG line drawings.",
	alternates: {
		canonical: "/",
	},
};

export default function Home() {
	const webpageSchema = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "UI Tools for Designers and Developers",
		url: siteConfig.url,
		description:
			"Free open-source UI tools for developers and designers: generate shadows, clip-paths, mesh gradients, color palettes, backgrounds, and SVG line drawings.",
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Home",
					item: siteConfig.url,
				},
			],
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be emitted as raw script content in server HTML.
				dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
			/>
			<HomeIndex />
		</>
	);
}
