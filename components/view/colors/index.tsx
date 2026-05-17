"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useColorState } from "@/hooks/use-color-state";
import {
	hslToRgb,
	isValidCmyk,
	isValidHsl,
	isValidHsla,
	isValidHsv,
	isValidRgb,
	isValidRgba,
	parseCmyk,
	parseHsl,
	parseHsla,
	parseHsv,
	parseRgb,
	parseRgba,
	rgbToHex,
} from "@/lib/color-utils";
import { Pipette } from "lucide-react";
import { Bookmark, PanelsTopLeft, Settings2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AllColorFormats } from "./all-color-formats";
import { ColorPaletteSection } from "./color-palette-section";
import { HistoryFavorites } from "./history-favorites";
import { ImageColorPicker } from "./image-color-picker";
import { SimplifiedColorPicker } from "./simplified-color-picker";
import { ThemeGenerator } from "./theme-generator";

export default function ColorConverter() {
	const [showPalette, setShowPalette] = useState(true); // Show palette by default
	const [activeSidebarTab, setActiveSidebarTab] = useState<"presets" | "settings" | "saved">("settings");
	const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
	const pathname = usePathname();
	const router = useRouter();

	const {
		hexValue,
		setHexValue,
		rgbValues,
		setRgbValues,
		rgbaValues,
		setRgbaValues,
		hslValues,
		setHslValues,
		hslaValues,
		setHslaValues,
		cmykValues,
		setCmykValues,
		hsvValues,
		setHsvValues,
		palette,
		colorName,
		history,
		colorFormats,
		handleRgbChange,
		handleRgbaChange,
		handleHslChange,
		handleHslaChange,
		isUpdatingRef,
	} = useColorState();

	const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		// Allow any input that contains only valid hex characters
		if (/^#?[0-9A-Fa-f]*$/.test(value)) {
			setHexValue(value.startsWith("#") ? value : `#${value}`);
		}
	};

	const handleColorPicker = (
		e: React.ChangeEvent<HTMLInputElement> | string,
	) => {
		if (typeof e === "string") {
			setHexValue(e);
		} else {
			setHexValue(e.target.value);
		}
	};

	// Input handlers for each format
	const handleRgbInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (isUpdatingRef.current) return;

		if (isValidRgb(value)) {
			const rgb = parseRgb(value);
			if (rgb) {
				isUpdatingRef.current = true;
				try {
					setRgbValues(rgb);
					setRgbaValues((prev) => ({ ...rgb, a: prev.a }));
					const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
					setHexValue(hex);
				} finally {
					isUpdatingRef.current = false;
				}
			}
		}
	};

	const handleRgbaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (isUpdatingRef.current) return;

		if (isValidRgba(value)) {
			const rgba = parseRgba(value);
			if (rgba) {
				isUpdatingRef.current = true;
				try {
					setRgbaValues(rgba);
					setRgbValues({ r: rgba.r, g: rgba.g, b: rgba.b });
					const hex = rgbToHex(rgba.r, rgba.g, rgba.b);
					setHexValue(hex);
				} finally {
					isUpdatingRef.current = false;
				}
			}
		}
	};

	const handleHslInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (isUpdatingRef.current) return;

		if (isValidHsl(value)) {
			const hsl = parseHsl(value);
			if (hsl) {
				isUpdatingRef.current = true;
				try {
					setHslValues(hsl);
					setHslaValues((prev) => ({ ...hsl, a: prev.a }));
					const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
					setRgbValues(rgb);
					setRgbaValues((prev) => ({ ...rgb, a: prev.a }));
					const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
					setHexValue(hex);
				} finally {
					isUpdatingRef.current = false;
				}
			}
		}
	};

	const handleHslaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (isUpdatingRef.current) return;

		if (isValidHsla(value)) {
			const hsla = parseHsla(value);
			if (hsla) {
				isUpdatingRef.current = true;
				try {
					setHslaValues(hsla);
					setHslValues({ h: hsla.h, s: hsla.s, l: hsla.l });
					const rgb = hslToRgb(hsla.h, hsla.s, hsla.l);
					setRgbValues(rgb);
					setRgbaValues({ ...rgb, a: hsla.a });
					const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
					setHexValue(hex);
				} finally {
					isUpdatingRef.current = false;
				}
			}
		}
	};

	const handleCmykInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (isUpdatingRef.current) return;

		if (isValidCmyk(value)) {
			const cmyk = parseCmyk(value);
			if (cmyk) {
				isUpdatingRef.current = true;
				try {
					setCmykValues(cmyk);
					// Convert CMYK to RGB
					const c = cmyk.c / 100;
					const m = cmyk.m / 100;
					const y = cmyk.y / 100;
					const k = cmyk.k / 100;

					const r = Math.round(255 * (1 - c) * (1 - k));
					const g = Math.round(255 * (1 - m) * (1 - k));
					const b = Math.round(255 * (1 - y) * (1 - k));

					setRgbValues({ r, g, b });
					setRgbaValues((prev) => ({ ...prev, r, g, b }));
					const hex = rgbToHex(r, g, b);
					setHexValue(hex);
				} finally {
					isUpdatingRef.current = false;
				}
			}
		}
	};

	const handleHsvInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (isUpdatingRef.current) return;

		if (isValidHsv(value)) {
			const hsv = parseHsv(value);
			if (hsv) {
				isUpdatingRef.current = true;
				try {
					setHsvValues(hsv);

					// Convert HSV to RGB
					const h = hsv.h / 360;
					const s = hsv.s / 100;
					const v = hsv.v / 100;

					// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
					let r;
					// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
					let g;
					// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
					let b;

					const i = Math.floor(h * 6);
					const f = h * 6 - i;
					const p = v * (1 - s);
					const q = v * (1 - f * s);
					const t = v * (1 - (1 - f) * s);

					switch (i % 6) {
						case 0:
							r = v;
							g = t;
							b = p;
							break;
						case 1:
							r = q;
							g = v;
							b = p;
							break;
						case 2:
							r = p;
							g = v;
							b = t;
							break;
						case 3:
							r = p;
							g = q;
							b = v;
							break;
						case 4:
							r = t;
							g = p;
							b = v;
							break;
						case 5:
							r = v;
							g = p;
							b = q;
							break;
						default:
							r = 0;
							g = 0;
							b = 0;
					}

					const rgb = {
						r: Math.round(r * 255),
						g: Math.round(g * 255),
						b: Math.round(b * 255),
					};

					setRgbValues(rgb);
					setRgbaValues((prev) => ({ ...rgb, a: prev.a }));
					const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
					setHexValue(hex);
				} finally {
					isUpdatingRef.current = false;
				}
			}
		}
	};

	// Handler mapping for each format
	const formatHandlers = {
		hex: handleHexChange,
		rgb: handleRgbInput,
		rgba: handleRgbaInput,
		hsl: handleHslInput,
		hsla: handleHslaInput,
		cmyk: handleCmykInput,
		hsv: handleHsvInput,
	};

	return (
		<>
			<div className="h-full w-full overflow-hidden p-3">
				<div className={cn("relative grid h-full min-h-0 gap-3", isSidebarExpanded ? "lg:grid-cols-[70px_320px_minmax(0,1fr)]" : "lg:grid-cols-[70px_0px_minmax(0,1fr)]")}>
					<div className="inset-shadow-[0_1px_rgb(0_0_0/0.10)] hidden h-full min-h-0 rounded-lg border bg-card-bg p-2 lg:flex lg:flex-col lg:justify-between dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
						<div className="space-y-2">{[{ key: "presets", label: "Presets", icon: PanelsTopLeft }, { key: "settings", label: "Settings", icon: Settings2 }, { key: "saved", label: "Saved", icon: Bookmark }].map((item)=><button type="button" key={item.key} onClick={()=>{setIsSidebarExpanded(true);setActiveSidebarTab(item.key as "presets"|"settings"|"saved");}} className={cn("grid h-16 w-full place-items-center rounded-md border px-1 py-1 font-semibold text-[11px]",activeSidebarTab===item.key?"border-primary bg-primary text-primary-foreground":"bg-main")}><item.icon className="h-4 w-4"/><span>{item.label}</span></button>)}</div>
						<Select value={pathname} onValueChange={(value)=>router.push(value)}><SelectTrigger className="h-9 px-2 text-[10px]"><SelectValue placeholder="Go to editor..." /></SelectTrigger><SelectContent><SelectItem value="/color-lab">Color</SelectItem><SelectItem value="/mesh-gradients">Mesh</SelectItem><SelectItem value="/background-snippets">BG</SelectItem></SelectContent></Select>
					</div>
					<div className={cn("inset-shadow-[0_1px_rgb(0_0_0/0.10)] hidden h-full min-h-0 rounded-lg border bg-card-bg p-3 lg:block dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0", !isSidebarExpanded && "pointer-events-none w-0 overflow-hidden border-0 p-0 opacity-0")}>
						{activeSidebarTab === "settings" && <SimplifiedColorPicker
							hexValue={hexValue} rgbValues={rgbValues} hslValues={hslValues} colorName={colorName} handleHexChange={handleHexChange} handleRgbChange={handleRgbChange} handleHslChange={handleHslChange} handleColorPicker={handleColorPicker} setHexValue={setHexValue}
						/>}
						{activeSidebarTab === "presets" && <ColorPaletteSection showPalette={showPalette} setShowPalette={setShowPalette} palette={palette} setHexValue={setHexValue} />}
						{activeSidebarTab === "saved" && <HistoryFavorites history={history} setHexValue={setHexValue} />}
					</div>
					<div className="space-y-6">
						<div className="grid gap-10 px-4 sm:px-0 lg:grid-cols-2">
						<div className="space-y-4">
							{/* Main Color Picker */}
							<SimplifiedColorPicker
								hexValue={hexValue}
								rgbValues={rgbValues}
								hslValues={hslValues}
								colorName={colorName}
								handleHexChange={handleHexChange}
								handleRgbChange={handleRgbChange}
								handleHslChange={handleHslChange}
								handleColorPicker={handleColorPicker}
								setHexValue={setHexValue}
							/>
							{/* All Color Formats Section */}
							<AllColorFormats
								colorFormats={colorFormats}
								formatHandlers={formatHandlers}
							/>
						</div>
						<div>
							{/* Image Color Picker Section */}
							<ImageColorPicker setHexValue={setHexValue} hexValue={hexValue} />
							{/* Color Palette Section */}
							<ColorPaletteSection
								showPalette={showPalette}
								setShowPalette={setShowPalette}
								palette={palette}
								setHexValue={setHexValue}
							/>

							{/* History and Favorites */}
							<HistoryFavorites history={history} setHexValue={setHexValue} />
						</div>
						</div>
						{/* Theme Generator Section */}
						<ThemeGenerator hexValue={hexValue} />
					</div>
				</div>
			</div>
		</>
	);
}
