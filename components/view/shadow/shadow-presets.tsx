"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { preBuiltShadows, preBuiltTextShadows } from "@/config/shadow-data";
import { cn } from "@/lib/utils";
import type { ShadowPreset } from "@/types/shadow";
import { Star, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import toast from "react-hot-toast";

interface ShadowPresetsProps {
	mode: "presets" | "edited" | "saved";
	shadowMode: "box" | "text";
	activeShadow: ShadowPreset | null;
	applyPreset: (preset: ShadowPreset) => void;
	savedShadows: ShadowPreset[];
	favorites: string[];
	toggleFavorite: (id: string) => void;
	isFavorite: (id: string) => boolean;
	deleteShadow: (id: string) => void;
	currentPresetId: string | null;
	setCurrentPresetId: React.Dispatch<React.SetStateAction<string | null>>;
	isDarkMode: boolean;
	textShadowValue: string;
	setTextShadowValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function ShadowPresets({
	mode,
	shadowMode,
	activeShadow,
	applyPreset,
	savedShadows,
	favorites,
	toggleFavorite,
	isFavorite,
	deleteShadow,
	currentPresetId,
	setCurrentPresetId,
	isDarkMode,
	textShadowValue,
	setTextShadowValue,
}: ShadowPresetsProps) {
	const favouriteShadows = preBuiltShadows.filter((s) =>
		favorites.includes(s.id),
	);

	if (shadowMode === "text") {
		return (
			<ScrollArea className="h-full rounded-xl border bg-card-bg p-4 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
				{mode === "presets" ? (
					<div className="grid grid-cols-1 gap-3">
						{preBuiltTextShadows.map((preset) => (
							<button
								type="button"
								key={preset.id}
								onClick={() => setTextShadowValue(preset.textShadow)}
								className={cn(
									"rounded-lg border bg-main p-4 text-left transition hover:border-primary",
									textShadowValue === preset.textShadow &&
										"border-primary ring-1 ring-primary",
								)}
							>
								<p className="font-medium text-sm">{preset.name}</p>
								<p
									className="mt-2 font-semibold text-2xl"
									style={{ textShadow: preset.textShadow }}
								>
									Shadow
								</p>
								<code className="mt-2 block truncate text-[11px] text-muted-foreground">
									{preset.tailwindV4}
								</code>
							</button>
						))}
					</div>
				) : (
					<p className="text-muted-foreground text-sm">
						Text shadow presets are currently available under the Presets tab.
					</p>
				)}
			</ScrollArea>
		);
	}

	return (
		<ScrollArea className="h-full rounded-xl border bg-card-bg dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
			{mode === "saved" && savedShadows.length > 0 && (
				<div className="grid grid-cols-1 gap-3 border-b p-4 xl:grid-cols-2">
					{savedShadows.map((shadow) => (
						<motion.div
							key={shadow.id}
							className={cn("group relative cursor-pointer rounded-md p-4")}
							onClick={() => {
								const savedPreset = {
									id: shadow.id,
									name: shadow.name,
									tailwind: shadow.tailwind,
									css: shadow.css,
									darkTailwind: shadow.darkTailwind,
									darkCss: shadow.darkCss,
									layers: shadow.layers,
									darkLayers: shadow.darkLayers || shadow.layers,
								};
								applyPreset(savedPreset);
							}}
						>
							<AnimatePresence mode="wait">
								{shadow.id === activeShadow?.id && (
									<motion.div
										transition={{
											layout: {
												duration: 0.2,
												ease: "easeInOut",
											},
										}}
										layoutId={"animate-bg"}
										className="absolute top-0 left-0 h-full w-full rounded-lg border bg-main"
									/>
								)}
							</AnimatePresence>
							<div
								className="relative flex h-36 w-full flex-col items-center justify-center rounded-lg text-center text-neutral-700 text-sm transition-transform group-hover:scale-105 dark:bg-neutral-950 dark:text-neutral-400"
								style={{
									boxShadow:
										isDarkMode && shadow.darkCss ? shadow.darkCss : shadow.css,
								}}
							>
								<div className="flex flex-col items-center">{shadow.name}</div>
								<Badge variant="outline" className="mt-1 text-[10px]">
									Custom
								</Badge>
							</div>

							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									deleteShadow(shadow.id);
									if (currentPresetId === shadow.id) {
										setCurrentPresetId(null);
									}
									toast.success("Your custom shadow has been removed.");
								}}
								className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 text-red-500 opacity-0 backdrop-blur-sm transition-opacity hover:text-red-600 group-hover:opacity-100"
							>
								<Trash className="h-3 w-3" />
							</Button>
						</motion.div>
					))}
				</div>
			)}

			{mode === "edited" && favouriteShadows.length > 0 && (
				<div className="grid grid-cols-1 gap-3 border-b p-4 xl:grid-cols-2">
					{favouriteShadows.map((shadow) => (
						<motion.div
							key={shadow.id}
							className={cn("group relative cursor-pointer rounded-md p-4")}
							onClick={() => applyPreset(shadow)}
						>
							<AnimatePresence mode="wait">
								{shadow.id === activeShadow?.id && (
									<motion.div
										transition={{
											layout: {
												duration: 0.2,
												ease: "easeInOut",
											},
										}}
										layoutId={"animate-bg"}
										className="absolute top-0 left-0 h-full w-full rounded-lg border bg-main"
									/>
								)}
							</AnimatePresence>
							<div
								className={cn(
									"relative flex h-36 w-full flex-col items-center justify-center rounded-lg text-center text-neutral-700 text-sm transition-transform group-hover:scale-105 dark:bg-neutral-950 dark:text-neutral-400",
									isDarkMode
										? shadow.darkTailwind || shadow.tailwind
										: shadow.tailwind,
								)}
							>
								<div className="flex flex-col items-center">{shadow.name}</div>
								<Badge variant="outline" className="mt-1 text-[10px]">
									Favourite
								</Badge>
							</div>

							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									toggleFavorite(shadow.id);
								}}
								className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
							>
								<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
							</Button>
						</motion.div>
					))}
				</div>
			)}

			{mode === "presets" && (
				<div className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-2">
					{preBuiltShadows.map((shadow, index) => (
						<motion.div
							key={shadow.id || `preset_${index}`}
							className={cn("group relative cursor-pointer rounded-md p-4")}
							onClick={() => applyPreset(shadow)}
						>
							<AnimatePresence mode="wait">
								{shadow.id === activeShadow?.id && (
									<motion.div
										transition={{
											layout: {
												duration: 0.2,
												ease: "easeInOut",
											},
										}}
										layoutId={"animate-bg"}
										className="absolute top-0 left-0 h-full w-full rounded-lg border bg-main"
									/>
								)}
							</AnimatePresence>
							<div
								className={cn(
									"relative flex h-36 w-full flex-col items-center justify-center rounded-lg text-center text-neutral-700 text-sm transition-transform group-hover:scale-105 dark:bg-neutral-950 dark:text-neutral-400",
									isDarkMode
										? shadow.darkTailwind || shadow.tailwind
										: shadow.tailwind,
								)}
							>
								{shadow.name}
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									toggleFavorite(shadow.id || `preset_${index}`);
								}}
								className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
							>
								{isFavorite(shadow.id || `preset_${index}`) ? (
									<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
								) : (
									<Star className="h-3 w-3" />
								)}
							</Button>
						</motion.div>
					))}
				</div>
			)}

			{mode === "saved" && savedShadows.length === 0 && (
				<p className="p-4 text-muted-foreground text-sm">
					No saved shadows yet.
				</p>
			)}
			{mode === "edited" && favouriteShadows.length === 0 && (
				<p className="p-4 text-muted-foreground text-sm">
					No edited/favorited shadows yet.
				</p>
			)}
		</ScrollArea>
	);
}
