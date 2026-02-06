"use client";

import { type Variants, motion, useAnimationControls } from "motion/react";
import React, { useState } from "react";

type PathData = {
	d: string;
	stroke?: string;
	strokeWidth?: number;
	strokeLinecap?: "butt" | "round" | "square";
};

type HoverAnimationType = "float" | "pulse" | "redraw" | "color" | "sequential";

type TAnimateSvgProps = {
	width: string;
	height: string;
	viewBox: string;
	className: string;
	path?: string; // Single path (legacy)
	paths?: PathData[]; // New multiple path support
	strokeColor?: string;
	strokeWidth?: number;
	strokeLinecap?: "butt" | "round" | "square";
	animationDuration?: number;
	animationDelay?: number;
	animationBounce?: number;
	staggerDelay?: number;
	reverseAnimation?: boolean;
	enableHoverAnimation?: boolean;
	hoverAnimationType?: HoverAnimationType;
	hoverStrokeColor?: string | null;
	initialAnimation?: boolean;
};

export const AnimateSvg: React.FC<TAnimateSvgProps> = ({
	width,
	height,
	viewBox,
	className = "flex justify-center w-full h-full",
	path,
	paths = [],
	strokeColor = "#cecece",
	strokeWidth = 3,
	strokeLinecap = "round",
	animationDuration = 1.5,
	animationDelay = 0,
	animationBounce = 0.3,
	staggerDelay = 0.2,
	reverseAnimation = false,
	enableHoverAnimation = false,
	hoverAnimationType = "redraw",
	hoverStrokeColor = "#4f46e5",
	initialAnimation = true,
}) => {
	const [isHovering, setIsHovering] = useState(false);

	const normalizedPaths: PathData[] = React.useMemo(() => {
		if (paths.length > 0) return paths;
		if (path) {
			// Parse the path to normalize coordinates if needed
			let normalizedPath = path;

			// If the path is a complex path with large starting coordinates, try to normalize it
			if (path.startsWith("M") && path.includes(",")) {
				try {
					// Extract all coordinates from the path
					const allCoords: number[] = [];
					const regex = /[-+]?[0-9]*\.?[0-9]+/g;
					// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
					let match;
					// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
					while ((match = regex.exec(path)) !== null) {
						allCoords.push(Number.parseFloat(match[0]));
					}

					// Find min and max x and y to normalize
					if (allCoords.length >= 2) {
						let minX = Number.POSITIVE_INFINITY;
						let minY = Number.POSITIVE_INFINITY;
						let maxX = Number.NEGATIVE_INFINITY;
						let maxY = Number.NEGATIVE_INFINITY;

						for (let i = 0; i < allCoords.length; i += 2) {
							if (i + 1 < allCoords.length) {
								minX = Math.min(minX, allCoords[i]);
								minY = Math.min(minY, allCoords[i + 1]);
								maxX = Math.max(maxX, allCoords[i]);
								maxY = Math.max(maxY, allCoords[i + 1]);
							}
						}

						// Calculate the path width and height
						const pathWidth = maxX - minX;
						const pathHeight = maxY - minY;

						// Parse the viewBox to get its dimensions
						const viewBoxDims = viewBox.split(" ").map(Number);
						const viewBoxWidth = viewBoxDims.length >= 3 ? viewBoxDims[2] : 100;
						const viewBoxHeight =
							viewBoxDims.length >= 4 ? viewBoxDims[3] : 100;

						// Calculate padding (10% of viewBox width)
						const paddingX = viewBoxWidth * 0.1;
						const paddingY = viewBoxHeight * 0.1;

						// Calculate scale to fit the path within the viewBox with padding
						const scaleX = (viewBoxWidth - 2 * paddingX) / pathWidth;
						const scaleY = (viewBoxHeight - 2 * paddingY) / pathHeight;
						const scale = Math.min(scaleX, scaleY);

						// Adjust all coordinates to start from the left with padding and proper scaling
						let adjustedPath = path;
						let index = 0;
						adjustedPath = adjustedPath.replace(
							/[-+]?[0-9]*\.?[0-9]+/g,
							(match) => {
								const val = Number.parseFloat(match);
								const isX = index % 2 === 0;
								index++;

								if (isX) {
									// X coordinate - shift to start from left with padding
									return ((val - minX) * scale + paddingX).toFixed(2);
								}
								// Y coordinate - center vertically
								return ((val - minY) * scale + paddingY).toFixed(2);
							},
						);
						normalizedPath = adjustedPath;
					}
				} catch (e) {
					// If parsing fails, use the original path
					console.error("Failed to normalize path:", e);
				}
			}

			return [
				{
					d: normalizedPath,
					stroke: strokeColor,
					strokeWidth,
					strokeLinecap,
				},
			];
		}
		return [];
	}, [paths, path, strokeColor, strokeWidth, strokeLinecap, viewBox]);

	// Initial animation variants
	const getPathVariants = (index: number): Variants => ({
		hidden: {
			pathLength: 0,
			opacity: 0,
			pathOffset: reverseAnimation ? 1 : 0,
		},
		visible: {
			pathLength: 1,
			opacity: 1,
			pathOffset: reverseAnimation ? 0 : 0,
			transition: {
				pathLength: {
					type: "spring",
					duration: animationDuration,
					bounce: animationBounce,
					delay: animationDelay + index * staggerDelay,
				},
				pathOffset: {
					duration: animationDuration,
					delay: animationDelay + index * staggerDelay,
				},
				opacity: {
					duration: animationDuration / 4,
					delay: animationDelay + index * staggerDelay,
				},
			},
		},
	});

	if (normalizedPaths.length === 0) return null;

	return (
		<motion.svg
			width={width}
			height={height}
			viewBox={viewBox}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			initial={initialAnimation ? "hidden" : "visible"}
			animate="visible"
			onHoverStart={() => setIsHovering(true)}
			onHoverEnd={() => setIsHovering(false)}
			whileHover={
				enableHoverAnimation && hoverAnimationType !== "redraw"
					? { scale: 1.05 }
					: {}
			}
			preserveAspectRatio="xMidYMid meet"
			style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }}
		>
			<title>animate svg</title>
			{normalizedPaths.map((pathData, index) => (
				<AnimatedPath
					key={index}
					pathData={pathData}
					index={index}
					strokeColor={strokeColor}
					strokeWidth={strokeWidth}
					strokeLinecap={strokeLinecap}
					initialAnimation={initialAnimation}
					pathVariants={getPathVariants(index)}
					isHovering={isHovering && enableHoverAnimation}
					hoverAnimationType={hoverAnimationType}
					hoverStrokeColor={hoverStrokeColor}
					totalPaths={normalizedPaths.length}
				/>
			))}
		</motion.svg>
	);
};

interface AnimatedPathProps {
	pathData: PathData;
	index: number;
	strokeColor: string;
	strokeWidth: number;
	strokeLinecap: "butt" | "round" | "square";
	initialAnimation: boolean;
	pathVariants: Variants;
	isHovering: boolean;
	hoverAnimationType: HoverAnimationType;
	hoverStrokeColor: string | null;
	totalPaths: number;
}

const AnimatedPath: React.FC<AnimatedPathProps> = ({
	pathData,
	index,
	strokeColor,
	strokeWidth,
	strokeLinecap,
	initialAnimation,
	pathVariants,
	isHovering,
	hoverAnimationType,
	hoverStrokeColor,
	totalPaths,
}) => {
	const controls = useAnimationControls();
	const originalColor = pathData.stroke || strokeColor;

	// Handle hover animations
	React.useEffect(() => {
		if (!isHovering) {
			controls.stop();
			if (initialAnimation) {
				controls.start("visible");
			}
			return;
		}

		switch (hoverAnimationType) {
			case "redraw":
				controls.start({
					pathLength: [1, 0, 1],
					transition: {
						pathLength: {
							repeat: Number.POSITIVE_INFINITY,
							duration: 3,
							ease: "easeInOut",
						},
					},
				});
				break;

			case "float":
				controls.start({
					y: [0, -2, 0],
					transition: {
						y: {
							repeat: Number.POSITIVE_INFINITY,
							duration: 1.5,
							ease: "easeInOut",
						},
					},
				});
				break;

			case "pulse":
				controls.start({
					scale: [1, 1.03, 1],
					transition: {
						scale: {
							repeat: Number.POSITIVE_INFINITY,
							duration: 1.3,
							ease: "easeInOut",
						},
					},
				});
				break;

			case "color":
				controls.start({
					stroke: [
						originalColor,
						hoverStrokeColor || strokeColor,
						originalColor,
					],
					transition: {
						stroke: {
							repeat: Number.POSITIVE_INFINITY,
							duration: 2,
							ease: "easeInOut",
						},
					},
				});
				break;

			case "sequential":
				controls.start({
					pathLength: [1, 0, 1],
					transition: {
						pathLength: {
							repeat: Number.POSITIVE_INFINITY,
							duration: 2,
							delay: (index / Math.max(totalPaths, 1)) * 2,
							ease: "easeInOut",
						},
					},
				});
				break;
		}
	}, [
		isHovering,
		hoverAnimationType,
		controls,
		originalColor,
		hoverStrokeColor,
		strokeColor,
		index,
		totalPaths,
		initialAnimation,
	]);

	return (
		<motion.path
			d={pathData.d}
			stroke={pathData.stroke ?? strokeColor}
			strokeWidth={pathData.strokeWidth ?? strokeWidth}
			strokeLinecap={pathData.strokeLinecap ?? strokeLinecap}
			initial={initialAnimation ? "hidden" : "visible"}
			animate={controls}
			variants={pathVariants}
		/>
	);
};
