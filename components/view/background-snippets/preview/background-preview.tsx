import type { GradientStop } from "@/hooks/use-gradient-stops";
import { hexToRgba } from "@/lib/color";

interface BackgroundPreviewProps {
	bgColor: string;
	patternType: string;
	gridLineColor: string;
	gridSizeX: number;
	gridSizeY: number;
	dotColor: string;
	dotSize: number;
	lineGridColor: string;
	lineGridSizeX: number;
	lineGridSizeY: number;
	dotGridColor: string;
	dotGridSize: number;
	useMask: boolean;
	customMaskPosition: boolean;
	maskType: string;
	maskPositionX: number;
	maskPositionY: number;
	maskWidth: number;
	maskHeight: number;
	maskOpacity: number;
	maskFade: number;
	useGradient: boolean;
	gradientType: string;
	gradientStops: GradientStop[];
	gradientSizeX: number;
	gradientSizeY: number;
	gradientPositionX: number;
	gradientPositionY: number;
	linearGradientAngle: number;
	repeatingLinearColor: string;
	repeatingLinearAngle: number;
	repeatingLinearSize: number;
}

export function BackgroundPreview({
	bgColor,
	patternType,
	gridLineColor,
	gridSizeX,
	gridSizeY,
	dotColor,
	dotSize,
	lineGridColor,
	lineGridSizeX,
	lineGridSizeY,
	dotGridColor,
	dotGridSize,
	useMask,
	customMaskPosition,
	maskType,
	maskPositionX,
	maskPositionY,
	maskWidth,
	maskHeight,
	maskOpacity,
	maskFade,
	useGradient,
	gradientType,
	gradientStops,
	gradientSizeX,
	gradientSizeY,
	gradientPositionX,
	gradientPositionY,
	linearGradientAngle,
	repeatingLinearColor,
	repeatingLinearAngle,
	repeatingLinearSize,
}: BackgroundPreviewProps) {
	// Base background
	const baseStyle = { backgroundColor: bgColor };

	let patternStyle = {};
	switch (patternType) {
		case "grid":
			patternStyle = {
				backgroundImage: `linear-gradient(to right, ${gridLineColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)`,
				backgroundSize: `${gridSizeX}px ${gridSizeY}px`,
			};
			break;
		case "dots":
			patternStyle = {
				backgroundImage: `radial-gradient(${dotColor} 1px, ${bgColor} 1px)`,
				backgroundSize: `${dotSize}px ${dotSize}px`,
			};
			break;
		case "lineGrid":
			patternStyle = {
				backgroundImage: `linear-gradient(to right, ${lineGridColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineGridColor} 1px, transparent 1px)`,
				backgroundSize: `${lineGridSizeX}rem ${lineGridSizeY}rem`,
			};
			break;
		case "dotGrid":
			patternStyle = {
				backgroundImage: `radial-gradient(${dotGridColor} 1px, transparent 1px)`,
				backgroundSize: `${dotGridSize}px ${dotGridSize}px`,
			};
			break;
		case "repeatingLinear":
			patternStyle = {
				backgroundImage: `repeating-linear-gradient(${repeatingLinearAngle}deg, ${repeatingLinearColor} 0px 1px, transparent 1px ${repeatingLinearSize}px)`,
			};
			break;
		case "none":
			patternStyle = {};
			break;
	}

	// Add mask if enabled
	if (useMask) {
		let maskPosition = "50% 50%";
		let maskShape = "ellipse";
		let maskSize = `${maskWidth}% ${maskHeight}%`;

		if (customMaskPosition) {
			maskPosition = `${maskPositionX}% ${maskPositionY}%`;
		} else {
			switch (maskType) {
				case "top":
					maskPosition = "50% 0%";
					break;
				case "bottom":
					maskPosition = "50% 100%";
					break;
				case "left":
					maskPosition = "0% 50%";
					break;
				case "right":
					maskPosition = "100% 50%";
					break;
				case "topLeft":
					maskPosition = "0% 0%";
					break;
				case "topRight":
					maskPosition = "100% 0%";
					break;
				case "bottomLeft":
					maskPosition = "0% 100%";
					break;
				case "bottomRight":
					maskPosition = "100% 100%";
					break;
				case "center":
					maskPosition = "50% 50%";
					break;
				case "circle":
					maskShape = "circle";
					maskSize = `${maskWidth}%`;
					break;
			}
		}

		patternStyle = {
			...patternStyle,
			maskImage: `radial-gradient(${maskShape} ${maskSize} at ${maskPosition}, black ${maskOpacity}%, transparent ${maskFade}%)`,
		};
	}

	let gradientStyle = {};
	if (useGradient) {
		if (gradientType === "radial") {
			const color1 = hexToRgba(gradientStops[0].color, gradientStops[0].alpha);
			const color2 = hexToRgba(
				gradientStops[gradientStops.length - 1].color,
				gradientStops[gradientStops.length - 1].alpha,
			);

			gradientStyle = {
				background: `radial-gradient(${gradientSizeX}% ${gradientSizeY}% at ${gradientPositionX}% ${gradientPositionY}%, ${color1} ${gradientStops[0].position}%, ${color2} ${gradientStops[gradientStops.length - 1].position}%)`,
				pointerEvents: "none",
			};
		} else {
			const colorStops = gradientStops
				.map((stop) => `${hexToRgba(stop.color, stop.alpha)} ${stop.position}%`)
				.join(", ");

			gradientStyle = {
				background: `linear-gradient(${linearGradientAngle}deg, ${colorStops})`,
				pointerEvents: "none",
			};
		}
	}

	return (
		<div className="relative h-full w-full overflow-hidden">
			<div className="relative h-full w-full" style={baseStyle}>
				{patternType !== "none" && (
					<div
						className="absolute top-0 right-0 bottom-0 left-0"
						style={patternStyle}
					/>
				)}
				{useGradient && (
					<div
						className="absolute top-0 right-0 bottom-0 left-0"
						style={gradientStyle}
					/>
				)}
			</div>
		</div>
	);
}
