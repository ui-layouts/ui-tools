"use client";

import type React from "react";

import { type RefObject, useCallback, useEffect, useState } from "react";
import {
	addControlPointsToAllAnchors,
	parseSvgPath,
	pointsToSvgPath,
} from "./svg-path-utils";
import type { ControlPoint, EditorState } from "./types";

export function useSvgEditor(
	path: string,
	editorRef: RefObject<SVGSVGElement>,
) {
	const [state, setState] = useState<EditorState>({
		controlPoints: [],
		draggedPointIndex: -1,
		currentEditPath: path,
		controlPointsHistory: [],
		historyIndex: -1,
		zoomLevel: 1,
		hoverPointIndex: null,
		isPanning: false,
		panOffset: { x: 0, y: 0 },
		startPanPosition: { x: 0, y: 0 },
		error: null,
		debugInfo: "",
	});

	// Initialize editor with the provided path
	useEffect(() => {
		if (path) {
			try {
				console.log("Parsing path:", path);
				const points = parseSvgPath(path);
				console.log("Parsed points:", points);

				if (points.length === 0) {
					setState((prev) => ({
						...prev,
						error:
							"Could not parse any points from the path. Please check the path data.",
						currentEditPath: path,
					}));
				} else {
					// Add control points to all anchor points automatically
					const pointsWithControls = addControlPointsToAllAnchors(points);
					setState((prev) => ({
						...prev,
						error: null,
						controlPoints: pointsWithControls,
						controlPointsHistory: [pointsWithControls],
						historyIndex: 0,
						currentEditPath: path,
					}));
				}
			} catch (error) {
				console.error("Error parsing SVG path:", error);
				setState((prev) => ({
					...prev,
					error: `Error parsing path: ${error instanceof Error ? error.message : String(error)}`,
					currentEditPath: path,
				}));
			}
		}
	}, [path]);

	// Update the current edit path whenever control points change
	useEffect(() => {
		if (state.controlPoints.length > 0) {
			try {
				const newPath = pointsToSvgPath(state.controlPoints);
				if (newPath !== state.currentEditPath) {
					setState((prev) => ({ ...prev, currentEditPath: newPath }));
				}
			} catch (error) {
				console.error("Error generating path from points:", error);
			}
		}
	}, [state.controlPoints]);

	// Start dragging a point
	const startDrag = useCallback(
		(index: number, e: React.MouseEvent) => {
			e.stopPropagation();
			const pointType = state.controlPoints[index].isControl
				? "control (red)"
				: "anchor (blue)";
			setState((prev) => ({
				...prev,
				draggedPointIndex: index,
				debugInfo: `Started dragging ${pointType} point at index ${index}`,
			}));
		},
		[state.controlPoints],
	);

	// Handle mouse move during point drag
	const handleMouseMove = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			if (!editorRef.current) return;

			const svg = editorRef.current;
			const CTM = svg.getScreenCTM();
			if (!CTM) return;

			setState((prev) => {
				// Handle panning
				if (prev.isPanning) {
					const dx = (e.clientX - prev.startPanPosition.x) / CTM.a;
					const dy = (e.clientY - prev.startPanPosition.y) / CTM.d;

					return {
						...prev,
						panOffset: {
							x: prev.panOffset.x + dx,
							y: prev.panOffset.y + dy,
						},
						startPanPosition: {
							x: e.clientX,
							y: e.clientY,
						},
					};
				}

				// Handle point dragging
				if (prev.draggedPointIndex === -1) return prev;

				// Calculate the new position in SVG coordinates
				const mouseX = (e.clientX - CTM.e) / CTM.a;
				const mouseY = (e.clientY - CTM.f) / CTM.d;

				// Apply pan offset
				const newX = mouseX - prev.panOffset.x;
				const newY = mouseY - prev.panOffset.y;

				// Ensure we don't set NaN values
				if (Number.isNaN(newX) || Number.isNaN(newY)) return prev;

				const newDebugInfo = `Dragging point ${prev.draggedPointIndex} to ${newX.toFixed(2)}, ${newY.toFixed(2)}`;

				// Update the control points
				const newPoints = [...prev.controlPoints];
				if (!newPoints[prev.draggedPointIndex]) return prev;

				// Get the current point
				const currentPoint = { ...newPoints[prev.draggedPointIndex] };

				// Calculate movement delta
				const dx = newX - currentPoint.x;
				const dy = newY - currentPoint.y;

				// Update the point position
				currentPoint.x = newX;
				currentPoint.y = newY;
				newPoints[prev.draggedPointIndex] = currentPoint;

				// If this is an anchor point, also move its control points
				if (!currentPoint.isControl) {
					// Find and move control points associated with this anchor
					// Look for control points before this anchor
					if (
						prev.draggedPointIndex > 0 &&
						newPoints[prev.draggedPointIndex - 1].isControl
					) {
						newPoints[prev.draggedPointIndex - 1].x += dx;
						newPoints[prev.draggedPointIndex - 1].y += dy;

						// Check for a second control point
						if (
							prev.draggedPointIndex > 1 &&
							newPoints[prev.draggedPointIndex - 2].isControl
						) {
							newPoints[prev.draggedPointIndex - 2].x += dx;
							newPoints[prev.draggedPointIndex - 2].y += dy;
						}
					}

					// Look for control points after this anchor
					if (
						prev.draggedPointIndex < newPoints.length - 1 &&
						newPoints[prev.draggedPointIndex + 1].isControl
					) {
						newPoints[prev.draggedPointIndex + 1].x += dx;
						newPoints[prev.draggedPointIndex + 1].y += dy;

						// Check for a second control point
						if (
							prev.draggedPointIndex < newPoints.length - 2 &&
							newPoints[prev.draggedPointIndex + 2].isControl
						) {
							newPoints[prev.draggedPointIndex + 2].x += dx;
							newPoints[prev.draggedPointIndex + 2].y += dy;
						}
					}
				}

				return {
					...prev,
					controlPoints: newPoints,
					debugInfo: newDebugInfo,
				};
			});
		},
		[editorRef],
	);

	// End dragging a point and save to history
	const endDrag = useCallback(() => {
		setState((prev) => {
			if (prev.draggedPointIndex !== -1) {
				const newDebugInfo = `Ended dragging point ${prev.draggedPointIndex}`;

				// Save the current state to history when a drag operation ends
				const newHistory = prev.controlPointsHistory.slice(
					0,
					prev.historyIndex + 1,
				);

				return {
					...prev,
					controlPointsHistory: [...newHistory, [...prev.controlPoints]],
					historyIndex: prev.historyIndex + 1,
					draggedPointIndex: -1,
					isPanning: false,
					debugInfo: newDebugInfo,
				};
			}

			return {
				...prev,
				draggedPointIndex: -1,
				isPanning: false,
			};
		});
	}, []);

	// Start panning
	const startPan = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		// Only start panning if we're not already dragging a point
		setState((prev) => {
			if (
				prev.draggedPointIndex === -1 &&
				(e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey))
			) {
				e.preventDefault();
				return {
					...prev,
					isPanning: true,
					startPanPosition: {
						x: e.clientX,
						y: e.clientY,
					},
					debugInfo: "Started panning",
				};
			}
			return prev;
		});
	}, []);

	// Handle zoom
	const handleZoom = useCallback((direction: "in" | "out") => {
		setState((prev) => {
			if (direction === "in") {
				return {
					...prev,
					zoomLevel: Math.min(prev.zoomLevel * 1.2, 5),
				};
			}
			return {
				...prev,
				zoomLevel: Math.max(prev.zoomLevel / 1.2, 0.5),
			};
		});
	}, []);

	// Handle wheel zoom
	const handleWheel = useCallback(
		(e: React.WheelEvent<SVGSVGElement>) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();

				// Get mouse position relative to SVG
				const svg = editorRef.current;
				if (!svg) return;

				const CTM = svg.getScreenCTM();
				if (!CTM) return;

				setState((prev) => {
					// Calculate mouse position in SVG coordinates
					const mouseX = (e.clientX - CTM.e) / CTM.a - prev.panOffset.x;
					const mouseY = (e.clientY - CTM.f) / CTM.d - prev.panOffset.y;

					// Determine zoom direction and factor
					const direction = e.deltaY < 0 ? "in" : "out";
					const factor = direction === "in" ? 1.2 : 0.8;

					// Calculate new zoom level
					const newZoomLevel = Math.min(
						Math.max(prev.zoomLevel * factor, 0.5),
						5,
					);

					// Calculate new pan offset to zoom toward/from mouse position
					const newPanOffsetX =
						mouseX -
						(mouseX - prev.panOffset.x) * (newZoomLevel / prev.zoomLevel);
					const newPanOffsetY =
						mouseY -
						(mouseY - prev.panOffset.y) * (newZoomLevel / prev.zoomLevel);

					// Update state
					return {
						...prev,
						zoomLevel: newZoomLevel,
						panOffset: {
							x: newPanOffsetX,
							y: newPanOffsetY,
						},
						debugInfo: `Zoom level: ${newZoomLevel.toFixed(2)}x`,
					};
				});

				// Clear debug info after a delay
				setTimeout(() => {
					setState((prev) => ({ ...prev, debugInfo: "" }));
				}, 1000);
			}
		},
		[editorRef],
	);

	// Handle undo
	const handleUndo = useCallback(() => {
		setState((prev) => {
			if (prev.historyIndex > 0) {
				const newIndex = prev.historyIndex - 1;
				return {
					...prev,
					historyIndex: newIndex,
					controlPoints: prev.controlPointsHistory[newIndex],
				};
			}
			return prev;
		});
	}, []);

	// Handle redo
	const handleRedo = useCallback(() => {
		setState((prev) => {
			if (prev.historyIndex < prev.controlPointsHistory.length - 1) {
				const newIndex = prev.historyIndex + 1;
				return {
					...prev,
					historyIndex: newIndex,
					controlPoints: prev.controlPointsHistory[newIndex],
				};
			}
			return prev;
		});
	}, []);

	// Add a new anchor point between two existing points
	const addPoint = useCallback((index: number) => {
		setState((prev) => {
			if (index < 0 || index >= prev.controlPoints.length - 1) return prev;

			const p1 = prev.controlPoints[index];
			const p2 = prev.controlPoints[index + 1];

			// If both points are anchors, add a new anchor in between
			if (!p1.isControl && !p2.isControl) {
				const newPoint: ControlPoint = {
					x: (p1.x + p2.x) / 2,
					y: (p1.y + p2.y) / 2,
					command: "L",
					isControl: false,
				};

				const newPoints = [
					...prev.controlPoints.slice(0, index + 1),
					newPoint,
					...prev.controlPoints.slice(index + 1),
				];

				return {
					...prev,
					controlPoints: newPoints,
					controlPointsHistory: [
						...prev.controlPointsHistory.slice(0, prev.historyIndex + 1),
						newPoints,
					],
					historyIndex: prev.historyIndex + 1,
				};
			}
			return prev;
		});
	}, []);

	// Remove a point
	const removePoint = useCallback((index: number) => {
		setState((prev) => {
			if (
				prev.controlPoints.length <= 2 ||
				index < 0 ||
				index >= prev.controlPoints.length
			)
				return prev;

			// Don't remove if it's a control point (remove the whole curve instead)
			if (prev.controlPoints[index].isControl) return prev;

			const newPoints = prev.controlPoints.filter((_, i) => i !== index);

			return {
				...prev,
				controlPoints: newPoints,
				controlPointsHistory: [
					...prev.controlPointsHistory.slice(0, prev.historyIndex + 1),
					newPoints,
				],
				historyIndex: prev.historyIndex + 1,
			};
		});
	}, []);

	// Handle hover effects
	const handleMouseOver = useCallback((index: number) => {
		setState((prev) => ({ ...prev, hoverPointIndex: index }));
	}, []);

	const handleMouseOut = useCallback(() => {
		setState((prev) => ({ ...prev, hoverPointIndex: null }));
	}, []);

	// Create a simple path if none exists
	const createDefaultPath = useCallback(() => {
		const defaultPoints: ControlPoint[] = [
			{ x: 20, y: 50, command: "M", isControl: false },
			{ x: 40, y: 30, command: "L", isControl: false },
			{ x: 60, y: 70, command: "L", isControl: false },
			{ x: 80, y: 50, command: "L", isControl: false },
		];

		const pointsWithControls = addControlPointsToAllAnchors(defaultPoints);

		setState((prev) => ({
			...prev,
			controlPoints: pointsWithControls,
			controlPointsHistory: [pointsWithControls],
			historyIndex: 0,
			error: null,
		}));
	}, []);

	// Reset pan and zoom
	const resetView = useCallback(() => {
		setState((prev) => ({
			...prev,
			panOffset: { x: 0, y: 0 },
			zoomLevel: 1,
		}));
	}, []);

	// Set up keyboard shortcuts
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
	}, [handleUndo, handleRedo, editorRef]);

	return {
		state,
		startDrag,
		handleMouseMove,
		endDrag,
		startPan,
		handleZoom,
		handleWheel,
		handleUndo,
		handleRedo,
		addPoint,
		removePoint,
		handleMouseOver,
		handleMouseOut,
		createDefaultPath,
		resetView,
	};
}
