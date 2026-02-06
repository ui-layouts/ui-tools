import type { ControlPoint } from "./types";

/**
 * Parses an SVG path string into an array of control points
 */
export function parseSvgPath(pathData: string): ControlPoint[] {
	if (!pathData || pathData.trim() === "") {
		throw new Error("Empty path data");
	}

	const points: ControlPoint[] = [];
	const commands = pathData.match(/[a-zA-Z][^a-zA-Z]*/g) || [];

	if (commands.length === 0) {
		throw new Error("No valid commands found in path data");
	}

	let currentX = 0;
	let currentY = 0;

	for (const cmd of commands) {
		const command = cmd[0];
		const isRelative = command === command.toLowerCase();
		const params = cmd
			.slice(1)
			.trim()
			.split(/[\s,]+/)
			.map(Number.parseFloat);

		// Skip if we don't have enough parameters
		if (params.length < 2 && command.toUpperCase() !== "Z") {
			continue;
		}

		switch (command.toUpperCase()) {
			case "M": // Move to
				for (let i = 0; i < params.length; i += 2) {
					if (i + 1 >= params.length) break;

					const x = isRelative ? currentX + params[i] : params[i];
					const y = isRelative ? currentY + params[i + 1] : params[i + 1];

					// Skip if NaN
					if (Number.isNaN(x) || Number.isNaN(y)) continue;

					points.push({ x, y, command, isControl: false });
					currentX = x;
					currentY = y;
				}
				break;

			case "L": // Line to
				for (let i = 0; i < params.length; i += 2) {
					if (i + 1 >= params.length) break;

					const x = isRelative ? currentX + params[i] : params[i];
					const y = isRelative ? currentY + params[i + 1] : params[i + 1];

					// Skip if NaN
					if (Number.isNaN(x) || Number.isNaN(y)) continue;

					points.push({ x, y, command, isControl: false });
					currentX = x;
					currentY = y;
				}
				break;

			case "C": // Cubic bezier
				for (let i = 0; i < params.length; i += 6) {
					if (i + 5 >= params.length) break;

					const x1 = isRelative ? currentX + params[i] : params[i];
					const y1 = isRelative ? currentY + params[i + 1] : params[i + 1];
					const x2 = isRelative ? currentX + params[i + 2] : params[i + 2];
					const y2 = isRelative ? currentY + params[i + 3] : params[i + 3];
					const x = isRelative ? currentX + params[i + 4] : params[i + 4];
					const y = isRelative ? currentY + params[i + 5] : params[i + 5];

					// Skip if any NaN
					if (
						Number.isNaN(x1) ||
						Number.isNaN(y1) ||
						Number.isNaN(x2) ||
						Number.isNaN(y2) ||
						Number.isNaN(x) ||
						Number.isNaN(y)
					)
						continue;

					points.push({ x: x1, y: y1, command, isControl: true });
					points.push({ x: x2, y: y2, command, isControl: true });
					points.push({ x, y, command, isControl: false });

					currentX = x;
					currentY = y;
				}
				break;

			case "Q": // Quadratic bezier
				for (let i = 0; i < params.length; i += 4) {
					if (i + 3 >= params.length) break;

					const x1 = isRelative ? currentX + params[i] : params[i];
					const y1 = isRelative ? currentY + params[i + 1] : params[i + 1];
					const x = isRelative ? currentX + params[i + 2] : params[i + 2];
					const y = isRelative ? currentY + params[i + 3] : params[i + 3];

					// Skip if any NaN
					if (
						Number.isNaN(x1) ||
						Number.isNaN(y1) ||
						Number.isNaN(x) ||
						Number.isNaN(y)
					)
						continue;

					points.push({ x: x1, y: y1, command, isControl: true });
					points.push({ x, y, command, isControl: false });

					currentX = x;
					currentY = y;
				}
				break;

			case "Z": // Close path
				// No points to add for close path
				break;

			default:
				// Handle other commands as needed
				break;
		}
	}

	// If we couldn't parse any points, create a simple default path
	if (points.length === 0) {
		points.push({ x: 10, y: 10, command: "M", isControl: false });
		points.push({ x: 90, y: 90, command: "L", isControl: false });
	}

	return points;
}

/**
 * Converts an array of control points back to an SVG path string
 */
export function pointsToSvgPath(points: ControlPoint[]): string {
	if (points.length === 0) return "";

	let path = "";
	let i = 0;

	// Start with a move to command
	path += `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
	i++;

	while (i < points.length) {
		if (
			i + 2 < points.length &&
			points[i].isControl &&
			points[i + 1].isControl &&
			!points[i + 2].isControl
		) {
			// Cubic bezier curve
			path += ` C${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}, ${points[i + 1].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}, ${points[i + 2].x.toFixed(2)} ${points[i + 2].y.toFixed(2)}`;
			i += 3;
		} else if (
			i + 1 < points.length &&
			points[i].isControl &&
			!points[i + 1].isControl
		) {
			// Quadratic bezier curve
			path += ` Q${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}, ${points[i + 1].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}`;
			i += 2;
		} else {
			// Line to
			path += ` L${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
			i++;
		}
	}

	return path;
}

/**
 * Add control points to all anchor points
 */
export function addControlPointsToAllAnchors(
	points: ControlPoint[],
): ControlPoint[] {
	if (points.length < 2) return points;

	const result: ControlPoint[] = [];

	// Process each anchor point
	for (let i = 0; i < points.length; i++) {
		const point = points[i];

		// Skip if it's already a control point
		if (point.isControl) {
			result.push(point);
			continue;
		}

		// Add the anchor point
		result.push(point);

		// If this is not the last point, add control points
		if (i < points.length - 1) {
			const nextPoint = points[i + 1];

			// Skip if the next point is a control point (already has controls)
			if (nextPoint.isControl) continue;

			// Calculate the direction and distance to the next point
			const dx = nextPoint.x - point.x;
			const dy = nextPoint.y - point.y;
			const _distance = Math.sqrt(dx * dx + dy * dy);

			// Add control points at 1/3 and 2/3 of the distance
			const cp1: ControlPoint = {
				x: point.x + dx / 3,
				y: point.y + dy / 3,
				command: "C",
				isControl: true,
			};

			const cp2: ControlPoint = {
				x: point.x + (2 * dx) / 3,
				y: point.y + (2 * dy) / 3,
				command: "C",
				isControl: true,
			};

			result.push(cp1);
			result.push(cp2);
		}
	}

	return result;
}
