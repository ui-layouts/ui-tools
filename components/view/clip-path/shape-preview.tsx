"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn, pointsToSvgPath } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import type { ClipPathShape } from "./data";

interface ShapePreviewProps {
  selectedShape: ClipPathShape;
  selectedImage: string;
  editMode: boolean;
  editClipPathId: string;
  currentEditPath: string;
  controlPoints: Array<{
    x: number;
    y: number;
    command: string;
    isControl: boolean;
  }>;
  zoomLevel: number;
  className?: string;
  setZoomLevel: (value: number) => void;
  previewOffset: { x: number; y: number };
  setPreviewOffset: (offset: { x: number; y: number }) => void;
  onMouseMove?: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  startDrag?: (index: number) => void;
  editorRef?: React.RefObject<SVGSVGElement>;
}

export function ShapePreview({
  selectedShape,
  selectedImage,
  editMode,
  className,
  editClipPathId,
  currentEditPath,
  controlPoints,
  zoomLevel,
  setZoomLevel,
  previewOffset,
  setPreviewOffset,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  startDrag,
  editorRef,
}: ShapePreviewProps) {
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const resetZoom = () => {
    setZoomLevel(0.8);
    setPreviewOffset({ x: 0, y: 0 });
  };

  const getViewBox = () => {
    const size = 1 / zoomLevel;
    const offset = (1 - size) / 2;
    return `${offset} ${offset} ${size} ${size}`;
  };

  const startPreviewDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    setIsDraggingPreview(true);
    setStartDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPreview || zoomLevel <= 1 || !previewRef.current) return;

    const deltaX =
      (((e.clientX - startDragPos.x) / previewRef.current.clientWidth) * 100) /
      zoomLevel;
    const deltaY =
      (((e.clientY - startDragPos.y) / previewRef.current.clientHeight) * 100) /
      zoomLevel;
    // @ts-ignore
    setPreviewOffset((prev) => ({
      x: Math.min(50, Math.max(-50, prev.x - deltaX)),
      y: Math.min(50, Math.max(-50, prev.y - deltaY)),
    }));

    setStartDragPos({ x: e.clientX, y: e.clientY });
  };

  // End dragging the preview
  const endPreviewDrag = () => {
    setIsDraggingPreview(false);
  };

  // Make sure we have a valid path
  const shapePath = selectedShape?.path || "";
  const editPath = currentEditPath || shapePath;

  return (
    <div
      className={cn(
        "relative overflow-hidden aspect-square rounded-md border bg-background",
        className,
      )}
      ref={previewRef}
      onMouseDown={startPreviewDrag}
      onMouseMove={handlePreviewMouseMove}
      onMouseUp={endPreviewDrag}
      onMouseLeave={endPreviewDrag}
      style={{
        cursor: isDraggingPreview
          ? "grabbing"
          : zoomLevel > 1
            ? "grab"
            : "default",
      }}
    >
      <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e9e9e9_1px,transparent_1px)] bg-size-[16px_16px] dark:bg-[radial-gradient(#272727_1px,transparent_1px)]" />

      <svg
        ref={svgRef}
        className="-top-[999px] -left-[999px] absolute h-0 w-0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={selectedShape.id} clipPathUnits="objectBoundingBox">
            <path d={shapePath} fill="black" />
          </clipPath>

          {editMode && (
            <clipPath id={editClipPathId} clipPathUnits="objectBoundingBox">
              <path d={editPath} fill="black" />
            </clipPath>
          )}
        </defs>
      </svg>
      {editMode ? (
        <div className="relative h-full w-full">
          <div
            className={cn(
              "absolute inset-0 h-full w-fit overflow-hidden",
              selectedShape.className,
            )}
            style={{
              transform: `scale(${zoomLevel}) translate(${-previewOffset.x}%, ${-previewOffset.y}%)`,
              transformOrigin: "center",
              clipPath: `url(#${editClipPathId})`,
            }}
          >
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Preview"
              className="h-full w-fit object-cover"
            />
          </div>

          {/* SVG editor overlay */}
          <svg
            ref={editorRef}
            viewBox={getViewBox()}
            className={cn(
              "absolute inset-0 z-10 h-full w-full",
              selectedShape.className,
            )}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            style={{ touchAction: "none" }}
            aria-hidden="true"
            focusable="false"
          >
            {/* Path outline */}
            <path
              d={editPath}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.01 / zoomLevel}
            />

            {/* Control lines */}
            {controlPoints.map((point, index) => {
              if (
                point.isControl &&
                index > 0 &&
                index < controlPoints.length - 1
              ) {
                // Find anchor points this control point belongs to
                let prevAnchor = -1;
                let _nextAnchor = -1;

                for (let i = index - 1; i >= 0; i--) {
                  if (!controlPoints[i].isControl) {
                    prevAnchor = i;
                    break;
                  }
                }

                for (let i = index + 1; i < controlPoints.length; i++) {
                  if (!controlPoints[i].isControl) {
                    _nextAnchor = i;
                    break;
                  }
                }

                return (
                  <line
                    key={`line-${index}`}
                    x1={prevAnchor >= 0 ? controlPoints[prevAnchor].x : 0}
                    y1={prevAnchor >= 0 ? controlPoints[prevAnchor].y : 0}
                    x2={point.x}
                    y2={point.y}
                    stroke="#888"
                    strokeWidth={0.005 / zoomLevel}
                    strokeDasharray={`${0.01 / zoomLevel},${0.01 / zoomLevel}`}
                  />
                );
              }
              return null;
            })}

            {/* Control points */}
            {controlPoints.map((point, index) => (
              <circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r={point.isControl ? 0.01 / zoomLevel : 0.015 / zoomLevel}
                fill={point.isControl ? "red" : "blue"}
                stroke="white"
                strokeWidth={0.005 / zoomLevel}
                onMouseDown={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  if (startDrag) startDrag(index);
                }}
                style={{ cursor: "move" }}
              />
            ))}
          </svg>
        </div>
      ) : (
        <div
          className={cn(
            "h-full w-fit overflow-hidden",
            selectedShape.className,
          )}
          style={{
            transform: `scale(${zoomLevel}) translate(${-previewOffset.x}%, ${-previewOffset.y}%)`,
            transformOrigin: "center",
            transition: isDraggingPreview ? "none" : "transform 0.2s ease-out",
            clipPath: `url(#${selectedShape.id})`,
          }}
        >
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Preview"
            className="h-full w-fit object-cover transition-transform duration-300"
          />
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute right-1.5 bottom-1.5 z-50 flex w-fit cursor-default items-center gap-2 rounded-md border-0 p-2 shadow-md backdrop-blur-md">
        <div className="font-medium text-sm">Zoom: {zoomLevel.toFixed(1)}x</div>
        <Slider
          className="ml-2 w-24"
          min={0.25}
          max={5}
          step={0.05}
          value={[zoomLevel]}
          onValueChange={(value) => setZoomLevel(value[0])}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={resetZoom}
          disabled={
            zoomLevel === 1 && previewOffset.x === 0 && previewOffset.y === 0
          }
          className="text-xs"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
