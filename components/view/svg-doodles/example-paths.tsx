"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimateSvg } from "./animate-svg";
import { cn } from "@/lib/utils";
import { Check, Copy, Edit2, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { examplesSvgPath } from "./data";

interface ExamplePathsProps {
  onSelectPath: (path: string) => void;
  // onEditPath: (path: string, viewBox: string) => void
  setActivePresets: (presets: string) => void;
  activePresets: string | null;
}

export function ExamplePaths({
  onSelectPath,
  setActivePresets,
  activePresets,
}: ExamplePathsProps) {
  const { theme } = useTheme();
  const [_exampleViewBox, setExampleViewBox] = useQueryState("viewBox", {
    defaultValue: "0 0 250 100",
  });
  const [animationKeys, setAnimationKeys] = useState<Record<number, number>>(
    {},
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Reload animation for a specific example
  const reloadAnimation = (index: number) => {
    setAnimationKeys((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + 1,
    }));
  };

  // Copy component code to clipboard
  const copyComponentCode = (index: number) => {
    const example = examplesSvgPath[index];

    // Generate the full component code
    const code = `<AnimateSvg
  width="100%"
  height="100%"
  viewBox="${example.viewBox}"
  className="my-svg-animation"
  path="${example.path}"
  strokeColor="#000000"
  strokeWidth={3}
  strokeLinecap="round"
  animationDuration={1.5}
  animationDelay={0}
  animationBounce={0.3}
  reverseAnimation={false}
  enableHoverAnimation={true}
  hoverAnimationType="redraw"
  hoverStrokeColor="#4f46e5"
/>`;

    navigator.clipboard.writeText(code).then(() => {
      setCopiedIndex(index);
      toast.success("Component code copied", {
        description: `${example.name} component code copied to clipboard`,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {examplesSvgPath.map((example, index) => (
        <div
          key={index}
          className="group relative rounded-xl border bg-card-bg p-1">
          <div
            className={cn(
              "relative h-28 w-full cursor-pointer rounded-xl p-4",
              activePresets === example.id && " bg-main",
            )}
            onClick={() => {
              onSelectPath(example.path);
              setExampleViewBox(example.viewBox);
              setActivePresets(example.id);
            }}
            onKeyDown={(e) => {
              e.preventDefault();
              onSelectPath(example.path);
              setExampleViewBox(example.viewBox);
              setActivePresets(example.id);
            }}>
            <AnimateSvg
              key={animationKeys[index] || 0}
              width="100"
              height="100"
              viewBox={example.viewBox}
              className="h-full w-full"
              path={example.path}
              strokeColor={theme === "light" ? "#000000" : "#ffffff"}
              strokeWidth={3}
              strokeLinecap="round"
              animationDuration={1.5}
              animationDelay={0}
              animationBounce={0.3}
              reverseAnimation={false}
            />
            <p className="absolute bottom-0 left-0 w-full p-2 text-center font-semibold">
              {example.name}
            </p>
          </div>

          <div className="absolute top-1 right-1 z-50 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              className="group h-8 w-8"
              onClick={() => reloadAnimation(index)}>
              <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 "
              onClick={() => copyComponentCode(index)}>
              {copiedIndex === index ? (
                <Check className="h-4 w-4 " />
              ) : (
                <Copy className="h-4 w-4 " />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
