import BackgroundSnippetsGenerator from "@/components/view/background-snippets";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
	title: "Background Snippets Generator",
	description:
		"Generate beautiful CSS background patterns, gradients, textures, and snippets for your website. Perfect for modern web design and UI backgrounds.",
	alternates: {
		canonical: "/background-snippets",
	},
	keywords: [
		"CSS background generator",
		"Background pattern generator",
		"CSS background snippets",
		"Web background patterns",
		"CSS texture generator",
		"Background design tool",
		"Modern CSS backgrounds",
		"Gradient background generator",
		"Pattern background CSS",
		"Background snippet creator",
		"UI background generator",
		"Web design backgrounds",
		"CSS background patterns",
		"Free background generator",
		"Background code generator",
		"CSS background tools",
		"Responsive backgrounds",
		"Animated backgrounds",
		"Geometric patterns",
		"CSS background presets",
		"Background generator online",
	],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${siteConfig.url}/background-snippets`,
		title: "Background Snippets Generator – CSS Background Patterns & Textures",
		description:
			"Generate beautiful CSS background patterns, gradients, textures, and snippets for your website. Perfect for modern web design and UI backgrounds.",
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.bgSnippetsOgImage,
				width: 1200,
				height: 630,
				alt: siteConfig.name,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Background Snippets Generator – CSS Background Patterns 🎨",
		description:
			"Generate beautiful CSS background patterns, gradients, and textures. Free tool for modern web design and UI backgrounds.",
		images: [siteConfig.bgSnippetsOgImage],
		creator: "@naymur_dev",
	},
};
function page() {
	return (
		<>
			<BackgroundSnippetsGenerator />
		</>
	);
}

export default page;
