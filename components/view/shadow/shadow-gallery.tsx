"use client";

import CarbonAd from "@/components/common/carbon-ads";
import CopyToClipboard from "@/components/ui/copy-to-clipboard";
import { Switch } from "@/components/ui/switch";
import { preBuiltShadows } from "@/config/shadow-data";
import { cn } from "@/lib/utils";
import type { ShadowPreset } from "@/types/shadow";
import { ChevronsDown } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface ShadowGalleryProps {
  applyPreset: (preset: ShadowPreset) => void;
  activeShadow: ShadowPreset | null;
  isDarkMode: boolean;
}

export default function ShadowGallery({
  applyPreset,
  isDarkMode,
}: ShadowGalleryProps) {
  const [viewAll, setViewAll] = useState(false);

  return (
    <>
      <article className="space-y-3 pb-8 pt-8">
        <h1 className="text-center font-medium text-2xl sm:text-3xl md:text-5xl">
          The Ultimate Shadow <br /> Generator for Developers.
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
          "relative mx-auto grid max-w-screen-lg grid-cols-3 gap-5 px-5 pb-5 sm:px-0 lg:grid-cols-5 2xl:max-w-screen-xl 2xl:gap-10",
          viewAll ? "h-full" : "h-full ",
        )}
      >
        {!viewAll && (
          <div className="absolute bottom-0 left-0 z-10 grid h-52 w-full place-content-center bg-gradient-to-t from-42% from-white dark:from-black" />
        )}
        {(viewAll ? preBuiltShadows : preBuiltShadows.slice(0, 10)).map(
          (shadow, _index) => (
            <motion.div
              key={shadow.id}
              className={cn(
                "group group relative cursor-pointer rounded-md p-2 lg:p-5 2xl:p-6",
              )}
              onClick={() => applyPreset(shadow)}
            >
              <CopyToClipboard
                classname="top-6 right-7 opacity-0 group-hover:opacity-100 transition-opacity"
                text={shadow.tailwind}
              />
              <div
                className={cn(
                  "relative flex aspect-square w-full flex-col items-center justify-center rounded-lg text-center text-neutral-700 text-xs transition-transform group-hover:scale-105 dark:bg-neutral-950 dark:text-neutral-400",
                  isDarkMode
                    ? shadow.darkTailwind
                      ? shadow.darkTailwind
                      : shadow.tailwind
                    : shadow.tailwind,
                )}
              >
                {shadow.name}
              </div>
            </motion.div>
          ),
        )}
      </div>
    </>
  );
}
