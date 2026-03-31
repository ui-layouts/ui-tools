import ShadowGenerator from "@/components/view/shadow";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
	title: "Shadows Generator",
	description:
		"Generate beautiful CSS and Tailwind CSS v3/v4 box-shadows and text-shadows. Perfect for modern UI, glassmorphism, and soft design systems.",
	alternates: {
		canonical: "/shadows",
	},
	keywords: [
		"CSS shadows generator",
		"box-shadow generator",
		"text-shadow generator",
		"tailwind shadow generator",
		"tailwindcss v3 shadows",
		"tailwindcss v4 box shadows",
		"tailwind shadow editor",
		"tailwind drop shadow",
		"soft UI shadows",
		"glassmorphism shadow",
		"neumorphism shadows",
		"CSS box shadow editor",
		"text-shadow online tool",
		"modern UI shadows",
		"frontend UI tools",
		"developer design tools",
	],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${siteConfig.url}/shadows`,
		title: "Shadows Generator",
		description:
			"Generate beautiful CSS and Tailwind CSS v3/v4 box-shadows and text-shadows. Perfect for modern UI, glassmorphism, and soft design systems.",
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.shadowOgImage,
				width: 1200,
				height: 630,
				alt: siteConfig.name,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Shadows Generator",
		description:
			"Generate beautiful CSS and Tailwind CSS v3/v4 box-shadows and text-shadows. Perfect for modern UI, glassmorphism, and soft design systems.",
		images: [siteConfig.shadowOgImage],
		creator: "@naymur_dev",
	},
};

function page() {
	return (
		<>
			<ShadowGenerator />
		</>
	);
}

export default page;
