import SVGLineDrawGenerator from "@/components/view/svg-line-draw";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";
import React, { Suspense } from "react";
export const metadata: Metadata = {
	title: "SVG Line Draw – Sketch & Animate Hand-Drawn Lines for the Web",
	description:
		"SVG Line Draw is your creative playground for sketching hand-drawn lines, arrows, highlights, and animations. Perfect for annotations, web design, and interactive storytelling.",
	alternates: {
		canonical: "/svg-line-draw",
	},
	keywords: [
		"SVG line drawing tool",
		"Hand-drawn SVG lines",
		"Draw SVG online",
		"Sketch SVG paths",
		"SVG path editor",
		"SVG line animator",
		"Web design annotation tool",
		"Free SVG sketch tool",
		"Doodle lines on website",
		"Interactive SVG lines",
		"SVG draw editor",
		"UI sketch lines",
		"Highlight with SVG",
		"Arrows and scribbles SVG",
		"Create SVG annotations",
		"Custom SVG line tool",
		"Drawsvg",
		"Svgdraw tool",
		"Online SVG path drawer",
		"SVG line art generator",
	],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${siteConfig.url}/svg-line-draw`,
		title: "SVG Line Draw – Sketch & Animate Hand-Drawn SVG Lines",
		description:
			"Use SVG Line Draw to add hand-drawn lines, arrows, and animations to your websites. A fun and powerful tool for designers and developers.",
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.lineDrawOgImage, // Replace with relevant OG image
				width: 1200,
				height: 630,
				alt: `SVG Line Draw by ${siteConfig.name}`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "SVG Line Draw – Draw & Animate Lines for Web Design ✏️",
		description:
			"Sketch, animate, and export beautiful SVG lines. Use it for annotations, UI accents, and interactive storytelling on the web.",
		images: [siteConfig.lineDrawOgImage],
		creator: "@naymur_dev",
	},
};
const PageLoading = () => {
	return (
		<>
			<div className="mx-auto h-28 w-[50%] animate-pulse rounded-lg border bg-card-bg" />
			<div className="mx-auto grid w-[70%] grid-cols-3 gap-5 pt-10 md:grid-cols-6">
				{Array.from({ length: 18 }).map((_, index) => (
					<div
						key={index}
						className="h-36 w-full animate-pulse rounded-lg border bg-card-bg"
					/>
				))}
			</div>
		</>
	);
};
function page() {
	return (
		<>
			<Suspense fallback={<PageLoading />}>
				<SVGLineDrawGenerator />
			</Suspense>
		</>
	);
}

export default page;
