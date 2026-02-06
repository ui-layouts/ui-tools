"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CopyToClipboard from "@/components/ui/copy-to-clipboard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomSlider } from "@/components/ui/range-slider";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { TabsTrigger } from "@radix-ui/react-tabs";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsRight,
  CodeIcon,
  Copy,
  Edit2,
  GripVertical,
  Loader,
  PencilLine,
  Play,
  RefreshCcw,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { parseAsBoolean, parseAsIndex, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";
import { CopyCode } from "../mesh-gradient/copy-code";
import { AnimateSvg } from "./animate-svg";
import { CodePreview } from "./code-preview";
import { CustomLineInput } from "./custom-line-input";
import { compoentCode, examplesSvgPath } from "./data";
import { DrawingCanvas } from "./drawing-canvas";
import { SavedEditedPathsTab } from "./edited-paths";
import { ExamplePaths } from "./example-paths";
import { SavePathDialog } from "./save-path-dialog";
import { SavedPathsTab } from "./saved-draw-paths";
import { SvgEditor } from "./svg-editor";

type AnimationSettings = {
  width: string;
  height: string;
  viewBox: string;
  strokeColor: string;
  strokeWidth: number;
  strokeLinecap: "butt" | "round" | "square";
  animationDuration: number;
  animationDelay: number;
  animationBounce: number;
  reverseAnimation: boolean;
  enableHoverAnimation: boolean;
  hoverAnimationType: "float" | "pulse" | "redraw" | "color" | "sequential";
};

function SvgDoodles() {
  const { theme } = useTheme();
  const [activePresets, setActivePresets] = useQueryState("presets");
  const [exampleViewBox, setExampleViewBox] = useQueryState("viewBox", {
    defaultValue: "0 0 250 100",
  });
  const [editPath, setEditPath] = useQueryState(
    "editPath",
    parseAsBoolean.withDefault(false),
  );
  const [customDrawLine, setCustomDrawLine] = useQueryState(
    "customDrawLine",
    parseAsBoolean.withDefault(false),
  );
  const [viewAll, setViewAll] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [animationKeys, setAnimationKeys] = useState<Record<number, number>>(
    {},
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedPaths, _setSavedPaths] = useState<string[]>([]);
  const [previewKey, setPreviewKey] = useState(0);
  const [_showEditor, setShowEditor] = useState(false);
  const [_editorViewBox, _setEditorViewBox] = useState("0 0 100 100");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  // Update the default smoothing value to be more appropriate
  const [settings, setSettings] = useState<AnimationSettings>({
    width: "100%",
    height: "100%",
    viewBox: "0 0 250 100",
    strokeColor: "#000000",
    strokeWidth: 2,
    strokeLinecap: "round",
    animationDuration: 1.5,
    animationDelay: 0,
    animationBounce: 0.3,
    reverseAnimation: false,
    enableHoverAnimation: false,
    hoverAnimationType: "redraw",
  });

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      viewBox: exampleViewBox,
      strokeColor: theme === "dark" ? "#ffffff" : "#000000",
    }));
  }, [theme, exampleViewBox]);
  // Update settings
  const updateSetting = <K extends keyof AnimationSettings>(
    key: K,
    value: AnimationSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setPreviewKey((prev) => prev + 1);
  };

  // Save current path
  const savePath = () => {
    if (!currentPath) {
      toast.success("No path to save", {
        description: "Draw something first before saving",
      });
      return;
    }
    setShowSaveDialog(true);
    console.log(currentPath);

    // setSavedPaths((prev) => [...prev, currentPath]);
    // toast.success("Path saved", {
    //   description: "Your path has been added to the collection",
    // });
  };

  // Clear current path
  const _clearPath = () => {
    setCurrentPath("");
  };

  // Copy generated code
  const copyCode = () => {
    const code = generateCode();
    navigator.clipboard.writeText(code);
    toast.success("code copied", {
      description: "The code has been copied to your clipboard",
    });
  };

  // Open the SVG editor for the current path
  const _openEditor = () => {
    if (!currentPath) {
      toast("No path to edit", {
        description: "Draw something first before editing",
      });
      return;
    }
    setShowEditor(true);
  };

  // Open the SVG editor for an example path
  // const openEditorForExample = (path: string, viewBox: string) => {
  //   setCurrentPath(path);
  //   setEditorViewBox(viewBox);
  //   setSettings((prev) => ({
  //     ...prev,
  //     viewBox: viewBox,
  //   }));
  //   setShowEditor(true);
  // };

  const reloadAnimation = (index: number) => {
    setAnimationKeys((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + 1,
    }));
  };

  // Generate code for the current animation
  const generateCode = () => {
    const pathsCode =
      savedPaths.length > 0
        ? `paths={[${savedPaths.map((p) => `{ d: "${p}" }`).join(", ")}]}`
        : `path="${currentPath}"`;

    return `<AnimateSvg
  width="${settings.width}"
  height="${settings.height}"
  viewBox="${settings.viewBox}"
  className="my-svg-animation"
  ${pathsCode}
  strokeColor="${settings.strokeColor}"
  strokeWidth={${settings.strokeWidth}}
  strokeLinecap="${settings.strokeLinecap}"
  animationDuration={${settings.animationDuration}}
  animationDelay={${settings.animationDelay}}
  animationBounce={${settings.animationBounce}}
  reverseAnimation={${settings.reverseAnimation}}
  enableHoverAnimation={${settings.enableHoverAnimation}}
  ${
    settings.enableHoverAnimation
      ? `hoverAnimationType="${settings.hoverAnimationType}"`
      : ""
  }
/>`;
  };

  const handleLineDraw = () => {
    if (activePresets) {
      setActivePresets(null);
      setEditPath(false);
      setCustomDrawLine(true);
    } else {
      setCustomDrawLine(!customDrawLine);
    }
  };
  const handleEditPath = () => {
    if (activePresets) {
      setEditPath(!editPath);
    } else {
      setEditPath(!editPath);
    }
  };

  const copyDynamicCode = (index: number) => {
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
    <div className="mx-auto w-full px-5 xl:container 2xl:px-0">
      <article className="space-y-3 pb-8">
        <h1 className="text-center font-medium text-2xl sm:text-3xl md:text-5xl ">
          SVG Path Animation For <br /> Developers & Designers
        </h1>

        <div className="mx-auto flex w-fit items-center justify-center gap-2 font-semibold">
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
            href="/svg-doodles/generator"
            className="group flex cursor-pointer gap-1 rounded-md border bg-card-bg p-2 text-primary shadow-[0px_1px_0px_0px_rgba(17,17,26,0.1)] hover:bg-accent dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
            Explore Doodles Generator <ChevronsRight />
          </a>
        </div>
      </article>
      <div
        className={cn(
          "relative mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 pb-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:px-0 2xl:max-w-7xl 2xl:gap-10 h-full",
        )}>
        {/* {!viewAll && (
          <div className="absolute bottom-0 left-0 z-10 grid h-60 w-full place-content-center bg-linear-to-t from-42% from-white dark:from-black" />
        )} */}

        {examplesSvgPath.map((example, index) => (
          <div
            key={index}
            className="group relative rounded-xl border bg-card-bg p-1">
            <div
              className={cn(
                " relative h-44 w-full cursor-pointer rounded-xl p-4",
                activePresets === example.id && " bg-main",
              )}
              onClick={() => {
                setCurrentPath(example.path);
                setExampleViewBox(example.viewBox);
                setActivePresets(example.id);
              }}
              onKeyUp={() => {
                setCurrentPath(example.path);
                setExampleViewBox(example.viewBox);
                setActivePresets(example.id);
              }}
              onKeyDown={() => {
                setCurrentPath(example.path);
                setExampleViewBox(example.viewBox);
                setActivePresets(example.id);
              }}
              onKeyPress={() => {
                setCurrentPath(example.path);
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
                onClick={() => copyDynamicCode(index)}>
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
    </div>
  );
}

export default SvgDoodles;
