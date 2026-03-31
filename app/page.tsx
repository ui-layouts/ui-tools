import HomeIndex from "@/components/view/home";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
	title: "UI Tools for Designers and Developers",
	description:
		"Free open-source UI tools for developers and designers: generate shadows, clip-paths, mesh gradients, color palettes, backgrounds, and SVG line drawings.",
	alternates: {
		canonical: "/",
	},
};

export default function Home() {
	const websiteSchema = {
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

	const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: [
			{
				"@type": "Question",
				name: "Are these UI tools free to use?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Yes. UI Tools is free and open-source for designers and developers.",
				},
			},
			{
				"@type": "Question",
				name: "Which tools are available?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "You can use Shadow Generator, SVG Clip-Path Generator, Mesh Gradient Creator, Background Snippets, Color Lab, and SVG Line Draw.",
				},
			},
		],
	};

	return (
		<>
			<Script id="homepage-schema" type="application/ld+json">
				{JSON.stringify([websiteSchema, faqSchema])}
			</Script>
			<HomeIndex />
		</>
	);
}
