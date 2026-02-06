"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnimateSvg } from "./animate-svg";
import { cn } from "@/lib/utils";
import {
  type SavedPath,
  useSavedEditedPathsStore,
} from "@/store/use-saved-edited-paths";
import { formatDistanceToNow } from "date-fns";
import { Check, Copy, Edit2, RefreshCw, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

interface SavedPathsTabProps {
  onSelectPath: (path: string, viewBox: string) => void;
  activePresets: string | null;
  setActivePresets: (presets: string) => void;
}

export function SavedEditedPathsTab({
  activePresets,
  setActivePresets,
  onSelectPath,
}: SavedPathsTabProps) {
  const { theme } = useTheme();
  const [, setExampleViewBox] = useQueryState("viewBox");
  const { savedEditedPaths, deleteEditedPath, clearAllEditedPaths } =
    useSavedEditedPathsStore();
  const [animationKeys, setAnimationKeys] = useState<Record<string, number>>(
    {},
  );

  // Reload animation for a specific path
  const reloadAnimation = (id: string) => {
    setAnimationKeys((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // Delete a path
  const _handleDeletePath = (path: SavedPath) => {
    deleteEditedPath(path.id);
    toast.success("Path deleted", {
      description: `"${path.name}" has been removed from your collection`,
    });
  };

  // Clear all paths
  const handleClearAll = () => {
    if (savedEditedPaths.length === 0) return;

    if (
      confirm(
        "Are you sure you want to delete all saved paths? This cannot be undone.",
      )
    ) {
      clearAllEditedPaths();
      toast.success("All paths deleted", {
        description: "Your saved paths collection has been cleared",
      });
    }
  };
  // Copy component code to clipboard
  const copyComponentCode = (id: string) => {
    const example = savedEditedPaths.find((path) => path.id === id);

    // Generate the full component code
    const code = `<AnimateSvg
  width="100%"
  height="100%"
  viewBox="${example?.viewBox}"
  className="my-svg-animation"
  path="${example?.path}"
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
      toast.success("Component code copied", {
        description: `${example?.name} component code copied to clipboard`,
      });
    });
  };
  // Format the creation date
  const _formatCreationDate = (timestamp: number) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  if (savedEditedPaths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Paths</CardTitle>
          <CardDescription>Your saved paths will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-primary">
            <p>You haven't saved any paths yet.</p>
            <p className="mt-2">Draw a path and save it to see it here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Edited Paths</CardTitle>
          <CardDescription>Your collection of saved paths</CardDescription>
        </div>
        {savedEditedPaths.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {savedEditedPaths.map((savedPath) => (
            <div
              key={savedPath.id}
              className="group relative rounded-xl border bg-card-bg p-1">
              <div
                className={cn(
                  "relative h-28 w-full cursor-pointer rounded-xl p-4",
                  activePresets === savedPath.id && " bg-main",
                )}
                onClick={() => {
                  onSelectPath(savedPath.path, savedPath.viewBox);
                  setActivePresets(savedPath.id);
                  setExampleViewBox(savedPath.viewBox);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSelectPath(savedPath.path, savedPath.viewBox);
                    setActivePresets(savedPath.id);
                    setExampleViewBox(savedPath.viewBox);
                  }
                }}>
                <AnimateSvg
                  key={animationKeys[savedPath.id] || 0}
                  width="100"
                  height="100"
                  viewBox={savedPath.viewBox}
                  className="h-full w-full"
                  path={savedPath.path}
                  strokeColor={theme === "light" ? "#000000" : "#ffffff"}
                  strokeWidth={2}
                  strokeLinecap="round"
                  animationDuration={1.5}
                  animationDelay={0}
                  animationBounce={0.3}
                  reverseAnimation={false}
                />
                <p className="absolute bottom-0 left-0 w-full p-2 text-center font-semibold">
                  {savedPath.name}
                </p>
              </div>

              <div className="absolute top-1 right-1 z-50 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="group h-8 w-8"
                  onClick={() => reloadAnimation(savedPath.id)}>
                  <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 "
                  onClick={() => copyComponentCode(savedPath.id)}>
                  <Copy className="h-4 w-4 " />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
