import { ShaderGradientGenerator } from "@/components/view/mesh-gradient";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
	title: "Mesh-Gradient Generator",
	description:
		"Create beautiful mesh gradients and fluid color transitions for your web designs. Perfect for modern UI and backgrounds.",
	alternates: {
		canonical: "/mesh-gradients",
	},
	keywords: [
		"mesh gradient",
		"CSS mesh gradient generator",
		"r3f mesh gradient",
		"react-three-fiber gradient",
		"fluid gradient background",
		"blended gradient",
		"soft UI gradient",
		"web gradient design",
		"mesh gradient tool",
		"SVG mesh gradient",
		"interactive gradient editor",
		"UI background gradient",
		"gradient generator online",
		"modern web design tools",
		"creative gradients for developers",
	],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${siteConfig.url}/mesh-gradients`,
		title: "Mesh-Gradient Generator",
		description:
			"Create beautiful mesh gradients and fluid color transitions for your web designs. Perfect for modern UI and backgrounds.",
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.gradientOgImage,
				width: 1200,
				height: 630,
				alt: siteConfig.name,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Mesh-Gradient Generator",
		description:
			"Create beautiful mesh gradients and fluid color transitions for your web designs. Perfect for modern UI and backgrounds.",
		images: [siteConfig.gradientOgImage],
		creator: "@naymur_dev",
	},
};

function page() {
	return (
		<>
			<ShaderGradientGenerator />
		</>
	);
}

export default page;
