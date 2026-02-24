"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CustomSlider } from "@/components/ui/range-slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ShadowLayer } from "@/types/shadow";
import { Eye, EyeOff, Info, Plus, Trash } from "lucide-react";
import type React from "react";
import { ChromePicker } from "react-color";
import toast from "react-hot-toast";

interface ShadowControlsProps {
	layers: ShadowLayer[];
	setLayers: React.Dispatch<React.SetStateAction<ShadowLayer[]>>;
	activeLayerIndex: number;
	setActiveLayerIndex: React.Dispatch<React.SetStateAction<number>>;
	globalMasterMode: boolean;
	setGlobalMasterMode: React.Dispatch<React.SetStateAction<boolean>>;
	globalPositionMode: boolean;
	globalBlurMode: boolean;
	globalSpreadMode: boolean;
	globalOpacityMode: boolean;
	globalShadowTypeMode: boolean;
}

export default function ShadowControls({
	layers,
	setLayers,
	activeLayerIndex,
	setActiveLayerIndex,
	globalMasterMode,
	setGlobalMasterMode,
	globalPositionMode,
	globalBlurMode,
	globalSpreadMode,
	globalOpacityMode,
	globalShadowTypeMode,
}: ShadowControlsProps) {
	const addLayer = () => {
		setLayers([
			...layers,
			{
				offsetX: 0,
				offsetY: 4,
				blur: 8,
				spread: 0,
				color: "#131212",
				opacity: 25,
			},
		]);
		setActiveLayerIndex(layers.length);
	};

	const toggleLayerVisibility = (index: number) => {
		const newLayers = [...layers];
		newLayers[index] = {
			...newLayers[index],
			isVisible: newLayers[index].isVisible === false,
		};
		setLayers(newLayers);
	};

	const removeLayer = (index: number) => {
		if (layers.length > 1) {
			const newLayers = [...layers];
			newLayers.splice(index, 1);
			setLayers(newLayers);

			if (activeLayerIndex >= index && activeLayerIndex > 0) {
				setActiveLayerIndex(activeLayerIndex - 1);
			}
		} else {
			toast.error("You must have at least one shadow layer.");
		}
	};

	const updateLayer = (
		index: number,
		key: keyof ShadowLayer,
		value: string | number | boolean,
	) => {
		const newLayers = [...layers];
		newLayers[index] = { ...newLayers[index], [key]: value };
		setLayers(newLayers);
	};

	const updateAllLayersPosition = (
		property: "offsetX" | "offsetY",
		value: number,
	) => {
		const diff = value - layers[activeLayerIndex][property];
		const newLayers = layers.map((layer) => ({
			...layer,
			[property]: layer[property] + diff,
		}));
		setLayers(newLayers);
	};

	const updateAllLayersShadowType = (isInner: boolean) => {
		const newLayers = layers.map((layer) => ({
			...layer,
			isInner: isInner,
		}));
		setLayers(newLayers);
	};

	const updateAllLayersBlur = (value: number) => {
		const diff = value - layers[activeLayerIndex].blur;
		const newLayers = layers.map((layer) => ({
			...layer,
			blur: Math.max(0, layer.blur + diff),
		}));
		setLayers(newLayers);
	};

	const updateAllLayersSpread = (value: number) => {
		const diff = value - layers[activeLayerIndex].spread;
		const newLayers = layers.map((layer) => ({
			...layer,
			spread: layer.spread + diff,
		}));
		setLayers(newLayers);
	};

	const updateAllLayersOpacity = (value: number) => {
		const ratio = value / layers[activeLayerIndex].opacity;
		const newLayers = layers.map((layer) => ({
			...layer,
			opacity: Math.min(100, Math.max(0, Math.round(layer.opacity * ratio))),
		}));
		setLayers(newLayers);
	};

	const toggleGlobalMasterMode = (enabled: boolean) => {
		setGlobalMasterMode(enabled);
	};

	return (
		<ScrollArea className="h-full rounded-xl border bg-card-bg p-3 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
			<div className="flex items-center justify-between pb-4">
				<h1 className="text-xl">Shadow Controls</h1>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 dark:text-gray-400"
						>
							<Info className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent className="max-w-sm">
						<p>
							Add multiple shadow layers to create complex effects. Each layer
							can have its own properties.
						</p>
					</TooltipContent>
				</Tooltip>
			</div>

			<div className="space-y-6">
				<div className="space-y-3 rounded-md border bg-main p-2">
					<div className="flex flex-1 flex-wrap items-center gap-2">
						{layers.map((layer, index) => (
							<div
								key={index}
								className={`flex items-center rounded-lg pr-1.5 shadow-box dark:inset-shadow-dark ${
									activeLayerIndex === index
										? "bg-primary"
										: "dark:bg-neutral-900 dark:hover:bg-neutral-950"
								}`}
							>
								<Button
									onClick={() => setActiveLayerIndex(index)}
									className={`h-8 w-10 shrink-0 border-0 bg-transparent text-xs shadow-none hover:bg-transparent 2xl:w-12 dark:inset-shadow-none ${
										activeLayerIndex === index
											? "text-primary-foreground"
											: "text-primary"
									}`}
								>
									<span>Lyr {index + 1}</span>
								</Button>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => toggleLayerVisibility(index)}
									className={`h-5 w-5 ${
										activeLayerIndex === index
											? "bg-neutral-700 text-primary-foreground dark:bg-neutral-300"
											: "text-primary"
									}`}
									title={
										layer.isVisible === false ? "Show layer" : "Hide layer"
									}
								>
									{layer.isVisible === false ? (
										<EyeOff className="h-2 w-2" />
									) : (
										<Eye className="h-2 w-2" />
									)}
								</Button>
							</div>
						))}
					</div>
					<div className="flex gap-2">
						<Button
							onClick={addLayer}
							size="icon"
							className="shrink-0 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900"
						>
							<Plus className="h-4 w-4 text-primary" />
						</Button>
						<Button
							onClick={() => removeLayer(activeLayerIndex)}
							size="icon"
							variant="destructive"
							className="shrink-0"
							disabled={layers.length <= 1}
						>
							<Trash className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Shadow Colors */}
				<div className="rounded-md border bg-main p-3">
					<div className="mb-2 flex items-center justify-between">
						<Label className="font-medium text-black text-sm dark:text-white">
							Shadow Colors
						</Label>
					</div>

					{layers.length > 1 && (
						<p className="mb-2 text-muted-foreground text-xs dark:text-gray-400">
							This shadow uses multiple colors. Click on a color to edit all
							instances.
						</p>
					)}
					<div className="flex flex-wrap items-center gap-2">
						{layers?.map((layer, index) => (
							<div key={index}>
								{activeLayerIndex === index ? (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="flex h-8 items-center gap-1.5 border-0 px-2"
												style={{
													backgroundColor: `${layer.color}50`,
												}}
											>
												<div
													className="h-4 w-4 rounded-full border"
													style={{
														backgroundColor: layer.color,
													}}
												/>
												<span className="text-xs">
													{layers[activeLayerIndex].color}
												</span>
												<span className="ml-1 text-muted-foreground text-xs">
													({index + 1})
												</span>
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-3" align="start">
											<div className="space-y-2">
												<div className="flex justify-center">
													<ChromePicker
														color={layers[activeLayerIndex].color}
														onChange={(colorResult) => {
															updateLayer(
																activeLayerIndex,
																"color",
																colorResult.hex,
															);
														}}
														disableAlpha={true}
													/>
												</div>
												<div className="mt-2 flex items-center gap-2">
													<Input
														type="text"
														value={layers[activeLayerIndex].color}
														onChange={(e) => {
															if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
																updateLayer(
																	activeLayerIndex,
																	"color",
																	e.target.value,
																);
															}
														}}
														className="h-8 flex-1 bg-card-bg text-xs"
													/>
												</div>
											</div>
										</PopoverContent>
									</Popover>
								) : (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													className="flex h-8 cursor-not-allowed items-center gap-1.5 px-2 opacity-40 dark:border-gray-700"
													style={{
														backgroundColor: `${layer.color}20`,
													}}
												>
													<div
														className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600"
														style={{ backgroundColor: layer.color }}
													/>
													<span className="text-xs">{layer.color}</span>
													<span className="ml-1 text-muted-foreground text-xs">
														({index + 1})
													</span>
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													Switch to ({index + 1}) layer using this color to edit
													it
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</div>
						))}
					</div>
				</div>

				<div className="space-y-3 rounded-lg border bg-main p-4">
					<div className="flex items-center space-x-2">
						<Switch
							id="global-mode"
							className="shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.05),0_2px_2px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)]"
							checked={globalMasterMode}
							onCheckedChange={toggleGlobalMasterMode}
						/>
						<Label htmlFor="global-mode">Global Control Mode</Label>
					</div>
					<div className="flex justify-between gap-4">
						<div>
							<div className="mb-2 flex items-center">
								<Label className="dark:text-gray-300">Shadow Type</Label>
							</div>
							<RadioGroup
								value={layers[activeLayerIndex].isInner ? "inner" : "outer"}
								onValueChange={(value) => {
									if (globalMasterMode || globalShadowTypeMode) {
										updateAllLayersShadowType(value === "inner");
									} else {
										updateLayer(activeLayerIndex, "isInner", value === "inner");
									}
								}}
								className="flex gap-4"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem
										value="outer"
										id="outer"
										className="dark:border-gray-600"
									/>
									<Label htmlFor="outer" className="dark:text-gray-300">
										Outer Shadow
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem
										value="inner"
										id="inner"
										className="dark:border-gray-600"
									/>
									<Label htmlFor="inner" className="dark:text-gray-300">
										Inner Shadow
									</Label>
								</div>
							</RadioGroup>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-2">
						<div className="space-y-2">
							<Label className="flex items-center justify-between dark:text-gray-300">
								Horizontal Offset:
								<div className="flex items-center gap-2">
									<Input
										type="number"
										value={layers[activeLayerIndex].offsetX}
										onChange={(e) => {
											const value = Number.parseInt(e.target.value) || 0;
											globalMasterMode || globalPositionMode
												? updateAllLayersPosition("offsetX", value)
												: updateLayer(activeLayerIndex, "offsetX", value);
										}}
										min={-50}
										max={50}
										className="h-8 w-16 bg-card-bg text-center"
									/>
									<span className="ml-1 text-sm dark:text-gray-400">px</span>
								</div>
							</Label>
							<CustomSlider
								value={[layers[activeLayerIndex].offsetX]}
								min={-50}
								max={50}
								step={1}
								onValueChange={(value) =>
									globalMasterMode || globalPositionMode
										? updateAllLayersPosition("offsetX", value[0])
										: updateLayer(activeLayerIndex, "offsetX", value[0])
								}
								className="dark:bg-gray-800"
							/>
						</div>

						<div className="space-y-2">
							<Label className="flex items-center justify-between dark:text-gray-300">
								Vertical Offset:
								<div className="flex items-center gap-2">
									<Input
										type="number"
										value={layers[activeLayerIndex].offsetY}
										onChange={(e) => {
											const value = Number.parseInt(e.target.value) || 0;
											globalMasterMode || globalPositionMode
												? updateAllLayersPosition("offsetY", value)
												: updateLayer(activeLayerIndex, "offsetY", value);
										}}
										min={-50}
										max={50}
										className="h-8 w-16 bg-card-bg text-center"
									/>
									<span className="ml-1 text-sm dark:text-gray-400">px</span>
								</div>
							</Label>
							<CustomSlider
								value={[layers[activeLayerIndex].offsetY]}
								min={-50}
								max={50}
								step={1}
								onValueChange={(value) =>
									globalMasterMode || globalPositionMode
										? updateAllLayersPosition("offsetY", value[0])
										: updateLayer(activeLayerIndex, "offsetY", value[0])
								}
								className="dark:bg-gray-800"
							/>
						</div>

						<div className="space-y-2">
							<Label className="flex items-center justify-between dark:text-gray-300">
								Blur Radius:
								<div className="flex items-center gap-2">
									<Input
										type="number"
										value={layers[activeLayerIndex].blur}
										onChange={(e) => {
											const value = Number.parseInt(e.target.value) || 0;
											globalMasterMode || globalBlurMode
												? updateAllLayersBlur(value)
												: updateLayer(activeLayerIndex, "blur", value);
										}}
										min={0}
										max={100}
										className="h-8 w-16 bg-card-bg text-center"
									/>
									<span className="ml-1 text-sm dark:text-gray-400">px</span>
								</div>
							</Label>
							<CustomSlider
								value={[layers[activeLayerIndex].blur]}
								min={0}
								max={100}
								step={1}
								onValueChange={(value) =>
									globalMasterMode || globalBlurMode
										? updateAllLayersBlur(value[0])
										: updateLayer(activeLayerIndex, "blur", value[0])
								}
								className="dark:bg-gray-800"
							/>
						</div>

						<div className="space-y-2">
							<Label className="flex items-center justify-between dark:text-gray-300">
								Spread Radius:
								<div className="flex items-center gap-2">
									<Input
										type="number"
										value={layers[activeLayerIndex].spread}
										onChange={(e) => {
											const value = Number.parseInt(e.target.value) || 0;
											globalMasterMode || globalSpreadMode
												? updateAllLayersSpread(value)
												: updateLayer(activeLayerIndex, "spread", value);
										}}
										min={-50}
										max={50}
										className="h-8 w-16 bg-card-bg text-center"
									/>
									<span className="ml-1 text-sm dark:text-gray-400">px</span>
								</div>
							</Label>
							<CustomSlider
								value={[layers[activeLayerIndex].spread]}
								min={-50}
								max={50}
								step={1}
								onValueChange={(value) =>
									globalMasterMode || globalSpreadMode
										? updateAllLayersSpread(value[0])
										: updateLayer(activeLayerIndex, "spread", value[0])
								}
								className="dark:bg-gray-800"
							/>
						</div>

						<div className="space-y-2">
							<Label className="flex items-center justify-between dark:text-gray-300">
								Opacity:
								<div className="flex items-center gap-2">
									<Input
										type="number"
										value={layers[activeLayerIndex].opacity}
										onChange={(e) => {
											const value = Number.parseInt(e.target.value) || 0;
											const clampedValue = Math.min(100, Math.max(0, value));
											globalMasterMode || globalOpacityMode
												? updateAllLayersOpacity(clampedValue)
												: updateLayer(
														activeLayerIndex,
														"opacity",
														clampedValue,
													);
										}}
										min={0}
										max={100}
										className="h-8 w-16 bg-card-bg text-center"
									/>
									<span className="ml-1 text-sm dark:text-gray-400">%</span>
								</div>
							</Label>
							<CustomSlider
								value={[layers[activeLayerIndex].opacity]}
								min={0}
								max={100}
								step={1}
								onValueChange={(value) =>
									globalMasterMode || globalOpacityMode
										? updateAllLayersOpacity(value[0])
										: updateLayer(activeLayerIndex, "opacity", value[0])
								}
								className="dark:bg-gray-800"
							/>
						</div>
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
