import { TOOL_SCHEMA_DETAILS, TOOL_SLUGS, siteConfig } from "@/lib/utils";

export default function schema() {
	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "UI Tools",
		url: siteConfig.url,
		logo: `${siteConfig.url}/icon-512x512.png`,
		description:
			"Free collection of modern web design tools for developers and designers",
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "customer service",
			availableLanguage: "English",
		},
		sameAs: ["https://twitter.com/naymur_dev", "https://github.com/naymurdev"],
	};

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "UI Tools",
		url: siteConfig.url,
		description:
			"Free collection of modern web design tools. Generate CSS backgrounds, gradients, shadows, colors, and more.",
	};

	const softwareApplicationSchema = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "UI Tools",
		url: siteConfig.url,
		description:
			"Free collection of modern web design tools for developers and designers",
		applicationCategory: "DesignApplication",
		operatingSystem: "Web Browser",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		featureList: [
			"CSS Background Generator",
			"SVG Clip-Path Generator",
			"Color Palette Generator",
			"Mesh Gradient Creator",
			"CSS Shadow Generator",
			"SVG Line Drawing Tool",
		],
	};

	const toolsSchema = TOOL_SLUGS.map((slug) => ({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: TOOL_SCHEMA_DETAILS[slug].name,
		url: `${siteConfig.url}/${slug}`,
		description: TOOL_SCHEMA_DETAILS[slug].description,
		applicationCategory: "DesignApplication",
		operatingSystem: "Web Browser",
	}));

	// Return as JSON-LD script content
	return JSON.stringify([
		organizationSchema,
		websiteSchema,
		softwareApplicationSchema,
		...toolsSchema,
	]);
}
