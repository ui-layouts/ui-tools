"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Move, Redo, Save, Undo, X, ZoomIn, ZoomOut } from "lucide-react";
import { useQueryState } from "nuqs";
import type React from "react";
import { useEffect, useRef, useState } from "react";
interface ControlPoint {
	x: number;
	y: number;
	command: string;
	isControl: boolean;
}

interface SvgEditorProps {
	setShowSaveDialog: (arg0: boolean) => void;
	path: string;
	onPathChange: (path: string) => void;
	onClose: () => void;
	strokeColor?: string;
	strokeWidth?: number;
}

export function SvgEditor({
	setShowSaveDialog,
	path,
	onPathChange,
	onClose,
	strokeColor = "#000000",
	strokeWidth = 2,
}: SvgEditorProps) {
	const editorRef = useRef<SVGSVGElement>(null);
	const [exampleViewBox] = useQueryState("viewBox", {
		defaultValue: "0 0 250 100",
	});
	const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
	const [draggedPointIndex, setDraggedPointIndex] = useState<number>(-1);
	const [currentEditPath, setCurrentEditPath] = useState<string>(path);
	const [controlPointsHistory, setControlPointsHistory] = useState<
		ControlPoint[][]
	>([]);
	const [historyIndex, setHistoryIndex] = useState<number>(-1);
	const [zoomLevel, setZoomLevel] = useState<number>(1);
	const [hoverPointIndex, setHoverPointIndex] = useState<number | null>(null);
	const [isPanning, setIsPanning] = useState(false);
	const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
	const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
	const [error, setError] = useState<string | null>(null);
	const [debugInfo, setDebugInfo] = useState<string>("");
	const isInternalChange = useRef(false);

	// Initialize editor with the provided path
	useEffect(() => {
		if (path) {
			try {
				console.log("Parsing path:", path);
				isInternalChange.current = false;

				const points = parseSvgPath(path);
				console.log("Parsed points:", points);

				if (points.length === 0) {
					setError(
						"Could not parse any points from the path. Please check the path data.",
					);
				} else {
					setError(null);
					// Add control points to all anchor points automatically
					const pointsWithControls = addControlPointsToAllAnchors(points);
					setControlPoints(pointsWithControls);
					setControlPointsHistory([pointsWithControls]);
					setHistoryIndex(0);
				}

				setCurrentEditPath(path); // Ensure current edit path is set
			} catch (error) {
				console.error("Error parsing SVG path:", error);
				setError(
					`Error parsing path: ${
						error instanceof Error ? error.message : String(error)
					}`,
				);
				// If parsing fails, at least set the current edit path
				setCurrentEditPath(path);
			}
		}
	}, [path]);

	// Add control points to all anchor points
	const addControlPointsToAllAnchors = (
		points: ControlPoint[],
	): ControlPoint[] => {
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
	};

	// Update the current edit path whenever control points change
	useEffect(() => {
		if (controlPoints.length > 0) {
			try {
				const newPath = pointsToSvgPath(controlPoints);
				if (newPath !== currentEditPath) {
					setCurrentEditPath(newPath);
					// Don't call onPathChange here - this was causing the infinite loop
					if (isInternalChange.current) {
						onPathChange(newPath);
					}
				}
			} catch (error) {
				console.error("Error generating path from points:", error);
			}
		}
	}, [controlPoints, currentEditPath]);

	// Start dragging a point
	const startDrag = (index: number, e: React.MouseEvent) => {
		e.stopPropagation();
		setDraggedPointIndex(index);
		const pointType = controlPoints[index].isControl
			? "control (red)"
			: "anchor (blue)";
		setDebugInfo(`Started dragging ${pointType} point at index ${index}`);
	};

	// Handle mouse move during point drag
	const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
		if (!editorRef.current) return;

		const svg = editorRef.current;
		const CTM = svg.getScreenCTM();
		if (!CTM) return;

		// Get mouse position in screen coordinates
		const clientX = e.clientX;
		const clientY = e.clientY;

		// Handle panning
		if (isPanning) {
			const dx = (clientX - startPanPosition.x) / CTM.a;
			const dy = (clientY - startPanPosition.y) / CTM.d;

			setPanOffset({
				x: panOffset.x + dx,
				y: panOffset.y + dy,
			});

			setStartPanPosition({
				x: clientX,
				y: clientY,
			});

			return;
		}

		// Handle point dragging
		if (draggedPointIndex === -1) return;

		// This is an internal change due to user interaction
		isInternalChange.current = true;

		// Calculate the new position in SVG coordinates
		// This is the key fix - properly inverting the transformation matrix
		const pt = new DOMPoint(clientX, clientY);
		const svgPoint = pt.matrixTransform(CTM.inverse());

		// Apply pan offset correctly
		const newX = svgPoint.x / zoomLevel - panOffset.x / zoomLevel;
		const newY = svgPoint.y / zoomLevel - panOffset.y / zoomLevel;

		// Ensure we don't set NaN values
		if (Number.isNaN(newX) || Number.isNaN(newY)) return;

		setDebugInfo(
			`Dragging point ${draggedPointIndex} to ${newX.toFixed(
				2,
			)}, ${newY.toFixed(2)}`,
		);

		setControlPoints((prev) => {
			const newPoints = [...prev];
			if (!newPoints[draggedPointIndex]) return prev;

			// Get the current point
			const currentPoint = { ...newPoints[draggedPointIndex] };

			// Calculate movement delta
			const dx = newX - currentPoint.x;
			const dy = newY - currentPoint.y;

			// Update the point position
			currentPoint.x = newX;
			currentPoint.y = newY;
			newPoints[draggedPointIndex] = currentPoint;

			// If this is an anchor point, also move its control points
			if (!currentPoint.isControl) {
				// Find and move control points associated with this anchor
				// Look for control points before this anchor
				if (
					draggedPointIndex > 0 &&
					newPoints[draggedPointIndex - 1].isControl
				) {
					newPoints[draggedPointIndex - 1].x += dx;
					newPoints[draggedPointIndex - 1].y += dy;

					// Check for a second control point
					if (
						draggedPointIndex > 1 &&
						newPoints[draggedPointIndex - 2].isControl
					) {
						newPoints[draggedPointIndex - 2].x += dx;
						newPoints[draggedPointIndex - 2].y += dy;
					}
				}

				// Look for control points after this anchor
				if (
					draggedPointIndex < newPoints.length - 1 &&
					newPoints[draggedPointIndex + 1].isControl
				) {
					newPoints[draggedPointIndex + 1].x += dx;
					newPoints[draggedPointIndex + 1].y += dy;

					// Check for a second control point
					if (
						draggedPointIndex < newPoints.length - 2 &&
						newPoints[draggedPointIndex + 2].isControl
					) {
						newPoints[draggedPointIndex + 2].x += dx;
						newPoints[draggedPointIndex + 2].y += dy;
					}
				}
			}
			return newPoints;
		});
	};

	// End dragging a point and save to history
	const endDrag = () => {
		if (draggedPointIndex !== -1) {
			setDebugInfo(`Ended dragging point ${draggedPointIndex}`);

			isInternalChange.current = true;

			// Save the current state to history when a drag operation ends
			setControlPointsHistory((prev) => {
				// Remove any "future" history if we've gone back in time
				const newHistory = prev.slice(0, historyIndex + 1);
				// Add the current state
				return [...newHistory, [...controlPoints]];
			});
			setHistoryIndex((prev) => prev + 1);

			setTimeout(() => {
				isInternalChange.current = false;
			}, 0);
		}
		setDraggedPointIndex(-1);
		setIsPanning(false);
	};

	// Start panning
	const startPan = (e: React.MouseEvent<SVGSVGElement>) => {
		// Only start panning if we're not already dragging a point
		if (
			draggedPointIndex === -1 &&
			(e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey))
		) {
			e.preventDefault();
			setIsPanning(true);
			setStartPanPosition({
				x: e.clientX,
				y: e.clientY,
			});
			setDebugInfo("Started panning");
		}
	};

	// Handle zoom
	const _handleZoom = (direction: "in" | "out") => {
		if (direction === "in") {
			setZoomLevel((prev) => Math.min(prev * 1.2, 5));
		} else {
			setZoomLevel((prev) => Math.max(prev / 1.2, 0.5));
		}
	};

	// Handle undo
	const handleUndo = () => {
		if (historyIndex > 0) {
			isInternalChange.current = true;
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			setControlPoints(controlPointsHistory[newIndex]);

			setTimeout(() => {
				isInternalChange.current = false;
			}, 0);
		}
	};

	// Handle redo
	const handleRedo = () => {
		if (historyIndex < controlPointsHistory.length - 1) {
			isInternalChange.current = true;
			const newIndex = historyIndex + 1;
			setHistoryIndex(newIndex);
			setControlPoints(controlPointsHistory[newIndex]);

			setTimeout(() => {
				isInternalChange.current = false;
			}, 0);
		}
	};

	// Add a new anchor point between two existing points
	const _addPoint = (index: number) => {
		if (index < 0 || index >= controlPoints.length - 1) return;

		const p1 = controlPoints[index];
		const p2 = controlPoints[index + 1];

		// If both points are anchors, add a new anchor in between
		if (!p1.isControl && !p2.isControl) {
			isInternalChange.current = true;

			const newPoint: ControlPoint = {
				x: (p1.x + p2.x) / 2,
				y: (p1.y + p2.y) / 2,
				command: "L",
				isControl: false,
			};

			const newPoints = [
				...controlPoints.slice(0, index + 1),
				newPoint,
				...controlPoints.slice(index + 1),
			];

			setControlPoints(newPoints);
			setControlPointsHistory((prev) => [
				...prev.slice(0, historyIndex + 1),
				newPoints,
			]);
			setHistoryIndex((prev) => prev + 1);

			setTimeout(() => {
				isInternalChange.current = false;
			}, 0);
		}
	};

	// Remove a point
	const removePoint = (index: number) => {
		if (controlPoints.length <= 2 || index < 0 || index >= controlPoints.length)
			return;

		// Don't remove if it's a control point (remove the whole curve instead)
		if (controlPoints[index].isControl) return;
		isInternalChange.current = true;
		const newPoints = controlPoints.filter((_, i) => i !== index);
		setControlPoints(newPoints);
		setControlPointsHistory((prev) => [
			...prev.slice(0, historyIndex + 1),
			newPoints,
		]);
		setHistoryIndex((prev) => prev + 1);

		setTimeout(() => {
			isInternalChange.current = false;
		}, 0);
	};

	// Handle hover effects
	const handleMouseOver = (index: number) => {
		setHoverPointIndex(index);
	};

	const handleMouseOut = () => {
		setHoverPointIndex(null);
	};

	// Save the current path
	const savePath = () => {
		// Make sure we have a valid path to save
		if (currentEditPath) {
			// onPathChange(currentEditPath)
			// onClose()
			setShowSaveDialog(true);
		}
	};

	// Create a simple path if none exists
	const createDefaultPath = () => {
		const defaultPoints: ControlPoint[] = [
			{ x: 20, y: 50, command: "M", isControl: false },
			{ x: 40, y: 30, command: "L", isControl: false },
			{ x: 60, y: 70, command: "L", isControl: false },
			{ x: 80, y: 50, command: "L", isControl: false },
		];

		const pointsWithControls = addControlPointsToAllAnchors(defaultPoints);
		setControlPoints(pointsWithControls);
		setControlPointsHistory([pointsWithControls]);
		setHistoryIndex(0);
		setError(null);
	};

	// Reset pan and zoom
	const resetView = () => {
		setPanOffset({ x: 0, y: 0 });
		setZoomLevel(1);
	};

	// Handle wheel zoom
	const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
		if (e.shiftKey || e.metaKey) {
			e.preventDefault();

			// Get mouse position relative to SVG
			const svg = editorRef.current;
			if (!svg) return;

			const CTM = svg.getScreenCTM();
			if (!CTM) return;

			// Calculate mouse position in SVG coordinates
			const mouseX = (e.clientX - CTM.e) / CTM.a;
			const mouseY = (e.clientY - CTM.f) / CTM.d;

			// Determine zoom direction and factor
			const direction = e.deltaY < 0 ? "in" : "out";
			const factor = direction === "in" ? 1.2 : 0.8;

			// Calculate new zoom level
			const newZoomLevel = Math.min(Math.max(zoomLevel * factor, 0.1), 6);

			// Calculate new pan offset to zoom toward/from mouse position
			const newPanOffsetX =
				mouseX - (mouseX - panOffset.x) * (newZoomLevel / zoomLevel);
			const newPanOffsetY =
				mouseY - (mouseY - panOffset.y) * (newZoomLevel / zoomLevel);

			// Update state
			setZoomLevel(newZoomLevel);
			setPanOffset({
				x: newPanOffsetX,
				y: newPanOffsetY,
			});

			// Show zoom level feedback
			setDebugInfo(`Zoom level: ${newZoomLevel.toFixed(2)}x`);

			// Clear debug info after a delay
			setTimeout(() => {
				setDebugInfo("");
			}, 1000);
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Check if the editor is active and visible
			if (!editorRef.current) return;

			// Handle Ctrl+Z for undo
			if (e.ctrlKey && e.key === "z") {
				e.preventDefault();
				handleUndo();
			}

			// Handle Ctrl+Y or Ctrl+Shift+Z for redo
			if (
				(e.ctrlKey && e.key === "y") ||
				(e.ctrlKey && e.shiftKey && e.key === "z")
			) {
				e.preventDefault();
				handleRedo();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [historyIndex, controlPointsHistory]); // Dependencies for undo/redo functionality

	return (
		<>
			<div className="flex h-full w-full max-w-full flex-col rounded-lg border bg-card-bg shadow-lg">
				<div className="flex items-center justify-between border-b p-2">
					<div>
						{/* <h2 className="text-xl font-semibold">Edit SVG Path</h2> */}
						<p className="text-primary text-xs">
							Path length: {currentEditPath.length} characters
						</p>
						<p className="text-blue-500 text-xs">{debugInfo && debugInfo}</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleUndo}
							disabled={historyIndex <= 0}
						>
							<Undo className="mr-1 h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleRedo}
							disabled={historyIndex >= controlPointsHistory.length - 1}
						>
							<Redo className="mr-1 h-4 w-4" />
						</Button>
						{/* <Button variant="outline" size="sm" onClick={() => handleZoom("in")}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleZoom("out")}>
              <ZoomOut className="h-4 w-4" />
            </Button> */}
						<Button variant="outline" size="sm" onClick={resetView}>
							<Move className="h-4 w-4" />
						</Button>
						<Button variant="default" size="sm" onClick={savePath}>
							<Save className="mr-1 h-4 w-4" /> Save
						</Button>
					</div>
				</div>

				<div className="relative h-full overflow-hidden">
					{error ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-main p-6">
							<div className="mb-4 max-w-md rounded-md border border-red-200 bg-red-50 p-4">
								<p className="text-red-800 text-sm">{error}</p>
							</div>
							<p className="mb-4 text-gray-600">Current path data:</p>
							<div className="mb-4 w-full max-w-md overflow-auto rounded border bg-gray-50 p-3">
								<code className="text-xs">{path || "No path data"}</code>
							</div>
							<Button onClick={createDefaultPath}>Create Default Path</Button>
						</div>
					) : (
						<div className="absolute inset-0 bg-main">
							<div className="absolute top-0 right-0 bottom-0 left-0 z-0 rounded-xl bg-[radial-gradient(#79797960_1px,#f3f4f6_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(#ffffff33_1px,#000000_1px)] " />
							{/* SVG editor */}
							<svg
								ref={editorRef}
								viewBox={exampleViewBox}
								className="relative z-10 h-full w-full"
								onMouseDown={startPan}
								onMouseMove={handleMouseMove}
								onMouseUp={endDrag}
								onMouseLeave={endDrag}
								onWheel={handleWheel}
								style={{ touchAction: "none" }}
								onContextMenu={(e) => e.preventDefault()}
								preserveAspectRatio="xMidYMid meet"
							>
								<title>SVG Editor</title>
								{/* Apply pan and zoom transformations */}
								<g
									transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
								>
									{/* Path outline */}
									<path
										d={currentEditPath}
										fill="none"
										stroke={strokeColor}
										strokeWidth={strokeWidth / zoomLevel}
									/>

									{/* Control points and anchor points */}
									{controlPoints.map((point, index) => {
										const isAnchor = !point.isControl;
										const isHovered = index === hoverPointIndex;
										const isDragging = index === draggedPointIndex;

										return (
											<g key={`point-${index}`}>
												{/* Draw control lines first */}
												{point.isControl &&
													(() => {
														// Find the anchor point this control point belongs to
														let anchorIndex = -1;

														// Look for the nearest non-control point before this one
														for (let i = index - 1; i >= 0; i--) {
															if (!controlPoints[i].isControl) {
																anchorIndex = i;
																break;
															}
														}

														// If we didn't find one before, look after
														if (anchorIndex === -1) {
															for (
																let i = index + 1;
																i < controlPoints.length;
																i++
															) {
																if (!controlPoints[i].isControl) {
																	anchorIndex = i;
																	break;
																}
															}
														}

														if (anchorIndex !== -1) {
															return (
																<line
																	x1={controlPoints[anchorIndex].x}
																	y1={controlPoints[anchorIndex].y}
																	x2={point.x}
																	y2={point.y}
																	stroke="#888"
																	strokeWidth={0.5 / zoomLevel}
																	strokeDasharray={`${1 / zoomLevel},${
																		1 / zoomLevel
																	}`}
																/>
															);
														}
														return null;
													})()}

												{/* Visible point */}
												{/* biome-ignore lint/a11y/useKeyWithMouseEvents: <explanation> */}
												<circle
													cx={point.x}
													cy={point.y}
													r={isAnchor ? 4 / zoomLevel : 3 / zoomLevel}
													fill={
														isAnchor
															? isDragging
																? "#4338ca" // Darker blue when dragging
																: isHovered
																	? "#4096ff" // Light blue when hovered
																	: "#1890ff" // Default blue
															: isDragging
																? "#e11d48" // Darker red when dragging
																: "#ff4d4f" // Default red for control points
													}
													stroke="white"
													strokeWidth={0.2 / zoomLevel}
													onMouseOver={() => handleMouseOver(index)}
													onMouseOut={handleMouseOut}
													onMouseDown={(e) => startDrag(index, e)}
													style={{ cursor: "move" }}
													onContextMenu={(e) => {
														e.preventDefault();
														removePoint(index);
													}}
												/>
											</g>
										);
									})}

									{/* Path segments - for adding new points */}
									{/* {controlPoints.map((point, index) => {
                    if (index < controlPoints.length - 1 && !point.isControl && !controlPoints[index + 1].isControl) {
                      return (
                        <line
                          key={`segment-${index}`}
                          x1={point.x}
                          y1={point.y}
                          x2={controlPoints[index + 1].x}
                          y2={controlPoints[index + 1].y}
                          stroke="transparent"
                          strokeWidth={8 / zoomLevel}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            addPoint(index)
                          }}
                          style={{ cursor: "crosshair" }}
                        />
                      )
                    }
                    return null
                  })} */}
								</g>
							</svg>
						</div>
					)}
				</div>

				<div className="border-t p-0 px-4 py-2">
					<div className="you know the main work of this timeline is basically by default it has 24 hours and whenever users suppose I start working today and whenever I click start working then it will record that okay and it will start is a pointer I mean the what it called green things okay or blue pointer uh suppose I start working at 8 p.m sorry 8 a.m then it will start from these and when I finished it then it will suppose I finish it at 5 p.m then it will go there to 5 p.m so in 24 hours I start working at 8 p.m to 5 p.m so it will calculate all that and definitely it will add breakers whenever I take breaks okay so that's what that means0 text-primary/9Do text-sm">
						{/* <p>
              <strong>Controls:</strong> Drag blue points to move anchors (control points move with them). Drag red
              points to adjust curves. Double-click on a line to add a new point. Right-click on a point to remove it.
            </p> */}
						<p>
							<strong>Navigation:</strong> Alt+drag or middle-click to pan.{" "}
							<kbd className="rounded border bg-primary/20 px-1 py-0.5 text-xs">
								Ctrl+Wheel
							</kbd>{" "}
							to zoom.
							<kbd className="ml-2 rounded border bg-primary/20 px-1 py-0.5 text-xs">
								Ctrl+Z
							</kbd>{" "}
							to undo,
							<kbd className="ml-1 rounded border bg-primary/20 px-1 py-0.5 text-xs">
								Ctrl+Y
							</kbd>{" "}
							to redo.
						</p>
						{/* {zoomLevel !== 1 && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Zoom: {zoomLevel.toFixed(1)}x
              </div>
            )} */}
					</div>
				</div>
			</div>
		</>
	);
}

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
			path += ` C${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}, ${points[
				i + 1
			].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}, ${points[i + 2].x.toFixed(
				2,
			)} ${points[i + 2].y.toFixed(2)}`;
			i += 3;
		} else if (
			i + 1 < points.length &&
			points[i].isControl &&
			!points[i + 1].isControl
		) {
			// Quadratic bezier curve
			path += ` Q${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}, ${points[
				i + 1
			].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}`;
			i += 2;
		} else {
			// Line to
			path += ` L${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
			i++;
		}
	}

	return path;
}
