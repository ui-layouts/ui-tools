"use client";

import type React from "react";
import type { ControlPoint } from "./types";

interface EditorCanvasProps {
	editorRef: React.RefObject<SVGSVGElement>;
	viewBox: string;
	currentEditPath: string;
	controlPoints: ControlPoint[];
	strokeColor: string;
	strokeWidth: number;
	zoomLevel: number;
	panOffset: { x: number; y: number };
	hoverPointIndex: number | null;
	draggedPointIndex: number;
	onStartPan: (e: React.MouseEvent<SVGSVGElement>) => void;
	onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
	onEndDrag: () => void;
	onWheel: (e: React.WheelEvent<SVGSVGElement>) => void;
	onStartDrag: (index: number, e: React.MouseEvent) => void;
	onMouseOver: (index: number) => void;
	onMouseOut: () => void;
	onAddPoint: (index: number) => void;
	onRemovePoint: (index: number) => void;
}

export function EditorCanvas({
	editorRef,
	viewBox,
	currentEditPath,
	controlPoints,
	strokeColor,
	strokeWidth,
	zoomLevel,
	panOffset,
	hoverPointIndex,
	draggedPointIndex,
	onStartPan,
	onMouseMove,
	onEndDrag,
	onWheel,
	onStartDrag,
	onMouseOver,
	onMouseOut,
	onAddPoint,
	onRemovePoint,
}: EditorCanvasProps) {
	return (
		<svg
			ref={editorRef}
			viewBox={viewBox}
			className="h-full w-full"
			onMouseDown={onStartPan}
			onMouseMove={onMouseMove}
			onMouseUp={onEndDrag}
			onMouseLeave={onEndDrag}
			onWheel={onWheel}
			style={{ touchAction: "none" }}
		>
			<title>grid</title>
			{/* Grid background */}
			<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
				<path
					d="M 10 0 L 0 0 0 10"
					fill="none"
					stroke="#e5e7eb"
					strokeWidth="0.5"
				/>
			</pattern>
			<rect width="100%" height="100%" fill="url(#grid)" />

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
										for (let i = index + 1; i < controlPoints.length; i++) {
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
												strokeDasharray={`${1 / zoomLevel},${1 / zoomLevel}`}
											/>
										);
									}
									return null;
								})()}

							{/* Larger hit area for better interaction */}
							<circle
								cx={point.x}
								cy={point.y}
								r={isAnchor ? 10 / zoomLevel : 6 / zoomLevel}
								fill="transparent"
								onMouseDown={(e) => onStartDrag(index, e)}
								style={{ cursor: "move" }}
							/>

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
								strokeWidth={0.8 / zoomLevel}
								onMouseOver={() => onMouseOver(index)}
								onMouseOut={onMouseOut}
								onMouseDown={(e) => onStartDrag(index, e)}
								style={{ cursor: "move" }}
							/>

							{/* Right-click to remove anchor points */}
							{isAnchor && (
								<circle
									cx={point.x}
									cy={point.y}
									r={8 / zoomLevel}
									fill="transparent"
									onContextMenu={(e) => {
										e.preventDefault();
										onRemovePoint(index);
									}}
								/>
							)}
						</g>
					);
				})}

				{/* Path segments - for adding new points */}
				{controlPoints.map((point, index) => {
					if (
						index < controlPoints.length - 1 &&
						!point.isControl &&
						!controlPoints[index + 1].isControl
					) {
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
									e.stopPropagation();
									onAddPoint(index);
								}}
								style={{ cursor: "crosshair" }}
							/>
						);
					}
					return null;
				})}
			</g>
		</svg>
	);
}
