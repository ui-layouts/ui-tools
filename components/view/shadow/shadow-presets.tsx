"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { preBuiltShadows } from "@/config/shadow-data";
import { cn } from "@/lib/utils";
import type { ShadowPreset } from "@/types/shadow";
import { Star, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import toast from "react-hot-toast";

interface ShadowPresetsProps {
	mode: "presets" | "edited" | "saved";
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
}

export default function ShadowPresets({
	mode,
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
}: ShadowPresetsProps) {
	const favouriteShadows = preBuiltShadows.filter((s) =>
		favorites.includes(s.id),
	);

	return (
		<ScrollArea className="h-full rounded-xl border bg-card-bg dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
			{mode === "saved" && savedShadows.length > 0 && (
				<div className="grid grid-cols-2 gap-2 border-b p-4 xl:grid-cols-3 2xl:grid-cols-3">
					{savedShadows.map((shadow) => (
						<motion.div
							key={shadow.id}
							className={cn("group relative cursor-pointer rounded-md p-4")}
							onClick={() => {
								// Create a preset-like object from saved shadow
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
								className={cn(
									"relative flex h-20 w-full flex-col items-center justify-center rounded-lg text-center text-neutral-700 text-xs transition-transform group-hover:scale-105 dark:bg-neutral-950 dark:text-neutral-400",
								)}
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
				<div className="grid grid-cols-2 gap-2 border-b p-4 xl:grid-cols-3 2xl:grid-cols-3">
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
									"relative flex h-20 w-full flex-col items-center justify-center rounded-lg text-center text-neutral-700 text-xs transition-transform group-hover:scale-105 dark:bg-neutral-950 dark:text-neutral-400",
									isDarkMode
										? shadow.darkTailwind
											? shadow.darkTailwind
											: shadow.tailwind
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
				<div className="grid grid-cols-2 gap-2 p-4 xl:grid-cols-3 2xl:grid-cols-3">
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
									"relative flex h-20 w-full flex-col items-center justify-center rounded-lg text-center text-neutral-700 text-xs transition-transform group-hover:scale-105 dark:bg-neutral-950 dark:text-neutral-400",
									isDarkMode
										? shadow.darkTailwind
											? shadow.darkTailwind
											: shadow.tailwind
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
