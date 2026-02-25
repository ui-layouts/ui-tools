"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CopyToClipboard from "@/components/ui/copy-to-clipboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/components/ui/use-media-query";
import { cn } from "@/lib/utils";
import { parseSvgPath, pointsToSvgPath } from "@/lib/utils";
import { useClipPathStore } from "@/store/clipPath-storage";
import {
	Bookmark,
	Layers,
	Moon,
	PanelsTopLeft,
	Settings2,
	SidebarClose,
	SidebarOpen,
	Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CodeOutput } from "./code-output";
import { CustomShapeForm } from "./custom-shape-form";
import { INITIAL_CLIP_PATHS } from "./data";
import { EditControls } from "./edit-controls";
import { ImageSelector } from "./image-selector";
import { ShapeGrid } from "./shape-grid";
import { ShapePreview } from "./shape-preview";

// Sample images for preview
const SAMPLE_IMAGES = [
	"https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1624115773145-9b77fe912897?q=80&w=2070&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1600619030925-569b3b964418?q=80&w=2127&auto=format&fit=crop",
];

export default function ClipPathGenerator() {
	const { resolvedTheme, setTheme } = useTheme();
	const pathname = usePathname();
	const router = useRouter();
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
	const [exportOpen, setExportOpen] = useState(false);
	const [activeSidebarTab, setActiveSidebarTab] = useState<
		"presets" | "settings" | "edited" | "saved"
	>("presets");
	const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

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
			{isMobile && (
				<p className="pb-2 text-center text-primary/60">
					Please use a desktop/laptop to view the Editor.
				</p>
			)}

			<div
				id="editor"
				className={`relative grid h-full min-h-0 grid-cols-12 gap-3 p-3 ${
					isSidebarExpanded
						? "lg:grid-cols-[74px_340px_minmax(0,1fr)]"
						: "lg:grid-cols-[74px_minmax(0,1fr)]"
				}`}
			>
				<div className="col-span-12 flex justify-end">
					<Button type="button" variant="outline" size="sm">
						Export
					</Button>
				</div>
				{!isMobile && (
					<div className="inset-shadow-[0_1px_rgb(0_0_0/0.10)] hidden h-full min-h-0 rounded-lg border bg-card-bg p-2 lg:flex lg:flex-col lg:justify-between dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
						<div className="space-y-2">
							{[
								{ key: "presets", label: "Presets", icon: PanelsTopLeft },
								{ key: "settings", label: "Settings", icon: Settings2 },
								{ key: "edited", label: "Edited", icon: Layers },
								{ key: "saved", label: "Saved", icon: Bookmark },
							].map((item) => (
								<button
									type="button"
									key={item.key}
									onClick={() => {
										setIsSidebarExpanded(true);
										setActiveSidebarTab(
											item.key as "presets" | "settings" | "edited" | "saved",
										);
									}}
									className={`grid h-16 w-full place-items-center rounded-md border px-1 py-1 font-semibold text-[11px] transition-colors ${
										activeSidebarTab === item.key
											? "border-primary bg-primary text-primary-foreground"
											: "bg-main hover:bg-accent"
									}`}
								>
									<item.icon className="mb-0.5 h-4 w-4" />
									<span>{item.label}</span>
								</button>
							))}
						</div>
						<div className="space-y-2">
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="h-9 w-full"
								onClick={() =>
									setTheme(resolvedTheme === "dark" ? "light" : "dark")
								}
							>
								{resolvedTheme === "dark" ? (
									<Sun className="h-4 w-4" />
								) : (
									<Moon className="h-4 w-4" />
								)}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="h-9 w-full"
								onClick={() => setIsSidebarExpanded((prev) => !prev)}
							>
								{isSidebarExpanded ? (
									<SidebarClose className="h-4 w-4" />
								) : (
									<SidebarOpen className="h-4 w-4" />
								)}
							</Button>
							<Select
								value={pathname}
								onValueChange={(value) => router.push(value)}
							>
								<SelectTrigger className="h-9 px-2 text-[10px]">
									<SelectValue placeholder="Go to editor..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="/svg-line-draw">SVG Line Draw</SelectItem>
									<SelectItem value="/shadows">Shadows</SelectItem>
									<SelectItem value="/clip-paths">Clip-paths</SelectItem>
									<SelectItem value="/mesh-gradients">
										Mesh Gradients
									</SelectItem>
									<SelectItem value="/background-snippets">
										Background Snippets
									</SelectItem>
									<SelectItem value="/color-lab">Color Lab</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				{!isTab && isSidebarExpanded && (
					<div className="h-full min-h-0 rounded-xl border bg-card-bg p-2 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
						{activeSidebarTab === "presets" && (
							<div className="flex h-full min-h-0 flex-col gap-2">
								<ScrollArea className="min-h-0 flex-1 rounded-md border bg-main">
									<ShapeGrid
										className="bg-main"
										shapes={INITIAL_CLIP_PATHS}
										selectedShapeId={selectedShapeId}
										onSelectShape={setSelectedShapeId}
										disabled={editMode}
									/>
								</ScrollArea>
								{!editMode ? (
									<Button
										className="w-full"
										onClick={() => enterEditMode()}
										disabled={!selectedShape}
									>
										Edit Selected Shape
									</Button>
								) : (
									<EditControls
										historyIndex={historyIndex}
										onSave={() => exitEditMode(true)}
										onCancel={() => exitEditMode(false)}
									/>
								)}
							</div>
						)}

						{activeSidebarTab === "settings" && (
							<ScrollArea className="h-full rounded-md border bg-main p-3">
								<div className="space-y-4">
									<ImageSelector
										selectedImage={selectedImage}
										setSelectedImage={setSelectedImage}
										sampleImages={SAMPLE_IMAGES}
										uploadedImages={uploadedImages}
										onImageUpload={handleImageUpload}
										disabled={editMode}
									/>
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
							</ScrollArea>
						)}

						{activeSidebarTab === "edited" && (
							<ScrollArea className="h-full rounded-md border bg-main p-3">
								{editedShapes.length > 0 ? (
									<ShapeGrid
										shapes={editedShapes}
										selectedShapeId={selectedShapeId}
										onSelectShape={setSelectedShapeId}
										onEditShape={enterEditMode}
										onDeleteShape={deleteShape}
										disabled={editMode}
										compact
									/>
								) : (
									<p className="text-muted-foreground text-sm">
										No Edited Shapes Found
									</p>
								)}
							</ScrollArea>
						)}

						{activeSidebarTab === "saved" && (
							<ScrollArea className="h-full rounded-md border bg-main p-3">
								{customShapes.length > 0 ? (
									<ShapeGrid
										shapes={customShapes}
										selectedShapeId={selectedShapeId}
										onSelectShape={setSelectedShapeId}
										onEditShape={enterEditMode}
										onDeleteShape={deleteShape}
										disabled={editMode}
										compact
									/>
								) : (
									<p className="text-muted-foreground text-sm">
										No Custom/Saved Shapes Found
									</p>
								)}
							</ScrollArea>
						)}
					</div>
				)}

				<div className="col-span-12 h-full min-h-0 lg:col-auto">
					<Card className="relative h-full border bg-card-bg dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
						<CardContent className="flex h-full min-h-0 flex-col gap-3 p-4">
							<div className="min-h-0 flex-1 space-y-2">
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

							<div className="relative z-20 flex shrink-0 items-center justify-between rounded-md border bg-card p-2">
								<p className="font-medium text-sm">Export clip-path code</p>
								<Sheet open={exportOpen} onOpenChange={setExportOpen}>
									<SheetTrigger asChild>
										<Button size="sm">Open Export</Button>
									</SheetTrigger>
									<SheetContent
										side="right"
										className="w-[560px] max-w-[95vw] p-0"
									>
										<SheetHeader className="border-b px-4 py-3 text-left">
											<SheetTitle>Export</SheetTitle>
										</SheetHeader>
										<div className="h-[calc(100vh-64px)] overflow-y-auto p-4">
											<CodeOutput
												selectedShape={selectedShape}
												currentEditPath={currentEditPath || selectedShape.path}
												editMode={editMode}
											/>
										</div>
									</SheetContent>
								</Sheet>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
