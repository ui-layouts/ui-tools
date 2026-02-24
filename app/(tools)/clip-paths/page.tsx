import ClipPathGenerator from "@/components/view/clip-path";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";
import React from "react";
import { ToolPlaygroundShell } from "@/components/common/tool-playground-shell";
export const metadata: Metadata = {
	title: "SVG Clip-Path Generator",
	description:
		"Create and customize SVG clip-path shapes for your website with ease. Free tool for web designers and developers.",
	keywords: [
		"SVG clip-path generator",
		"SVG editor",
		"SVG clip-path editor",
		"clip-path generator",
		"clip-path editor online",
		"CSS clip-path",
		"online SVG editor",
		"live SVG preview",
		"custom clip-path shapes",
		"SVG path generator",
		"clip-path UI design",
		"SVG tools for web design",
		"frontend UI tools",
		"design tools for developers",
		"modern UI generators",
	],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${siteConfig.url}/clip-paths`,
		title: "SVG Clip-Path Generator",
		description:
			"Create and customize SVG clip-path shapes for your website with ease. Free tool for web designers and developers.",
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.clipPathOgImage,
				width: 1200,
				height: 630,
				alt: siteConfig.name,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "SVG Clip-Path Generator",
		description:
			"Create and customize SVG clip-path shapes for your website with ease. Free tool for web designers and developers.",
		images: [siteConfig.clipPathOgImage],
		creator: "@naymur_dev",
	},
};

function page() {
	return (
		<ToolPlaygroundShell
			title="Clip-path Generator"
			description="Create polygon, circle, ellipse, and inset clip-path shapes."
			examples={["Hexagon", "Blob", "Ticket", "Diamond"]}
			docs="Use Playground for live editing, Examples to load quick presets, and Export to copy production-ready output."
			exportLabel="CSS"
			exportCode={`/* export output from active tool */`}
		>
			<ClipPathGenerator />
		</ToolPlaygroundShell>
	);
}

export default page;