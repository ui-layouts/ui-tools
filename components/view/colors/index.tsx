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
import { ChevronsDown, Pipette } from "lucide-react";
import { useState } from "react";
import { AllColorFormats } from "./all-color-formats";
import { ColorPaletteSection } from "./color-palette-section";
import { HistoryFavorites } from "./history-favorites";
import { ImageColorPicker } from "./image-color-picker";
import { SimplifiedColorPicker } from "./simplified-color-picker";
import { ThemeGenerator } from "./theme-generator";
import CarbonAd from "@/components/common/carbon-ads";

export default function ColorConverter() {
  const [showPalette, setShowPalette] = useState(true); // Show palette by default

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
      <div className="container mx-auto w-full pb-10 pt-8">
        <article className="space-y-3 pb-14">
          <h1 className="text-center font-medium text-2xl capitalize sm:text-3xl md:text-5xl">
            Play, Pick, Convert and <br /> Generate New Colors 🎨
          </h1>

          <div className="mx-auto flex w-fit items-center justify-center gap-2">
            {/* <div className="flex gap-2 rounded-md border bg-card-bg p-2 shadow-[0px_1px_0px_0px_rgba(17,17,26,0.1)] dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
						Expand
						<Switch
							id="view-all-switch"
							checked={viewAll}
							onCheckedChange={setViewAll}
							className="bg-main"
						/>
					</div> */}
            <a
              href="#shadcn-theme"
              className="group flex cursor-pointer gap-1 rounded-md border bg-card-bg p-2 font-semibold text-primary shadow-[0px_1px_0px_0px_rgba(17,17,26,0.1)] hover:bg-accent dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0"
            >
              Shadcn/ui theme
              <ChevronsDown />
            </a>
          </div>
        </article>
        <div className="flex justify-center items-center">
          <CarbonAd />
        </div>

        <div className="space-y-6 ">
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
    </>
  );
}
