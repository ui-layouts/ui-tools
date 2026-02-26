"use client";

import { Button } from "@/components/ui/button";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/components/ui/use-media-query";
import { preBuiltShadows } from "@/config/shadow-data";
import { useShadowStore } from "@/store/useShadowStore";
import type { ShadowLayer, ShadowPreset } from "@/types/shadow";
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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ShadowControls from "./shadow-controls";
import ShadowPresets from "./shadow-presets";
import ShadowPreview from "./shadow-preview";

export default function ShadowGenerator() {
	const { resolvedTheme, setTheme, theme } = useTheme();
	const isTab = useMediaQuery("(max-width:1024px)");
	const isMobile = useMediaQuery("(max-width:768px)");
	const [shadowName, setShadowName] = useState("");
	const [isEdited, setIsEdited] = useState(false);
	const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);
	const [shadowMode, setShadowMode] = useState<"box" | "text">("box");

	const {
		savedShadows,
		favorites,
		addShadow,
		updateShadow,
		deleteShadow,
		toggleFavorite,
		isFavorite,
	} = useShadowStore();

	const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
	const [isRemoveShadow, setIsRemoveShadow] = useState<boolean>(false);
	const [layers, setLayers] = useState<ShadowLayer[]>([
		{
			offsetX: 0,
			offsetY: 0,
			blur: 0,
			spread: 1,
			color: "#000000",
			opacity: 4,
			isVisible: true,
		},
		{
			offsetX: 0,
			offsetY: 1,
			blur: 0,
			spread: 0,
			color: "#000000",
			opacity: 5,
			isVisible: true,
		},
		{
			offsetX: 0,
			offsetY: 2,
			blur: 2,
			spread: 0,
			color: "#000000",
			opacity: 5,
			isVisible: true,
		},
		{
			offsetX: 0,
			offsetY: 2,
			blur: 4,
			spread: 0,
			color: "#000000",
			opacity: 5,
			isVisible: true,
		},
	]);
	const [activeShadow, setActiveShadow] = useState<ShadowPreset | null>(
		preBuiltShadows[0],
	);
	const [activeLayerIndex, setActiveLayerIndex] = useState(0);
	const [tailwindClass, setTailwindClass] = useState("");
	const [cssValue, setCssValue] = useState("");
	const [_uniqueColors, setUniqueColors] = useState<
		{ color: string; count: number }[]
	>([]);

	const [globalPositionMode, setGlobalPositionMode] = useState(false);
	const [globalShadowTypeMode, setGlobalShadowTypeMode] = useState(false);
	const [globalBlurMode, setGlobalBlurMode] = useState(false);
	const [globalSpreadMode, setGlobalSpreadMode] = useState(false);
	const [globalOpacityMode, setGlobalOpacityMode] = useState(false);
	const [globalMasterMode, setGlobalMasterMode] = useState(false);
	const [activeSidebarTab, setActiveSidebarTab] = useState<
		"presets" | "settings" | "edited" | "saved"
	>("settings");
	const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
	const [previewBackground, setPreviewBackground] = useState("#ECF0F3");
	const [previewSurfaceColor, setPreviewSurfaceColor] = useState("#FFFFFF");
	const pathname = usePathname();
	const router = useRouter();

	const toggleGlobalMasterMode = (enabled: boolean) => {
		setGlobalMasterMode(enabled);
		setGlobalPositionMode(enabled);
		setGlobalBlurMode(enabled);
		setGlobalSpreadMode(enabled);
		setGlobalOpacityMode(enabled);
		setGlobalShadowTypeMode(enabled);
	};

	useEffect(() => {
		if (activeShadow) {
			setIsEdited(checkIfEdited(layers, activeShadow));
		}
		const shadowString = layers
			.filter((layer) => layer.isVisible !== false)
			.map((layer) => {
				const { offsetX, offsetY, blur, spread, color, opacity, isInner } =
					layer;
				const rgba = `rgba(${Number.parseInt(
					color.slice(1, 3),
					16,
				)}, ${Number.parseInt(color.slice(3, 5), 16)}, ${Number.parseInt(
					color.slice(5, 7),
					16,
				)}, ${opacity / 100})`;
				return `${
					isInner ? "inset " : ""
				}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}`;
			})
			.join(", ");

		setCssValue(shadowString);

		const tailwindShadow = `shadow-[${layers
			.filter((layer) => layer.isVisible !== false)
			.map((layer) => {
				const { offsetX, offsetY, blur, spread, color, opacity, isInner } =
					layer;
				const rgba =
					opacity === 100
						? color
						: `rgba(${Number.parseInt(color.slice(1, 3), 16)},${Number.parseInt(
								color.slice(3, 5),
								16,
							)},${Number.parseInt(color.slice(5, 7), 16)},${opacity / 100})`;
				return `${
					isInner ? "inset_" : ""
				}${offsetX}px_${offsetY}px_${blur}px_${spread}px_${rgba}`;
			})
			.join(",")}]`;

		setTailwindClass(tailwindShadow);

		const colorMap = new Map<string, number>();

		for (const layer of layers) {
			const color = layer.color.toUpperCase();
			colorMap.set(color, (colorMap.get(color) || 0) + 1);
		}

		setUniqueColors(
			Array.from(colorMap.entries()).map(([color, count]) => ({
				color,
				count,
			})),
		);
	}, [layers, activeShadow]);

	useEffect(() => {
		setIsDarkMode(theme === "dark");
	}, [theme]);

	const checkIfEdited = (
		currentLayers: ShadowLayer[],
		originalPreset: ShadowPreset,
	) => {
		if (!originalPreset) return false;
		if (currentLayers.length !== originalPreset.layers.length) return true;

		for (let i = 0; i < currentLayers.length; i++) {
			const currentLayer = currentLayers[i];
			const originalLayer = originalPreset.layers[i];
			if (
				currentLayer.offsetX !== originalLayer.offsetX ||
				currentLayer.offsetY !== originalLayer.offsetY ||
				currentLayer.blur !== originalLayer.blur ||
				currentLayer.spread !== originalLayer.spread ||
				currentLayer.color !== originalLayer.color ||
				currentLayer.opacity !== originalLayer.opacity ||
				currentLayer.isInner !== originalLayer.isInner ||
				currentLayer.isVisible !== originalLayer.isVisible
			) {
				return true;
			}
		}

		return false;
	};

	const applyPreset = (preset: ShadowPreset) => {
		if (isDarkMode && preset.darkLayers) {
			setLayers([...preset.darkLayers]);
		} else {
			setLayers([...preset.layers]);
		}
		setShadowMode("box");
		setActiveLayerIndex(0);
		setActiveShadow(preset);
		setCurrentPresetId(preset.id || null);
		setIsEdited(false);
		setShadowName(preset.name || "");
	};

	const saveCurrentShadow = () => {
		const shadowToSave = {
			name: shadowName || "Custom Shadow",
			tailwind: tailwindClass,
			css: cssValue,
			darkTailwind: isDarkMode ? tailwindClass : undefined,
			darkCss: isDarkMode ? cssValue : undefined,
			layers: [...layers],
			darkLayers: isDarkMode ? [...layers] : undefined,
			isCustom: true,
		};

		if (currentPresetId && savedShadows.some((s) => s.id === currentPresetId)) {
			updateShadow(currentPresetId, shadowToSave);
			toast.success("Your custom shadow has been updated.!");
		} else {
			const newId = addShadow(shadowToSave);
			setCurrentPresetId(newId);
			toast.success("Your custom shadow has been saved.");
		}

		setIsEdited(false);
	};

	const textShadowValue = layers
		.filter((layer) => layer.isVisible !== false)
		.map((layer) => {
			const rgba = `rgba(${Number.parseInt(layer.color.slice(1, 3), 16)}, ${Number.parseInt(layer.color.slice(3, 5), 16)}, ${Number.parseInt(layer.color.slice(5, 7), 16)}, ${layer.opacity / 100})`;
			return `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${rgba}`;
		})
		.join(", ");

	return (
		<>
			{isMobile && (
				<p className="pb-2 text-center text-primary/60">
					Please use a desktop/laptop to view the Editor.
				</p>
			)}
			<div
				id="editor"
				className={`relative z-10 grid h-full min-h-0 grid-cols-12 gap-3 p-3 ${
					isSidebarExpanded
						? "lg:grid-cols-[74px_340px_minmax(0,1fr)]"
						: "lg:grid-cols-[74px_minmax(0,1fr)]"
				}`}
			>
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
								<SelectItem value="/mesh-gradients">Mesh Gradients</SelectItem>
								<SelectItem value="/background-snippets">
									Background Snippets
								</SelectItem>
								<SelectItem value="/color-lab">Color Lab</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{!isTab && isSidebarExpanded && (
					<div className="h-full min-h-0">
						<div className="mb-3 grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant={shadowMode === "box" ? "default" : "outline"}
								onClick={() => setShadowMode("box")}
							>
								Box Shadow
							</Button>
							<Button
								type="button"
								variant={shadowMode === "text" ? "default" : "outline"}
								onClick={() => {
									setShadowMode("text");
									setActiveSidebarTab("presets");
								}}
							>
								Text Shadow
							</Button>
						</div>
						{activeSidebarTab === "settings" ? (
							<div className="flex h-full min-h-0 flex-col gap-2">
								{shadowMode === "text" && (
									<p className="rounded-md border bg-card-bg p-2 text-muted-foreground text-xs">
										Using the same layer controls as box shadow. For
										text-shadow, spread/inset are ignored in output.
									</p>
								)}
								<div className="min-h-0 flex-1">
									<ShadowControls
										layers={layers}
										setLayers={setLayers}
										activeLayerIndex={activeLayerIndex}
										setActiveLayerIndex={setActiveLayerIndex}
										globalMasterMode={globalMasterMode}
										// @ts-ignore
										setGlobalMasterMode={toggleGlobalMasterMode}
										globalPositionMode={globalPositionMode}
										globalBlurMode={globalBlurMode}
										globalSpreadMode={globalSpreadMode}
										globalOpacityMode={globalOpacityMode}
										globalShadowTypeMode={globalShadowTypeMode}
									/>
								</div>
							</div>
						) : (
							<ShadowPresets
								mode={activeSidebarTab}
								shadowMode={shadowMode}
								activeShadow={activeShadow}
								applyPreset={applyPreset}
								savedShadows={savedShadows}
								favorites={favorites}
								toggleFavorite={toggleFavorite}
								isFavorite={isFavorite}
								deleteShadow={deleteShadow}
								currentPresetId={currentPresetId}
								setCurrentPresetId={setCurrentPresetId}
								isDarkMode={isDarkMode}
								setLayers={setLayers}
								setActiveLayerIndex={setActiveLayerIndex}
							/>
						)}
					</div>
				)}

				<div className="col-span-12 h-full min-h-0 lg:col-auto">
					<ShadowPreview
						shadowMode={shadowMode}
						cssValue={cssValue}
						tailwindClass={tailwindClass}
						textShadowValue={textShadowValue}
						isRemoveShadow={isRemoveShadow}
						setIsRemoveShadow={setIsRemoveShadow}
						isEdited={isEdited}
						shadowName={shadowName}
						setShadowName={setShadowName}
						saveCurrentShadow={saveCurrentShadow}
						activeShadow={activeShadow}
						previewBackground={previewBackground}
						setPreviewBackground={setPreviewBackground}
						previewSurfaceColor={previewSurfaceColor}
						setPreviewSurfaceColor={setPreviewSurfaceColor}
					/>
				</div>
			</div>
		</>
	);
}
