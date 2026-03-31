"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CopyToClipboard from "@/components/ui/copy-to-clipboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useMediaQuery } from "@/components/ui/use-media-query";
import { cn } from "@/lib/utils";
import { parseSvgPath, pointsToSvgPath } from "@/lib/utils";
import { useClipPathStore } from "@/store/clipPath-storage";
import { TabsTrigger } from "@radix-ui/react-tabs";
import { ChevronsDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CodeOutput } from "./code-output";
import { CustomShapeForm } from "./custom-shape-form";
import { INITIAL_CLIP_PATHS } from "./data";
import { EditControls } from "./edit-controls";
import { ImageSelector } from "./image-selector";
import { ShapeGrid } from "./shape-grid";
import { ShapePreview } from "./shape-preview";
import CarbonAd from "@/components/common/carbon-ads";

// Sample images for preview
const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1624115773145-9b77fe912897?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600619030925-569b3b964418?q=80&w=2127&auto=format&fit=crop",
];

export default function ClipPathGenerator() {
  const isTab = useMediaQuery("(max-width:1024px)");
  const isMobile = useMediaQuery("(max-width:768px)");

  const {
    selectedShapeId,
    setSelectedShapeId,
    customPath,
    customName,
    addCustomShape,
    addEditedShape,
    deleteShape,
    setCustomPath,
    setCustomName,
    customShapes,
    editedShapes,
  } = useClipPathStore();

  const [viewAll, setViewAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGES[0]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [editClipPathId, _setEditClipPathId] = useState("edit-clip-path");
  const [editMode, setEditMode] = useState(false);
  const [controlPoints, setControlPoints] = useState<
    { x: number; y: number; command: string; isControl: boolean }[]
  >([]);
  const [_selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [currentEditPath, setCurrentEditPath] = useState("");
  const [editingShapeKey, setEditingShapeKey] = useState<string | null>(null);
  const [controlPointsHistory, setControlPointsHistory] = useState<
    { x: number; y: number; command: string; isControl: boolean }[][]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draggedPointIndex, setDraggedPointIndex] = useState(-1);

  const editorRef = useRef<SVGSVGElement>(null);

  const allShapes = [...INITIAL_CLIP_PATHS, ...editedShapes, ...customShapes];
  const selectedShape =
    allShapes.find((shape) => shape.id === selectedShapeId) ||
    INITIAL_CLIP_PATHS[0];

  useEffect(() => {
    if (INITIAL_CLIP_PATHS.length > 0 && !selectedShapeId) {
      setSelectedShapeId(INITIAL_CLIP_PATHS[0].id);
    }
  }, [selectedShapeId, setSelectedShapeId]);

  useEffect(() => {
    if (controlPoints.length > 0) {
      const path = pointsToSvgPath(controlPoints);
      setCurrentEditPath(path);
    }
  }, [controlPoints]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newUploadedImages: string[] = []; // Ensure this is initialized outside the loop

      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const uploadedImage = event.target?.result as string;
          newUploadedImages.push(uploadedImage);

          setUploadedImages((prev) => [...prev, uploadedImage]);
          setSelectedImage(uploadedImage);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const enterEditMode = (shapeId?: string) => {
    const id = shapeId || selectedShapeId;
    if (!id) return;

    setEditingShapeKey(id);

    const shape = allShapes.find((s) => s.id === id);
    if (!shape) return;

    const pathData = shape.path;

    const points = parseSvgPath(pathData);

    setSelectedShapeId(id);
    setControlPoints(points);
    setCurrentEditPath(pathData);
    setEditMode(true);

    setControlPointsHistory([points]);
    setHistoryIndex(0);
  };

  const exitEditMode = (save = true) => {
    if (save && controlPoints.length > 0 && editingShapeKey) {
      const newPath = pointsToSvgPath(controlPoints);
      const shape = allShapes.find((s) => s.id === editingShapeKey);
      const className = shape?.className || "";
      addEditedShape(editingShapeKey, newPath, className);
    }

    setEditMode(false);
    setSelectedPoint(null);
    setEditingShapeKey(null);
  };

  const startDrag = (index: number) => {
    setDraggedPointIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedPointIndex === -1 || !editorRef.current) return;

    const svg = editorRef.current;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const newX = (e.clientX - ctm.e) / ctm.a;
    const newY = (e.clientY - ctm.f) / ctm.d;

    if (Number.isNaN(newX) || Number.isNaN(newY)) return;

    setControlPoints((prev) => {
      const newPoints = [...prev];
      if (newPoints[draggedPointIndex]) {
        newPoints[draggedPointIndex] = {
          ...newPoints[draggedPointIndex],
          x: newX,
          y: newY,
        };
      }
      return newPoints;
    });
  };

  const endDrag = () => {
    if (draggedPointIndex !== -1) {
      setControlPointsHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        return [...newHistory, [...controlPoints]];
      });
      setHistoryIndex((prev) => prev + 1);
    }
    setDraggedPointIndex(-1);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setControlPoints(controlPointsHistory[newIndex]);
    }
  }, [historyIndex, controlPointsHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        setZoomLevel((prev) => Math.min(5, prev + 0.25));
      } else if (e.key === "-" || e.key === "_") {
        setZoomLevel((prev) => Math.max(0.25, prev - 0.25));
      } else if (e.key === "0") {
        setZoomLevel(0.8);
        setPreviewOffset({ x: 0, y: 0 });
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey) && editMode) {
        e.preventDefault();
        handleUndo(); // safely call the memoized function
      }
    };

    // Handle mouse wheel for zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel((prev) => Math.max(0.25, Math.min(5, prev + delta)));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [editMode, handleUndo]);
  if (allShapes.length === 0 || !selectedShape) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading shapes...
      </div>
    );
  }

  return (
    <>
      <article className="space-y-3 pb-8 pt-8">
        <h1 className="text-center font-medium text-2xl sm:text-3xl md:text-5xl ">
          SVG Clip-Paths for <br /> Developers & Designers
        </h1>

        <div className="mx-auto flex w-fit items-center justify-center gap-2 font-semibold">
          <div className="flex gap-2 rounded-md border bg-card-bg p-2 shadow-[0px_1px_0px_0px_rgba(17,17,26,0.1)] dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
            Expand
            <Switch
              id="view-all-switch"
              checked={viewAll}
              onCheckedChange={setViewAll}
              className="bg-main"
            />
          </div>
          <a
            href="#editor"
            className="group flex cursor-pointer gap-1 rounded-md border bg-card-bg p-2 text-primary shadow-[0px_1px_0px_0px_rgba(17,17,26,0.1)] hover:bg-accent dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0"
          >
            Click to Editor
            <ChevronsDown />
          </a>
        </div>
      </article>
      <div className="flex justify-center items-center">
        <CarbonAd />
      </div>
      <div
        className={cn(
          "relative mx-auto grid max-w-screen-lg grid-cols-4 gap-6 px-4 pb-10 lg:grid-cols-5 lg:px-0 2xl:max-w-screen-xl 2xl:gap-10",
          viewAll ? "h-full" : "h-[28rem]",
        )}
      >
        {!viewAll && (
          <div className="absolute bottom-0 left-0 z-10 grid h-60 w-full place-content-center bg-gradient-to-t from-42% from-white dark:from-black" />
        )}

        {(viewAll ? INITIAL_CLIP_PATHS : INITIAL_CLIP_PATHS.slice(0, 10)).map(
          (shape) => (
            <div
              key={shape.id}
              className="group relative grid aspect-square w-full cursor-pointer place-items-center rounded-lg border p-3 lg:p-10 2xl:h-48 dark:border-neutral-950"
              onClick={() => setSelectedShapeId(shape.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedShapeId(shape.id);
                }
              }}
            >
              <svg
                viewBox="0 0 100 100"
                className="relative z-[2] text-neutral-300 dark:text-neutral-500"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d={shape.path}
                  fill="currentColor"
                  transform={"scale(100)"}
                />
              </svg>
            </div>
          ),
        )}
      </div>
      {isMobile && (
        <p className="pb-2 text-center text-primary/60">
          Please use a desktop/laptop to view the Editor.
        </p>
      )}

      <div
        id="editor"
        className="mx-auto grid grid-cols-12 gap-2 px-4 pb-5 xl:container lg:grid-cols-12 xl:px-0"
      >
        {/* Left column: Controls */}
        {!isMobile && (
          <Card className="col-span-4 h-[95vh] bg-card-bg xl:col-span-3 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
            <CardContent className="h-full p-2">
              <Tabs defaultValue="shapes" className="h-full">
                <TabsList className="flex h-12 w-full gap-1 rounded-md border bg-card p-1.5 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
                  <TabsTrigger
                    value="shapes"
                    className="relative h-full w-full cursor-pointer rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="relative z-[2] capitalize">Shapes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="editedShapes"
                    className="relative h-full w-full cursor-pointer rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="relative z-[2] capitalize">Edited</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom"
                    className="relative h-full w-full cursor-pointer rounded-md p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="relative z-[2] capitalize">Custom</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="shapes" className="h-[80%] p-0">
                  <ScrollArea
                    className={cn(
                      "mb-4 h-full rounded-lg border ",
                      editMode && "h-60",
                    )}
                  >
                    <ShapeGrid
                      className="bg-main"
                      shapes={INITIAL_CLIP_PATHS}
                      selectedShapeId={selectedShapeId}
                      onSelectShape={setSelectedShapeId}
                      disabled={editMode}
                    />
                  </ScrollArea>

                  {!editMode && (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => enterEditMode()}
                      disabled={!selectedShape}
                    >
                      Edit Selected Shape
                    </Button>
                  )}

                  {editMode && (
                    <EditControls
                      historyIndex={historyIndex}
                      onSave={() => exitEditMode(true)}
                      onCancel={() => exitEditMode(false)}
                    />
                  )}
                </TabsContent>

                <TabsContent
                  value="editedShapes"
                  className="h-[80%] rounded-md border bg-background p-3 2xl:h-[90%]"
                >
                  {editedShapes.length > 0 ? (
                    <>
                      <ScrollArea
                        className={cn(
                          "bg h-full rounded-md",
                          editMode && "h-40 opacity-50",
                        )}
                      >
                        <ShapeGrid
                          shapes={editedShapes}
                          selectedShapeId={selectedShapeId}
                          onSelectShape={setSelectedShapeId}
                          onEditShape={enterEditMode}
                          onDeleteShape={deleteShape}
                          disabled={editMode}
                          compact
                        />
                      </ScrollArea>

                      {editMode && (
                        <EditControls
                          historyIndex={historyIndex}
                          onSave={() => exitEditMode(true)}
                          onCancel={() => exitEditMode(false)}
                        />
                      )}
                    </>
                  ) : (
                    <p>No Edited Shapes Found</p>
                  )}
                </TabsContent>

                <TabsContent
                  value="custom"
                  className="h-[80%] rounded-md border bg-background p-2 2xl:h-[90%]"
                >
                  <ScrollArea className={cn("bg h-full rounded-md")}>
                    <div
                      className={cn(
                        "",
                        editMode ? "h-32 overflow-hidden opacity-50" : "",
                      )}
                    >
                      <CustomShapeForm
                        customName={customName}
                        setCustomName={setCustomName}
                        customPath={customPath}
                        setCustomPath={setCustomPath}
                        onAddCustomShape={() =>
                          addCustomShape(customPath, customName)
                        }
                        disabled={editMode}
                      />
                    </div>

                    {/* Custom shapes list */}
                    {customShapes.length > 0 && (
                      <>
                        <h3 className="mt-6 font-medium text-lg">
                          Custom Shapes
                        </h3>

                        <ShapeGrid
                          shapes={customShapes}
                          selectedShapeId={selectedShapeId}
                          onSelectShape={setSelectedShapeId}
                          onEditShape={enterEditMode}
                          onDeleteShape={deleteShape}
                          disabled={editMode}
                          compact
                        />

                        {editMode && (
                          <EditControls
                            historyIndex={historyIndex}
                            onSave={() => exitEditMode(true)}
                            onCancel={() => exitEditMode(false)}
                          />
                        )}
                      </>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Middle column: Preview */}
        <ScrollArea className="col-span-12 rounded-xl border bg-card-bg md:col-span-8 md:h-[95vh] lg:col-span-5 xl:col-span-6 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
          <Card className="relative border-0 bg-card-bg shadow-none dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <ImageSelector
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  sampleImages={SAMPLE_IMAGES}
                  uploadedImages={uploadedImages}
                  onImageUpload={handleImageUpload}
                  disabled={editMode}
                />

                <ShapePreview
                  selectedShape={selectedShape}
                  selectedImage={selectedImage}
                  editMode={editMode}
                  editClipPathId={editClipPathId}
                  currentEditPath={currentEditPath || selectedShape.path}
                  controlPoints={controlPoints}
                  zoomLevel={zoomLevel}
                  setZoomLevel={setZoomLevel}
                  previewOffset={previewOffset}
                  setPreviewOffset={setPreviewOffset}
                  onMouseMove={handleMouseMove}
                  onMouseUp={endDrag}
                  onMouseLeave={endDrag}
                  startDrag={startDrag}
                  // @ts-ignore
                  editorRef={editorRef}
                />

                {zoomLevel > 1 && (
                  <p className="mt-2 text-center text-muted-foreground text-xs">
                    Click and drag to pan the zoomed view
                  </p>
                )}
                <p className="mt-1 text-center text-muted-foreground text-xs">
                  Use mouse wheel + Ctrl to zoom in/out, or press + and - keys
                </p>
              </div>
              {isTab && (
                <CodeOutput
                  showOnlyCopyButton
                  selectedShape={selectedShape}
                  currentEditPath={currentEditPath || selectedShape.path}
                  editMode={editMode}
                  className="absolute top-0 left-0 h-full w-full bg-card-bg"
                />
              )}
            </CardContent>
          </Card>
        </ScrollArea>

        {/* Right column: Code output */}
        {!isTab && (
          <ScrollArea className="col-span-3 h-[95vh] rounded-xl border bg-card-bg xl:col-span-3 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
            <Card className="border-0 bg-card-bg shadow-none">
              <CardContent className="space-y-4 p-2">
                <CodeOutput
                  selectedShape={selectedShape}
                  currentEditPath={currentEditPath || selectedShape.path}
                  editMode={editMode}
                />
              </CardContent>
            </Card>
          </ScrollArea>
        )}
      </div>
    </>
  );
}
