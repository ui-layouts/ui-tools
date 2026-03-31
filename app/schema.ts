export default function schema() {
	const baseUrl = "https://tools.ui-layouts.com";

	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "UI Tools",
		url: baseUrl,
		logo: `${baseUrl}/icon-512x512.png`,
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
		url: baseUrl,
		description:
			"Free collection of modern web design tools. Generate CSS backgrounds, gradients, shadows, colors, and more.",
		potentialAction: {
			"@type": "SearchAction",
			target: `${baseUrl}/?q={search_term_string}`,
			"query-input": "required name=search_term_string",
		},
	};

	const softwareApplicationSchema = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "UI Tools",
		url: baseUrl,
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

	const toolsSchema = [
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "Background Snippets Generator",
			url: `${baseUrl}/background-snippets`,
			description:
				"Generate beautiful CSS background patterns, gradients, and textures for your website",
			applicationCategory: "DesignApplication",
			operatingSystem: "Web Browser",
		},
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "SVG Clip-Path Generator",
			url: `${baseUrl}/clip-paths`,
			description:
				"Create and customize SVG clip-path shapes for modern web design",
			applicationCategory: "DesignApplication",
			operatingSystem: "Web Browser",
		},
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "Color Lab",
			url: `${baseUrl}/color-lab`,
			description:
				"Generate color palettes, convert between formats, and create Shadcn UI themes",
			applicationCategory: "DesignApplication",
			operatingSystem: "Web Browser",
		},
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "Mesh Gradient Generator",
			url: `${baseUrl}/mesh-gradients`,
			description:
				"Create beautiful mesh gradients and fluid color transitions for web designs",
			applicationCategory: "DesignApplication",
			operatingSystem: "Web Browser",
		},
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "CSS Shadow Generator",
			url: `${baseUrl}/shadows`,
			description:
				"Generate beautiful CSS and Tailwind CSS box-shadows and text-shadows",
			applicationCategory: "DesignApplication",
			operatingSystem: "Web Browser",
		},
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "SVG Line Draw",
			url: `${baseUrl}/svg-line-draw`,
			description:
				"Create hand-drawn SVG lines, arrows, and animations for web design",
			applicationCategory: "DesignApplication",
			operatingSystem: "Web Browser",
		},
	];

	// Return as JSON-LD script content
	return JSON.stringify([
		organizationSchema,
		websiteSchema,
		softwareApplicationSchema,
		...toolsSchema,
	]);
}
