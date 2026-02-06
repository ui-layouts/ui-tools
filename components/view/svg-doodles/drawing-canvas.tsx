"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import CopyToClipboard from "@/components/ui/copy-to-clipboard";
import { Label } from "@/components/ui/label";
import { CustomSlider } from "@/components/ui/range-slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
	Minus,
	MousePointer,
	Pen,
	Pencil,
	Plus,
	Redo,
	Save,
	Trash2,
	Undo,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Point {
	x: number;
	y: number;
	controlPoint1?: { x: number; y: number };
	controlPoint2?: { x: number; y: number };
}

type DrawingTool = "select" | "pen" | "pencil" | "add" | "remove";

interface DrawingCanvasProps {
	width: number;
	height: number;
	onPathChange: (path: string) => void;
	currentPath: string;
	strokeWidth: number;
	strokeColor: string;
	savePath: () => void;
}

export function DrawingCanvas({
	width,
	height,
	onPathChange,
	strokeWidth,
	strokeColor,
	savePath,
	currentPath,
}: DrawingCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [points, setPoints] = useState<Point[]>([]);
	const [pencilPoints, setPencilPoints] = useState<Point[]>([]);
	const [history, setHistory] = useState<Point[][]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [isDrawing, setIsDrawing] = useState(false);
	const [currentTool, setCurrentTool] = useState<DrawingTool>("pen");
	const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
		null,
	);
	const [draggingPointType, setDraggingPointType] = useState<
		"point" | "control1" | "control2" | null
	>(null);
	const [smoothing, setSmoothing] = useState(0.3);
	const [simplifyTolerance, setSimplifyTolerance] = useState(5);
	const [pendingPoint, setPendingPoint] = useState<Point | null>(null);
	const [hoverPointIndex, setHoverPointIndex] = useState<number | null>(null);
	const [hoverControlPoint, setHoverControlPoint] = useState<
		"control1" | "control2" | null
	>(null);
	const [showControlPoints, setShowControlPoints] = useState(true);
	const [scale, setScale] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

	// Initialize canvas and handle drawing
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas dimensions to match its display size
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;

		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Apply zoom and pan transformation
		ctx.save();
		ctx.translate(offset.x, offset.y);
		ctx.scale(scale, scale);

		// Draw grid
		drawGrid(ctx);

		// Set styles
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = strokeWidth / scale; // Adjust line width for zoom
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		// Draw existing path
		if (points.length > 0) {
			ctx.beginPath();
			ctx.moveTo(points[0].x, points[0].y);

			for (let i = 1; i < points.length; i++) {
				const point = points[i];
				const prevPoint = points[i - 1];

				if (point.controlPoint1 && prevPoint.controlPoint2) {
					// Cubic bezier curve
					ctx.bezierCurveTo(
						prevPoint.controlPoint2.x,
						prevPoint.controlPoint2.y,
						point.controlPoint1.x,
						point.controlPoint1.y,
						point.x,
						point.y,
					);
				} else if (point.controlPoint1) {
					// Quadratic bezier curve with only current control point
					ctx.quadraticCurveTo(
						point.controlPoint1.x,
						point.controlPoint1.y,
						point.x,
						point.y,
					);
				} else if (prevPoint.controlPoint2) {
					// Quadratic bezier curve with only previous control point
					ctx.quadraticCurveTo(
						prevPoint.controlPoint2.x,
						prevPoint.controlPoint2.y,
						point.x,
						point.y,
					);
				} else {
					// Straight line
					ctx.lineTo(point.x, point.y);
				}
			}

			ctx.stroke();
		}

		// Draw pencil points if currently drawing with pencil
		if (currentTool === "pencil" && isDrawing && pencilPoints.length > 0) {
			ctx.beginPath();
			ctx.moveTo(pencilPoints[0].x, pencilPoints[0].y);

			for (let i = 1; i < pencilPoints.length; i++) {
				ctx.lineTo(pencilPoints[i].x, pencilPoints[i].y);
			}

			ctx.stroke();
		}

		// Draw control points and handles
		if ((currentTool === "select" || showControlPoints) && points.length > 0) {
			points.forEach((point, index) => {
				const isSelected = index === selectedPointIndex;
				const isHovered = index === hoverPointIndex;

				// Draw anchor point
				ctx.beginPath();
				ctx.arc(
					point.x,
					point.y,
					(isSelected || isHovered ? 8 : 7) / scale, // Adjust size for zoom
					0,
					Math.PI * 2,
				);
				ctx.fillStyle = isSelected
					? "#4f46e5"
					: isHovered
						? "#818cf8"
						: "#3b82f6";
				ctx.fill();
				ctx.strokeStyle = "white";
				ctx.lineWidth = 1 / scale; // Adjust for zoom
				ctx.stroke();

				// Draw control points and handles if they exist
				if (point.controlPoint1) {
					// Line from anchor to control point
					ctx.beginPath();
					ctx.moveTo(point.x, point.y);
					ctx.lineTo(point.controlPoint1.x, point.controlPoint1.y);
					ctx.strokeStyle = "#94a3b8";
					ctx.lineWidth = 1 / scale; // Adjust for zoom
					ctx.stroke();

					// Control point
					ctx.beginPath();
					ctx.arc(
						point.controlPoint1.x,
						point.controlPoint1.y,
						(isSelected && hoverControlPoint === "control1" ? 6 : 5) / scale, // Adjust for zoom
						0,
						Math.PI * 2,
					);
					ctx.fillStyle = "#a855f7";
					ctx.fill();
					ctx.strokeStyle = "white";
					ctx.lineWidth = 1 / scale; // Adjust for zoom
					ctx.stroke();
				}

				if (point.controlPoint2) {
					// Line from anchor to control point
					ctx.beginPath();
					ctx.moveTo(point.x, point.y);
					ctx.lineTo(point.controlPoint2.x, point.controlPoint2.y);
					ctx.strokeStyle = "#94a3b8";
					ctx.lineWidth = 1 / scale; // Adjust for zoom
					ctx.stroke();

					// Control point
					ctx.beginPath();
					ctx.arc(
						point.controlPoint2.x,
						point.controlPoint2.y,
						(isSelected && hoverControlPoint === "control2" ? 6 : 5) / scale, // Adjust for zoom
						0,
						Math.PI * 2,
					);
					ctx.fillStyle = "#ec4899";
					ctx.fill();
					ctx.strokeStyle = "white";
					ctx.lineWidth = 1 / scale; // Adjust for zoom
					ctx.stroke();
				}
			});
		}

		ctx.restore();
	}, [
		points,
		pencilPoints,
		strokeWidth,
		strokeColor,
		selectedPointIndex,
		hoverPointIndex,
		hoverControlPoint,
		currentTool,
		showControlPoints,
		isDrawing,
		scale,
		offset,
	]);

	// Convert points to SVG path
	useEffect(() => {
		if (points.length === 0) {
			onPathChange("");
			return;
		}

		// Start the path from the left side of the canvas
		// Find the minimum x and y coordinates to normalize the path
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;

		// Find min and max coordinates
		points.forEach((point) => {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);

			// Also check control points
			if (point.controlPoint1) {
				minX = Math.min(minX, point.controlPoint1.x);
				minY = Math.min(minY, point.controlPoint1.y);
				maxX = Math.max(maxX, point.controlPoint1.x);
				maxY = Math.max(maxY, point.controlPoint1.y);
			}

			if (point.controlPoint2) {
				minX = Math.min(minX, point.controlPoint2.x);
				minY = Math.min(minY, point.controlPoint2.y);
				maxX = Math.max(maxX, point.controlPoint2.x);
				maxY = Math.max(maxY, point.controlPoint2.y);
			}
		});

		// Use a small offset to avoid starting exactly at the edge
		const offsetX = Math.max(0, minX - 10);
		const offsetY = Math.max(0, minY - 10);

		// Generate the path with normalized coordinates
		let path = `M ${(points[0].x - offsetX).toFixed(2)} ${(points[0].y - offsetY).toFixed(2)}`;

		for (let i = 1; i < points.length; i++) {
			const point = points[i];
			const prevPoint = points[i - 1];

			if (point.controlPoint1 && prevPoint.controlPoint2) {
				// Cubic bezier curve
				path += ` C ${(prevPoint.controlPoint2.x - offsetX).toFixed(2)} ${(
					prevPoint.controlPoint2.y - offsetY
				).toFixed(2)}, ${(point.controlPoint1.x - offsetX).toFixed(2)} ${(
					point.controlPoint1.y - offsetY
				).toFixed(
					2,
				)}, ${(point.x - offsetX).toFixed(2)} ${(point.y - offsetY).toFixed(2)}`;
			} else if (point.controlPoint1) {
				// Quadratic bezier curve with only current control point
				path += ` Q ${(point.controlPoint1.x - offsetX).toFixed(2)} ${(
					point.controlPoint1.y - offsetY
				).toFixed(
					2,
				)}, ${(point.x - offsetX).toFixed(2)} ${(point.y - offsetY).toFixed(2)}`;
			} else if (prevPoint.controlPoint2) {
				// Quadratic bezier curve with only previous control point
				path += ` Q ${(prevPoint.controlPoint2.x - offsetX).toFixed(2)} ${(
					prevPoint.controlPoint2.y - offsetY
				).toFixed(
					2,
				)}, ${(point.x - offsetX).toFixed(2)} ${(point.y - offsetY).toFixed(2)}`;
			} else {
				// Straight line
				path += ` L ${(point.x - offsetX).toFixed(2)} ${(point.y - offsetY).toFixed(2)}`;
			}
		}

		onPathChange(path);
	}, [points, onPathChange]);

	// Draw a grid on the canvas
	const drawGrid = (ctx: CanvasRenderingContext2D) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gridSize = 20;
		ctx.strokeStyle = "#f1f5f9";
		ctx.lineWidth = 0.5 / scale; // Adjust for zoom

		// Calculate visible area in grid coordinates
		const startX = Math.floor(-offset.x / scale / gridSize) * gridSize;
		const startY = Math.floor(-offset.y / scale / gridSize) * gridSize;
		const endX =
			Math.ceil((canvas.width - offset.x) / scale / gridSize) * gridSize;
		const endY =
			Math.ceil((canvas.height - offset.y) / scale / gridSize) * gridSize;

		// Draw vertical lines
		for (let x = startX; x <= endX; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, startY);
			ctx.lineTo(x, endY);
			ctx.stroke();
		}

		// Draw horizontal lines
		for (let y = startY; y <= endY; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(startX, y);
			ctx.lineTo(endX, y);
			ctx.stroke();
		}
	};

	// Completely redesigned path simplification algorithm
	// This creates fewer, more strategic points like in the reference image
	const simplifyPath = (pathPoints: Point[], tolerance = 5): Point[] => {
		if (pathPoints.length <= 2) return pathPoints;

		// For very short paths, don't simplify
		if (pathPoints.length < 5) return pathPoints;

		// Step 1: Find significant points using Douglas-Peucker algorithm
		const significantPoints = douglasPeuckerSimplify(pathPoints, tolerance);

		// Step 2: Ensure we have a reasonable number of points (not too many, not too few)
		let finalPoints: Point[] = significantPoints;

		// If we have too many points, increase tolerance and simplify again
		if (finalPoints.length > 20) {
			finalPoints = douglasPeuckerSimplify(pathPoints, tolerance * 1.5);
		}

		// If we have too few points, add some intermediate points at areas of high curvature
		if (finalPoints.length < 5 && pathPoints.length > 20) {
			finalPoints = addCurvaturePoints(pathPoints, finalPoints);
		}

		// Always include first and last points
		if (finalPoints[0] !== pathPoints[0]) {
			finalPoints.unshift(pathPoints[0]);
		}

		if (
			finalPoints[finalPoints.length - 1] !== pathPoints[pathPoints.length - 1]
		) {
			finalPoints.push(pathPoints[pathPoints.length - 1]);
		}

		return finalPoints;
	};

	// Douglas-Peucker algorithm for path simplification
	const douglasPeuckerSimplify = (
		points: Point[],
		epsilon: number,
	): Point[] => {
		if (points.length <= 2) return points;

		// Find the point with the maximum distance
		let maxDistance = 0;
		let maxDistanceIndex = 0;

		const firstPoint = points[0];
		const lastPoint = points[points.length - 1];

		for (let i = 1; i < points.length - 1; i++) {
			const distance = perpendicularDistance(points[i], firstPoint, lastPoint);

			if (distance > maxDistance) {
				maxDistance = distance;
				maxDistanceIndex = i;
			}
		}

		// If max distance is greater than epsilon, recursively simplify
		if (maxDistance > epsilon) {
			// Recursive call
			const firstHalf = douglasPeuckerSimplify(
				points.slice(0, maxDistanceIndex + 1),
				epsilon,
			);
			const secondHalf = douglasPeuckerSimplify(
				points.slice(maxDistanceIndex),
				epsilon,
			);

			// Concatenate the two parts
			return [...firstHalf.slice(0, -1), ...secondHalf];
		}
		// Base case - return just the endpoints
		return [firstPoint, lastPoint];
	};

	// Calculate perpendicular distance from a point to a line
	const perpendicularDistance = (
		point: Point,
		lineStart: Point,
		lineEnd: Point,
	): number => {
		const dx = lineEnd.x - lineStart.x;
		const dy = lineEnd.y - lineStart.y;

		// If the line is just a point, return distance to that point
		if (dx === 0 && dy === 0) {
			return Math.sqrt(
				(point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2,
			);
		}

		// Calculate the perpendicular distance
		const lineLengthSquared = dx * dx + dy * dy;
		const t =
			((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
			lineLengthSquared;

		if (t < 0) {
			// Point is beyond lineStart
			return Math.sqrt(
				(point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2,
			);
		}
		if (t > 1) {
			// Point is beyond lineEnd
			return Math.sqrt((point.x - lineEnd.x) ** 2 + (point.y - lineEnd.y) ** 2);
		}

		// Projection falls on the line segment
		const projectionX = lineStart.x + t * dx;
		const projectionY = lineStart.y + t * dy;

		return Math.sqrt(
			(point.x - projectionX) ** 2 + (point.y - projectionY) ** 2,
		);
	};

	// Add points at areas of high curvature
	const addCurvaturePoints = (
		originalPoints: Point[],
		simplifiedPoints: Point[],
	): Point[] => {
		if (simplifiedPoints.length < 2) return simplifiedPoints;

		const result: Point[] = [...simplifiedPoints];

		// For each segment in the simplified path
		for (let i = 0; i < simplifiedPoints.length - 1; i++) {
			const startPoint = simplifiedPoints[i];
			const endPoint = simplifiedPoints[i + 1];

			// Find the original points that fall between these two simplified points
			const startIndex = originalPoints.findIndex(
				(p) => p.x === startPoint.x && p.y === startPoint.y,
			);
			const endIndex = originalPoints.findIndex(
				(p) => p.x === endPoint.x && p.y === endPoint.y,
			);

			if (startIndex !== -1 && endIndex !== -1 && endIndex - startIndex > 10) {
				// Calculate curvature for points between start and end
				let maxCurvature = 0;
				let maxCurvatureIndex = -1;

				for (let j = startIndex + 1; j < endIndex; j++) {
					if (j > 0 && j < originalPoints.length - 1) {
						const curvature = calculateCurvature(
							originalPoints[j - 1],
							originalPoints[j],
							originalPoints[j + 1],
						);

						if (curvature > maxCurvature) {
							maxCurvature = curvature;
							maxCurvatureIndex = j;
						}
					}
				}

				// If we found a point with significant curvature, add it
				if (maxCurvatureIndex !== -1 && maxCurvature > 0.1) {
					result.splice(i + 1, 0, originalPoints[maxCurvatureIndex]);
				}
			}
		}

		return result;
	};

	// Calculate curvature at a point using the angle between adjacent segments
	const calculateCurvature = (p1: Point, p2: Point, p3: Point): number => {
		// Calculate vectors
		const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
		const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

		// Calculate magnitudes
		const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
		const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

		// Avoid division by zero
		if (mag1 === 0 || mag2 === 0) return 0;

		// Calculate dot product
		const dot = v1.x * v2.x + v1.y * v2.y;

		// Calculate angle
		const cosAngle = dot / (mag1 * mag2);

		// Clamp to avoid floating point errors
		const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));

		// Convert to angle and normalize
		const angle = Math.acos(clampedCosAngle);

		// Return curvature (higher value = sharper curve)
		return angle / Math.PI;
	};

	// Apply smoothing to a path by adding control points
	const smoothPath = (
		pathPoints: Point[],
		smoothingFactor: number,
	): Point[] => {
		if (pathPoints.length < 3) return pathPoints;

		const smoothed = [...pathPoints];

		// Don't modify the first and last points
		for (let i = 1; i < smoothed.length - 1; i++) {
			const prev = smoothed[i - 1];
			const current = smoothed[i];
			const next = smoothed[i + 1];

			// Calculate control points
			const dx1 = current.x - prev.x;
			const dy1 = current.y - prev.y;
			const dx2 = next.x - current.x;
			const dy2 = next.y - current.y;

			// Distance between points
			const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
			const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

			// Normalized direction vectors
			const nx1 = len1 > 0 ? dx1 / len1 : 0;
			const ny1 = len1 > 0 ? dy1 / len1 : 0;
			const nx2 = len2 > 0 ? dx2 / len2 : 0;
			const ny2 = len2 > 0 ? dy2 / len2 : 0;

			// Control point distances (adjusted by smoothing factor)
			const dist1 = len1 * smoothingFactor;
			const dist2 = len2 * smoothingFactor;

			// Add control points to the current point
			current.controlPoint1 = {
				x: current.x - nx1 * dist1,
				y: current.y - ny1 * dist1,
			};

			current.controlPoint2 = {
				x: current.x + nx2 * dist2,
				y: current.y + ny2 * dist2,
			};
		}

		// Add control point to the first point
		if (smoothed.length > 1) {
			const first = smoothed[0];
			const second = smoothed[1];

			const dx = second.x - first.x;
			const dy = second.y - first.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			const nx = len > 0 ? dx / len : 0;
			const ny = len > 0 ? dy / len : 0;

			first.controlPoint2 = {
				x: first.x + nx * len * smoothingFactor,
				y: first.y + ny * len * smoothingFactor,
			};
		}

		// Add control point to the last point
		if (smoothed.length > 1) {
			const last = smoothed[smoothed.length - 1];
			const secondLast = smoothed[smoothed.length - 2];

			const dx = last.x - secondLast.x;
			const dy = last.y - secondLast.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			const nx = len > 0 ? dx / len : 0;
			const ny = len > 0 ? dy / len : 0;

			last.controlPoint1 = {
				x: last.x - nx * len * smoothingFactor,
				y: last.y - ny * len * smoothingFactor,
			};
		}

		return smoothed;
	};

	// Handle zooming with mouse wheel or keyboard shortcuts
	const handleZoom = (
		e: React.WheelEvent | { deltaY: number; clientX: number; clientY: number },
	) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Determine zoom direction and calculate new scale
		const delta = e.deltaY < 0 ? 1.1 : 0.9;
		const newScale = Math.min(Math.max(0.1, scale * delta), 10);

		// Get mouse position relative to canvas
		const rect = canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Calculate new offset to zoom toward mouse position
		const newOffset = {
			x: mouseX - (mouseX - offset.x) * (newScale / scale),
			y: mouseY - (mouseY - offset.y) * (newScale / scale),
		};

		setScale(newScale);
		setOffset(newOffset);
	};

	// Add this function to handle keyboard shortcuts
	const handleKeyDown = (e: KeyboardEvent) => {
		// Space + drag for panning
		if (e.code === "Space" && !isPanning) {
			document.body.style.cursor = "grab";
			setIsPanning(true);
		}

		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
			if (e.shiftKey) {
				// Ctrl+Shift+Z or Cmd+Shift+Z for Redo
				if (historyIndex < history.length - 1) {
					e.preventDefault();
					redo();
				}
			} else {
				// Ctrl+Z or Cmd+Z for Undo
				if (historyIndex >= 0) {
					e.preventDefault();
					undo();
				}
			}
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
			// Ctrl+Y or Cmd+Y for Redo
			if (historyIndex < history.length - 1) {
				e.preventDefault();
				redo();
			}
		}

		// Zoom in with + or =
		if ((e.key === "+" || e.key === "=") && !e.ctrlKey && !e.metaKey) {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			handleZoom({
				deltaY: -100,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2,
			});
		}

		// Zoom out with -
		if (e.key === "-" && !e.ctrlKey && !e.metaKey) {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			handleZoom({
				deltaY: 100,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2,
			});
		}

		// Reset zoom with 0
		if (e.key === "0" && !e.ctrlKey && !e.metaKey) {
			setScale(1);
			setOffset({ x: 0, y: 0 });
		}

		// Tool shortcuts
		if (e.key.toLowerCase() === "v") {
			setCurrentTool("select");
		} else if (e.key.toLowerCase() === "p" && e.shiftKey) {
			setCurrentTool("pencil");
		} else if (e.key.toLowerCase() === "p" && !e.shiftKey) {
			setCurrentTool("pen");
		} else if (e.key === "a" && !e.ctrlKey && !e.metaKey) {
			setCurrentTool("add");
		} else if (e.key === "d" && !e.ctrlKey && !e.metaKey) {
			setCurrentTool("remove");
		}
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.code === "Space") {
			document.body.style.cursor = "default";
			setIsPanning(false);
		}
	};

	// Add this function to handle panning
	const startPanning = (e: React.MouseEvent | React.TouchEvent) => {
		if (isPanning) {
			setLastPanPoint({
				x: getClientX(e),
				y: getClientY(e),
			});
		} else if (!isDrawing) {
			startDrawing(e);
		}
	};

	const pan = (e: React.MouseEvent | React.TouchEvent) => {
		if (isPanning) {
			const currentPoint = {
				x: getClientX(e),
				y: getClientY(e),
			};

			setOffset({
				x: offset.x + (currentPoint.x - lastPanPoint.x),
				y: offset.y + (currentPoint.y - lastPanPoint.y),
			});

			setLastPanPoint(currentPoint);
		} else {
			draw(e);
		}
	};

	const stopPanning = () => {
		if (!isPanning) {
			stopDrawing();
		}
	};

	// Helper function to get the closest point on a segment to a given point
	const getClosestPointOnSegment = (p1: Point, p2: Point, p: Point) => {
		const dx = p2.x - p1.x;
		const dy = p2.y - p1.y;
		const d2 = dx * dx + dy * dy; // squared length of segment

		if (d2 === 0) return p1; // p1 and p2 are the same point

		// Calculate projection of point p onto the segment
		const t = Math.max(
			0,
			Math.min(1, ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / d2),
		);

		return {
			x: p1.x + t * dx,
			y: p1.y + t * dy,
		};
	};

	// Undo/Redo functions
	const undo = () => {
		if (historyIndex > 0) {
			setHistoryIndex(historyIndex - 1);
			setPoints(history[historyIndex - 1]);
		} else if (historyIndex === 0) {
			setHistoryIndex(-1);
			setPoints([]);
		}
	};

	const redo = () => {
		if (historyIndex < history.length - 1) {
			setHistoryIndex(historyIndex + 1);
			setPoints(history[historyIndex + 1]);
		}
	};

	// Clear the canvas
	const clearCanvas = () => {
		setPoints([]);
		setPencilPoints([]);
		setPendingPoint(null);
		setSelectedPointIndex(null);

		// Save to history
		const newHistory = history.slice(0, historyIndex + 1);
		setHistory([...newHistory, []]);
		setHistoryIndex(newHistory.length);
	};

	// Add control points to a selected point
	const addControlPoints = () => {
		if (selectedPointIndex === null) return;

		const updatedPoints = [...points];
		const selectedPoint = { ...updatedPoints[selectedPointIndex] };

		// Calculate control point positions based on neighboring points
		if (selectedPointIndex > 0 && selectedPointIndex < points.length - 1) {
			const prevPoint = points[selectedPointIndex - 1];
			const nextPoint = points[selectedPointIndex + 1];

			// Calculate direction vectors
			const dx1 = selectedPoint.x - prevPoint.x;
			const dy1 = selectedPoint.y - prevPoint.y;
			// Calculate direction vectors
			const dx2 = nextPoint.x - selectedPoint.x;
			const dy2 = nextPoint.y - selectedPoint.y;

			// Calculate distances
			const _dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
			const _dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

			// Set control points at 1/3 of the distance
			selectedPoint.controlPoint1 = {
				x: selectedPoint.x - dx1 / 3,
				y: selectedPoint.y - dy1 / 3,
			};

			selectedPoint.controlPoint2 = {
				x: selectedPoint.x + dx2 / 3,
				y: selectedPoint.y + dy2 / 3,
			};
		} else if (selectedPointIndex === 0 && points.length > 1) {
			// First point
			const nextPoint = points[1];
			const dx = nextPoint.x - selectedPoint.x;
			const dy = nextPoint.y - selectedPoint.y;

			selectedPoint.controlPoint2 = {
				x: selectedPoint.x + dx / 3,
				y: selectedPoint.y + dy / 3,
			};
		} else if (selectedPointIndex === points.length - 1 && points.length > 1) {
			// Last point
			const prevPoint = points[points.length - 2];
			const dx = selectedPoint.x - prevPoint.x;
			const dy = selectedPoint.y - prevPoint.y;

			selectedPoint.controlPoint1 = {
				x: selectedPoint.x - dx / 3,
				y: selectedPoint.y - dy / 3,
			};
		}

		updatedPoints[selectedPointIndex] = selectedPoint;
		setPoints(updatedPoints);

		// Save to history
		const newHistory = history.slice(0, historyIndex + 1);
		setHistory([...newHistory, updatedPoints]);
		setHistoryIndex(newHistory.length);
	};

	// Remove control points from a selected point
	const removeControlPoints = () => {
		if (selectedPointIndex === null) return;

		const updatedPoints = [...points];
		const selectedPoint = { ...updatedPoints[selectedPointIndex] };

		// Remove control points
		selectedPoint.controlPoint1 = undefined;
		selectedPoint.controlPoint2 = undefined;

		updatedPoints[selectedPointIndex] = selectedPoint;
		setPoints(updatedPoints);

		// Save to history
		const newHistory = history.slice(0, historyIndex + 1);
		setHistory([...newHistory, updatedPoints]);
		setHistoryIndex(newHistory.length);
	};

	// Toggle showing control points
	const toggleControlPoints = () => {
		setShowControlPoints(!showControlPoints);
	};

	// Add this effect to set up keyboard event listeners
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [scale, offset, isPanning, currentTool]);

	// Handle mouse/touch events
	const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		// Apply inverse transformation to get the correct coordinates in the zoomed/panned space
		const x = (getClientX(e) - rect.left - offset.x) / scale;
		const y = (getClientY(e) - rect.top - offset.y) / scale;

		if (currentTool === "pencil") {
			setIsDrawing(true);
			setPencilPoints([{ x, y }]);
		} else if (currentTool === "pen") {
			// In pen mode, we add a point on click
			if (!isDrawing) {
				// Start a new path if we don't have one
				if (points.length === 0) {
					const newPoint = { x, y };
					setPoints([newPoint]);

					// Save to history
					const newHistory = history.slice(0, historyIndex + 1);
					setHistory([...newHistory, [newPoint]]);
					setHistoryIndex(newHistory.length);
				} else {
					// Add a new point to the existing path
					const newPoint = { x, y };

					// If we have a pending point, use its position
					if (pendingPoint) {
						newPoint.x = pendingPoint.x;
						newPoint.y = pendingPoint.y;
					}

					// Add control points to the previous point and the new point
					const updatedPoints = [...points];
					const lastIndex = updatedPoints.length - 1;
					const lastPoint = updatedPoints[lastIndex];

					// Calculate the direction and distance
					const dx = newPoint.x - lastPoint.x;
					const dy = newPoint.y - lastPoint.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const _controlDistance = distance * 0.3; // 30% of the distance

					// Add control point to the last point
					lastPoint.controlPoint2 = {
						x: lastPoint.x + dx / 3,
						y: lastPoint.y + dy / 3,
					};

					// @ts-ignore
					// Add control point to the new point
					newPoint.controlPoint1 = {
						x: newPoint.x - dx / 3,
						y: newPoint.y - dy / 3,
					};

					updatedPoints[lastIndex] = lastPoint;
					updatedPoints.push(newPoint);

					setPoints(updatedPoints);

					// Save to history
					const newHistory = history.slice(0, historyIndex + 1);
					setHistory([...newHistory, [...updatedPoints]]);
					setHistoryIndex(newHistory.length);
				}

				// Clear pending point
				setPendingPoint(null);
			}
		} else if (currentTool === "select") {
			// Check if we're clicking on a point or control point
			for (let i = 0; i < points.length; i++) {
				const point = points[i];

				// Check anchor point
				const distToAnchor = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
				if (distToAnchor < 10 / scale) {
					// Adjust selection radius for zoom
					setSelectedPointIndex(i);
					setDraggingPointType("point");
					setIsDrawing(true);
					return;
				}

				// Check control points
				if (point.controlPoint1) {
					const distToControl1 = Math.sqrt(
						(point.controlPoint1.x - x) ** 2 + (point.controlPoint1.y - y) ** 2,
					);
					if (distToControl1 < 10 / scale) {
						// Adjust selection radius for zoom
						setSelectedPointIndex(i);
						setDraggingPointType("control1");
						setIsDrawing(true);
						return;
					}
				}

				if (point.controlPoint2) {
					const distToControl2 = Math.sqrt(
						(point.controlPoint2.x - x) ** 2 + (point.controlPoint2.y - y) ** 2,
					);
					if (distToControl2 < 10 / scale) {
						// Adjust selection radius for zoom
						setSelectedPointIndex(i);
						setDraggingPointType("control2");
						setIsDrawing(true);
						return;
					}
				}
			}

			// If we didn't click on any point, deselect
			setSelectedPointIndex(null);
			setDraggingPointType(null);
		} else if (currentTool === "add") {
			// Add a new point to the closest segment
			if (points.length >= 2) {
				let closestSegmentIndex = -1;
				let closestDistance = Number.POSITIVE_INFINITY;
				let closestPoint = { x: 0, y: 0 };

				// Find the closest segment
				for (let i = 0; i < points.length - 1; i++) {
					const p1 = points[i];
					const p2 = points[i + 1];

					// Calculate the closest point on the segment to (x, y)
					const closestOnSegment = getClosestPointOnSegment(p1, p2, { x, y });
					const distance = Math.sqrt(
						(closestOnSegment.x - x) ** 2 + (closestOnSegment.y - y) ** 2,
					);

					if (distance < closestDistance) {
						closestDistance = distance;
						closestSegmentIndex = i;
						closestPoint = closestOnSegment;
					}
				}

				// If we found a close enough segment, add a point
				if (closestDistance < 10 / scale && closestSegmentIndex >= 0) {
					// Adjust selection radius for zoom
					const newPoint = {
						x: closestPoint.x,
						y: closestPoint.y,
					};

					// Add control points based on the segment
					const p1 = points[closestSegmentIndex];
					const p2 = points[closestSegmentIndex + 1];

					// Calculate the direction and distance
					const dx = p2.x - p1.x;
					const dy = p2.y - p1.y;
					const segmentLength = Math.sqrt(dx * dx + dy * dy);
					const t =
						((newPoint.x - p1.x) * dx + (newPoint.y - p1.y) * dy) /
						(segmentLength * segmentLength);

					// Add control points
					if (p1.controlPoint2 && p2.controlPoint1) {
						// Interpolate control points
						// @ts-ignore
						newPoint.controlPoint1 = {
							x: (1 - t) * p1.controlPoint2.x + t * p2.controlPoint1.x,
							y: (1 - t) * p1.controlPoint2.y + t * p2.controlPoint1.y,
						};

						// @ts-ignore
						newPoint.controlPoint2 = {
							x: (1 - t) * p1.controlPoint2.x + t * p2.controlPoint1.x,
							y: (1 - t) * p1.controlPoint2.y + t * p2.controlPoint1.y,
						};
					}

					// Insert the new point
					const updatedPoints = [
						...points.slice(0, closestSegmentIndex + 1),
						newPoint,
						...points.slice(closestSegmentIndex + 1),
					];

					setPoints(updatedPoints);

					// Save to history
					const newHistory = history.slice(0, historyIndex + 1);
					setHistory([...newHistory, updatedPoints]);
					setHistoryIndex(newHistory.length);
				}
			}
		} else if (currentTool === "remove") {
			// Remove a point if clicked
			for (let i = 0; i < points.length; i++) {
				const point = points[i];
				const distToPoint = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);

				if (distToPoint < 10 / scale) {
					// Adjust selection radius for zoom
					// Don't remove if we only have 2 or fewer points
					if (points.length <= 2) return;

					const updatedPoints = [...points];
					updatedPoints.splice(i, 1);

					setPoints(updatedPoints);

					// Save to history
					const newHistory = history.slice(0, historyIndex + 1);
					setHistory([...newHistory, updatedPoints]);
					setHistoryIndex(newHistory.length);
					break;
				}
			}
		}
	};

	const draw = (e: React.MouseEvent | React.TouchEvent) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		// Apply inverse transformation to get the correct coordinates in the zoomed/panned space
		const x = (getClientX(e) - rect.left - offset.x) / scale;
		const y = (getClientY(e) - rect.top - offset.y) / scale;

		if (currentTool === "pencil") {
			if (isDrawing) {
				// Add the point without throttling to capture more detail
				setPencilPoints((prev) => [...prev, { x, y }]);
			}
		} else if (currentTool === "pen") {
			// Update the pending point position
			setPendingPoint({ x, y });
		} else if (
			currentTool === "select" ||
			currentTool === "add" ||
			currentTool === "remove"
		) {
			// Handle hover effects
			if (!isDrawing) {
				let foundHover = false;
				let foundControlHover = false;

				// Check if hovering over any point or control point
				for (let i = 0; i < points.length; i++) {
					const point = points[i];

					// Check anchor point
					const distToAnchor = Math.sqrt(
						(point.x - x) ** 2 + (point.y - y) ** 2,
					);
					if (distToAnchor < 10 / scale) {
						// Adjust hover radius for zoom
						setHoverPointIndex(i);
						setHoverControlPoint(null);
						foundHover = true;
						break;
					}

					// Check control points
					if (point.controlPoint1) {
						const distToControl1 = Math.sqrt(
							(point.controlPoint1.x - x) ** 2 +
								(point.controlPoint1.y - y) ** 2,
						);
						if (distToControl1 < 10 / scale) {
							// Adjust hover radius for zoom
							setHoverPointIndex(i);
							setHoverControlPoint("control1");
							foundHover = true;
							foundControlHover = true;
							break;
						}
					}

					if (point.controlPoint2) {
						const distToControl2 = Math.sqrt(
							(point.controlPoint2.x - x) ** 2 +
								(point.controlPoint2.y - y) ** 2,
						);
						if (distToControl2 < 10 / scale) {
							// Adjust hover radius for zoom
							setHoverPointIndex(i);
							setHoverControlPoint("control2");
							foundHover = true;
							foundControlHover = true;
							break;
						}
					}
				}

				if (!foundHover) {
					setHoverPointIndex(null);
				}

				if (!foundControlHover) {
					setHoverControlPoint(null);
				}
			}

			// Handle dragging points
			if (
				isDrawing &&
				selectedPointIndex !== null &&
				draggingPointType !== null
			) {
				const updatedPoints = [...points];
				const selectedPoint = { ...updatedPoints[selectedPointIndex] };

				if (draggingPointType === "point") {
					// Calculate the movement delta
					const dx = x - selectedPoint.x;
					const dy = y - selectedPoint.y;

					// Move the anchor point
					selectedPoint.x = x;
					selectedPoint.y = y;

					// Move the control points with the anchor
					if (selectedPoint.controlPoint1) {
						selectedPoint.controlPoint1.x += dx;
						selectedPoint.controlPoint1.y += dy;
					}

					if (selectedPoint.controlPoint2) {
						selectedPoint.controlPoint2.x += dx;
						selectedPoint.controlPoint2.y += dy;
					}
				} else if (draggingPointType === "control1") {
					// Move control point 1
					if (selectedPoint.controlPoint1) {
						selectedPoint.controlPoint1.x = x;
						selectedPoint.controlPoint1.y = y;
					}
				} else if (draggingPointType === "control2") {
					// Move control point 2
					if (selectedPoint.controlPoint2) {
						selectedPoint.controlPoint2.x = x;
						selectedPoint.controlPoint2.y = y;
					}
				}

				updatedPoints[selectedPointIndex] = selectedPoint;
				setPoints(updatedPoints);
			}
		}
	};

	const stopDrawing = () => {
		if (currentTool === "pencil" && isDrawing && pencilPoints.length > 1) {
			// Apply the improved simplification algorithm to get fewer, more strategic points
			let processedPoints = simplifyPath(pencilPoints, simplifyTolerance);

			// Only apply smoothing if we have enough points and smoothing is enabled
			if (smoothing > 0 && processedPoints.length >= 3) {
				processedPoints = smoothPath(processedPoints, smoothing);
			}

			// Set the points
			setPoints(processedPoints);

			// Save to history
			const newHistory = history.slice(0, historyIndex + 1);
			setHistory([...newHistory, processedPoints]);
			setHistoryIndex(newHistory.length);

			// Clear raw points
			setPencilPoints([]);
		} else if (
			isDrawing &&
			(currentTool === "select" || currentTool === "pen")
		) {
			// Save to history when editing is done
			const newHistory = history.slice(0, historyIndex + 1);
			setHistory([...newHistory, [...points]]);
			setHistoryIndex(newHistory.length);
		}

		setIsDrawing(false);
		setDraggingPointType(null);
	};

	// Helper functions for touch/mouse events
	const getClientX = (e: React.MouseEvent | React.TouchEvent): number => {
		if ("touches" in e) {
			return e.touches[0].clientX;
		}
		return e.clientX;
	};

	const getClientY = (e: React.MouseEvent | React.TouchEvent): number => {
		if ("touches" in e) {
			return e.touches[0].clientY;
		}
		return e.clientY;
	};

	return (
		<TooltipProvider>
			<div className="h-full space-y-2">
				<div className="flex flex-wrap items-center justify-between">
					<div className="space-x-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={undo}
									disabled={historyIndex < 0}
								>
									<Undo className="mr-1 h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Undo</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={redo}
									disabled={historyIndex >= history.length - 1}
								>
									<Redo className="mr-1 h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Redo</TooltipContent>
						</Tooltip>
					</div>

					<ToggleGroup
						type="single"
						value={currentTool}
						onValueChange={(value) =>
							value && setCurrentTool(value as DrawingTool)
						}
					>
						<ToggleGroupItem value="select" aria-label="Select tool">
							<Tooltip>
								<TooltipTrigger asChild>
									<MousePointer className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent>Select (V)</TooltipContent>
							</Tooltip>
						</ToggleGroupItem>

						<ToggleGroupItem value="pen" aria-label="Pen tool">
							<Tooltip>
								<TooltipTrigger asChild>
									<Pen className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent>Pen (P)</TooltipContent>
							</Tooltip>
						</ToggleGroupItem>

						<ToggleGroupItem value="pencil" aria-label="Pencil tool">
							<Tooltip>
								<TooltipTrigger asChild>
									<Pencil className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent>Pencil (Shift+P)</TooltipContent>
							</Tooltip>
						</ToggleGroupItem>

						<ToggleGroupItem value="add" aria-label="Add point">
							<Tooltip>
								<TooltipTrigger asChild>
									<Plus className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent>Add Point (A)</TooltipContent>
							</Tooltip>
						</ToggleGroupItem>

						<ToggleGroupItem value="remove" aria-label="Remove point">
							<Tooltip>
								<TooltipTrigger asChild>
									<Minus className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent>Remove Point (D)</TooltipContent>
							</Tooltip>
						</ToggleGroupItem>
					</ToggleGroup>
					<div className="flex items-center gap-2">
						{/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const rect = canvas.getBoundingClientRect()
                    handleZoom({
                      deltaY: -100,
                      clientX: rect.left + rect.width / 2,
                      clientY: rect.top + rect.height / 2,
                    })
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (+)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const canvas = canvasRef.current
                    if (!canvas) return
                    const rect = canvas.getBoundingClientRect()
                    handleZoom({
                      deltaY: 100,
                      clientX: rect.left + rect.width / 2,
                      clientY: rect.top + rect.height / 2,
                    })
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (-)</TooltipContent>
            </Tooltip> */}

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setScale(1);
										setOffset({ x: 0, y: 0 });
									}}
								>
									<span className="font-bold text-xs">1:1</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Reset View (0)</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="destructive" size="sm" onClick={clearCanvas}>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Clear Canvas</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button onClick={savePath} variant="outline" size="sm">
									<Save className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Save Path</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<CopyToClipboard
									classname="relative top-0 h-9 ml-2  w-fit px-2 flex"
									text={currentPath}
								>
									Svg Path
								</CopyToClipboard>
							</TooltipTrigger>
							<TooltipContent>Copy Path</TooltipContent>
						</Tooltip>
					</div>
				</div>

				{currentTool === "pencil" && (
					<div className="flex w-full justify-between gap-8 space-y-2 rounded-lg bg-main px-2 py-1">
						<div className="w-full">
							<Label htmlFor="smoothing">
								Smoothing: {smoothing.toFixed(2)}
							</Label>
							<CustomSlider
								id="smoothing"
								min={0}
								max={1}
								step={0.05}
								value={[smoothing]}
								onValueChange={(value) => setSmoothing(value[0])}
							/>
						</div>
						<div className="w-full">
							<Label htmlFor="simplifyTolerance">
								Point Reduction: {simplifyTolerance.toFixed(1)}
							</Label>
							<CustomSlider
								id="simplifyTolerance"
								min={1}
								max={10}
								step={0.5}
								value={[simplifyTolerance]}
								onValueChange={(value) => setSimplifyTolerance(value[0])}
							/>
						</div>
					</div>
				)}

				{currentTool === "select" && selectedPointIndex !== null && (
					<div className="flex space-x-2">
						<Button variant="outline" size="sm" onClick={addControlPoints}>
							Add Handles
						</Button>
						<Button variant="outline" size="sm" onClick={removeControlPoints}>
							Remove Handles
						</Button>
						<Button variant="outline" size="sm" onClick={toggleControlPoints}>
							{showControlPoints ? "Hide Handles" : "Show Handles"}
						</Button>
					</div>
				)}

				<div className="relative h-[80%] overflow-hidden rounded-lg border bg-main">
					<div className="-z-0 absolute top-0 right-0 bottom-0 left-0 rounded-xl bg-[radial-gradient(#79797960_1px,#f3f4f6_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(#ffffff33_1px,#000000_1px)] " />

					<canvas
						ref={canvasRef}
						onMouseDown={isPanning ? startPanning : startDrawing}
						onMouseMove={isPanning ? pan : draw}
						onMouseUp={isPanning ? stopPanning : stopDrawing}
						onMouseLeave={isPanning ? stopPanning : stopDrawing}
						onTouchStart={isPanning ? startPanning : startDrawing}
						onTouchMove={isPanning ? pan : draw}
						onTouchEnd={isPanning ? stopPanning : stopDrawing}
						onWheel={handleZoom}
						className={`relative z-[2] h-full w-full touch-none ${
							isPanning
								? "cursor-grab"
								: currentTool === "pencil"
									? "cursor-crosshair"
									: currentTool === "pen"
										? "cursor-cell"
										: currentTool === "add"
											? "cursor-copy"
											: currentTool === "remove"
												? "cursor-not-allowed"
												: "cursor-default"
						}`}
					/>
					<div className="absolute right-2 bottom-2 rounded-md bg-background/80 px-2 py-1 font-mono text-foreground text-xs">
						{Math.round(scale * 100)}%
					</div>
				</div>

				<p className="text-primary text-xs">
					{currentTool === "pencil"
						? "Pencil tool: Draw freely with your mouse or finger. Adjust smoothing and point reduction for better curves with fewer control points."
						: currentTool === "pen"
							? "Pen tool: Click to add points with Bezier curve handles for smooth curves."
							: currentTool === "select"
								? "Select tool: Click on points or handles to select and drag them to adjust the path."
								: currentTool === "add"
									? "Add point tool: Click on a path segment to add a new point."
									: "Remove point tool: Click on a point to remove it from the path."}
				</p>
				<p className="mt-1 text-muted-foreground text-xs">
					Zoom: Use mouse wheel, + and - keys, or the zoom buttons. Pan: Hold
					Space + drag. Reset view: Press 0.
				</p>
			</div>
		</TooltipProvider>
	);
}
