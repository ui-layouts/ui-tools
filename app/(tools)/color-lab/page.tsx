import ClipPathGenerator from "@/components/view/clip-path";
import ColorConverter from "@/components/view/colors";
import { siteConfig } from "@/lib/utils";
import type { Metadata } from "next";
import React, { Suspense } from "react";
export const metadata: Metadata = {
	title:
		"Color Lab – Generate Color Palettes, Convert Codes & Build Shadcn Themes",
	description:
		"Color Lab is your all-in-one color and UI toolkit. Create stunning palettes, convert between HEX, RGB, HSL, and design custom themes with the built-in Shadcn UI Theme Generator – ideal for designers and frontend developers.",
	alternates: {
		canonical: "/color-lab",
	},
	keywords: [
		"Color palette generator",
		"Color converter HEX to RGB",
		"Color tools for developers",
		"Online color picker",
		"HEX to HSL converter",
		"Generate color schemes",
		"Design tools for UI",
		"Theme generator",
		"StatsCN theme generator",
		"Frontend UI tools",
		"Web design color tool",
		"HSL to HEX",
		"Color lab",
		"Web color utilities",
		"Tailwind color generator",
		"CSS color tools",
		"UI color editor",
		"Free design tools",
		"Color labs online",
		"Ultimate color toolkit",
		// Added for shadcn
		"Shadcn theme generator",
		"Shadcn color generator",
		"Shadcn UI toolkit",
		"Generate shadcn themes",
		"Shadcn color system",
		"Shadcn palette creator",
		"Custom shadcn components",
		"Shadcn theme customization",
		"UI theming with shadcn",
		"Shadcn design system tools",
		"Tailwind + shadcn generator",
	],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: `${siteConfig.url}/color-lab`,
		title: "Color Lab – Play, Pick, Convert & Generate Colors",
		description:
			"Generate palettes, convert HEX, RGB, HSL, and create custom themes. Color Lab is your all-in-one color tool for designers and developers.",
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.colorOgImage, // consider using a new OG image for Color Lab
				width: 1200,
				height: 630,
				alt: `Color Lab by ${siteConfig.name}`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Color Labs – The Ultimate Color Toolkit 🎨🌈",
		description:
			"Pick, convert, and generate perfect colors for your UI. Try the free Color Lab with StatsCN Theme Generator.",
		images: [siteConfig.colorOgImage],
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
				<ColorConverter />
			</Suspense>
		</>
	);
}

export default page;
