import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Parse SVG path to extract control points
export const parseSvgPath = (pathData: string) => {
	if (
		pathData.includes(
			"M0.5 0.566745C0.5 0.25374 0.276142 0 0 0V0.433255C0 0.74626 0.223858 1 0.5 1C0.776142 1 1 0.74626 1 0.433255V0H0.5V0.566745Z",
		)
	) {
		return [
			{ x: 0.5, y: 0, command: "M", isControl: false },
			{ x: 0.5, y: 0.566745, command: "L", isControl: false },
			{ x: 0, y: 0.566745, command: "C", isControl: true },
			{ x: 0, y: 0.25374, command: "C", isControl: true },
			{ x: 0, y: 0, command: "L", isControl: false },
			{ x: 0, y: 0.433255, command: "L", isControl: false },
			{ x: 0, y: 0.74626, command: "C", isControl: true },
			{ x: 0.223858, y: 1, command: "C", isControl: true },
			{ x: 0.5, y: 1, command: "L", isControl: false },
			{ x: 0.776142, y: 1, command: "C", isControl: true },
			{ x: 1, y: 0.74626, command: "C", isControl: true },
			{ x: 1, y: 0.433255, command: "L", isControl: false },
			{ x: 1, y: 0, command: "L", isControl: false },
			{ x: 0.5, y: 0, command: "L", isControl: false },
		];
	}

	const commands = pathData.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
	const points: {
		x: number;
		y: number;
		command: string;
		isControl: boolean;
	}[] = [];

	let currentX = 0;
	let currentY = 0;

	if (commands.length === 0) {
		// Create 8 points around a circle
		for (let i = 0; i < 8; i++) {
			const angle = (i / 8) * Math.PI * 2;
			const x = 0.5 + Math.cos(angle) * 0.4;
			const y = 0.5 + Math.sin(angle) * 0.4;
			points.push({ x, y, command: "L", isControl: false });
		}
		return points;
	}

	commands.forEach((cmd) => {
		const command = cmd[0];
		const params = cmd
			.substring(1)
			.trim()
			.split(/[\s,]+/)
			.filter((p) => p !== "");

		if (command === "M" || command === "m") {
			// Move command
			for (let i = 0; i < params.length; i += 2) {
				if (i + 1 < params.length) {
					const x = Number.parseFloat(params[i]);
					const y = Number.parseFloat(params[i + 1]);

					if (!Number.isNaN(x) && !Number.isNaN(y)) {
						currentX = command === "M" ? x : currentX + x;
						currentY = command === "M" ? y : currentY + y;
						points.push({
							x: currentX,
							y: currentY,
							command,
							isControl: false,
						});
					}
				}
			}
		} else if (command === "L" || command === "l") {
			for (let i = 0; i < params.length; i += 2) {
				if (i + 1 < params.length) {
					const x = Number.parseFloat(params[i]);
					const y = Number.parseFloat(params[i + 1]);

					if (!Number.isNaN(x) && !Number.isNaN(y)) {
						currentX = command === "L" ? x : currentX + x;
						currentY = command === "L" ? y : currentY + y;
						points.push({
							x: currentX,
							y: currentY,
							command,
							isControl: false,
						});
					}
				}
			}
		} else if (command === "C" || command === "c") {
			// Cubic bezier curve
			for (let i = 0; i < params.length; i += 6) {
				if (i + 5 < params.length) {
					// Control point 1
					const x1 = Number.parseFloat(params[i]);
					const y1 = Number.parseFloat(params[i + 1]);

					if (!Number.isNaN(x1) && !Number.isNaN(y1)) {
						const cx1 = command === "C" ? x1 : currentX + x1;
						const cy1 = command === "C" ? y1 : currentY + y1;
						points.push({ x: cx1, y: cy1, command, isControl: true });
					}

					// Control point 2
					const x2 = Number.parseFloat(params[i + 2]);
					const y2 = Number.parseFloat(params[i + 3]);

					if (!Number.isNaN(x2) && !Number.isNaN(y2)) {
						const cx2 = command === "C" ? x2 : currentX + x2;
						const cy2 = command === "C" ? y2 : currentY + y2;
						points.push({ x: cx2, y: cy2, command, isControl: true });
					}

					// End point
					const x = Number.parseFloat(params[i + 4]);
					const y = Number.parseFloat(params[i + 5]);

					if (!Number.isNaN(x) && !Number.isNaN(y)) {
						currentX = command === "C" ? x : currentX + x;
						currentY = command === "C" ? y : currentY + y;
						points.push({
							x: currentX,
							y: currentY,
							command,
							isControl: false,
						});
					}
				}
			}
		} else if (command === "V" || command === "v") {
			// Vertical line
			for (let i = 0; i < params.length; i++) {
				const y = Number.parseFloat(params[i]);
				if (!Number.isNaN(y)) {
					currentY = command === "V" ? y : currentY + y;
					points.push({
						x: currentX,
						y: currentY,
						command: "L",
						isControl: false,
					});
				}
			}
		} else if (command === "H" || command === "h") {
			// Horizontal line
			for (let i = 0; i < params.length; i++) {
				const x = Number.parseFloat(params[i]);
				if (!Number.isNaN(x)) {
					currentX = command === "H" ? x : currentX + x;
					points.push({
						x: currentX,
						y: currentY,
						command: "L",
						isControl: false,
					});
				}
			}
		} else if (command === "Z" || command === "z") {
			// Close path - no new points
		}
	});

	// If we couldn't extract any points, create a fallback shape
	if (points.length < 3) {
		// Create 8 points around a circle
		for (let i = 0; i < 8; i++) {
			const angle = (i / 8) * Math.PI * 2;
			const x = 0.5 + Math.cos(angle) * 0.4;
			const y = 0.5 + Math.sin(angle) * 0.4;
			points.push({ x, y, command: "L", isControl: false });
		}
	}

	return points;
};

export const pointsToSvgPath = (
	points: { x: number; y: number; command: string; isControl: boolean }[],
) => {
	if (points.length === 0) return "";

	let path = "";
	let i = 0;

	path += `M${points[0].x.toFixed(6)} ${points[0].y.toFixed(6)} `;
	i++;

	while (i < points.length) {
		if (
			i + 2 < points.length &&
			points[i].isControl &&
			points[i + 1].isControl &&
			!points[i + 2].isControl
		) {
			path += `C${points[i].x.toFixed(6)} ${points[i].y.toFixed(6)} ${points[i + 1].x.toFixed(6)} ${points[i + 1].y.toFixed(6)} ${points[i + 2].x.toFixed(6)} ${points[i + 2].y.toFixed(6)} `;
			i += 3;
		} else {
			path += `L${points[i].x.toFixed(6)} ${points[i].y.toFixed(6)} `;
			i++;
		}
	}

	path += "Z";

	return path;
};

export const siteConfig = {
	name: "Tools",
	openGraphName: "Tools For Developer/Designer",
	url: "https://tools.ui-layouts.com",
	ogImage: "https://tools.ui-layouts.com/og.jpg",
	shadowOgImage: "https://tools.ui-layouts.com/shadows.jpg",
	clipPathOgImage: "https://tools.ui-layouts.com/clippath.jpg",
	gradientOgImage: "https://tools.ui-layouts.com/meshgradients.jpg",
	bgSnippetsOgImage: "https://tools.ui-layouts.com/bgsnippets.jpg",
	lineDrawOgImage: "https://tools.ui-layouts.com/svgpathanimation.jpg",
	colorOgImage: "https://tools.ui-layouts.com/color-lab-og.jpg",
	description:
		"A creative toolbox featuring shadow, SVG Clip-Path, gradient, and background pattern generators, color. Open-source, fast, and made for builders.",
	links: {
		twitter: "https://twitter.com/naymur_dev",
		linkedin: "https://www.linkedin.com/in/naymur-rahman",
		github: "https://github.com/naymurdev",
	},
};

export const TOOL_SLUGS = [
	"background-snippets",
	"clip-paths",
	"color-lab",
	"mesh-gradients",
	"shadows",
	"svg-line-draw",
] as const;

export const TOOL_SCHEMA_DETAILS: Record<
	(typeof TOOL_SLUGS)[number],
	{ name: string; description: string }
> = {
	"background-snippets": {
		name: "Background Snippets Generator",
		description:
			"Generate beautiful CSS background patterns, gradients, and textures for your website",
	},
	"clip-paths": {
		name: "SVG Clip-Path Generator",
		description:
			"Create and customize SVG clip-path shapes for modern web design",
	},
	"color-lab": {
		name: "Color Lab",
		description:
			"Generate color palettes, convert between formats, and create Shadcn UI themes",
	},
	"mesh-gradients": {
		name: "Mesh Gradient Generator",
		description:
			"Create beautiful mesh gradients and fluid color transitions for web designs",
	},
	shadows: {
		name: "CSS Shadow Generator",
		description:
			"Generate beautiful CSS and Tailwind CSS box-shadows and text-shadows",
	},
	"svg-line-draw": {
		name: "SVG Line Draw",
		description:
			"Create hand-drawn SVG lines, arrows, and animations for web design",
	},
};
