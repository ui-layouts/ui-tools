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
import CarbonAd from "@/components/common/carbon-ads";

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

function SVGLineDrawGenerator() {
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
  const [strokeColorPickerOpen, setStrokeColorPickerOpen] = useState(false);
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
    <div className="mx-auto w-full px-5 pt-8 xl:container 2xl:px-0">
      <article className="space-y-3 pb-8">
        <h1 className="text-center font-medium text-2xl sm:text-3xl md:text-5xl ">
          SVG Path Animation For <br /> Developers & Designers
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
          "relative mx-auto grid max-w-screen-lg grid-cols-2 gap-6 px-4 pb-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:px-0 2xl:max-w-screen-xl 2xl:gap-10",
          viewAll && "h-full",
        )}
      >
        {!viewAll && (
          <div className="absolute bottom-0 left-0 z-10 grid h-60 w-full place-content-center bg-gradient-to-t from-42% from-white dark:from-black" />
        )}

        {(viewAll ? examplesSvgPath : examplesSvgPath.slice(0, 10)).map(
          (example, index) => (
            <div
              key={index}
              className="group relative rounded-xl border bg-card-bg p-1"
            >
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
                }}
              >
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
                  onClick={() => reloadAnimation(index)}
                >
                  <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 "
                  onClick={() => copyDynamicCode(index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 " />
                  ) : (
                    <Copy className="h-4 w-4 " />
                  )}
                </Button>
              </div>
            </div>
          ),
        )}
      </div>
      <div className="relative grid h-screen grid-cols-12 gap-6" id="editor">
        {/* Left Column - Examples and Animation Settings */}
        <div
          className={cn(
            "sticky inset-shadow-[0_1px_rgb(0_0_0/0.10)] top-2 h-[98vh] space-y-6 rounded-lg border bg-card-bg p-3 lg:col-span-4 2xl:col-span-3 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0",
            editPath || customDrawLine ? "hidden" : "hidden lg:block",
          )}
        >
          <Tabs defaultValue="presets">
            <TabsList className="flex h-12 w-full gap-1 rounded-md border bg-main p-1.5 ">
              <TabsTrigger
                value="presets"
                className="relative h-full w-full cursor-pointer rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground lg:text-sm 2xl:text-base"
              >
                Presets
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="relative h-full w-full cursor-pointer rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground lg:text-sm 2xl:text-base"
              >
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="edited"
                className="relative h-full w-full cursor-pointer rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground lg:text-sm 2xl:text-base"
              >
                Edited
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="relative h-full w-full cursor-pointer rounded-md text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground lg:text-sm 2xl:text-base"
              >
                Saved
              </TabsTrigger>

              {/* <TabsTrigger
                value="custom-paths"
                className="relative h-full w-full 2xl:text-base text-sm cursor-pointer rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Custom
              </TabsTrigger> */}
            </TabsList>
            <TabsContent value="presets" className="h-[80vh] 2xl:h-[85vh]">
              <ScrollArea className=" h-[80vh] space-y-6 overflow-auto rounded-lg border bg-main p-3 2xl:h-[85vh] ">
                <ExamplePaths
                  onSelectPath={setCurrentPath}
                  // onEditPath={openEditorForExample}
                  setActivePresets={setActivePresets}
                  activePresets={activePresets}
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="settings">
              {/* Animation Settings */}
              <div className="space-y-4 rounded-lg border bg-main p-4">
                <div className="space-y-2">
                  <Label htmlFor="viewBox">ViewBox</Label>
                  <Input
                    id="viewBox"
                    value={settings.viewBox}
                    onChange={(e) => updateSetting("viewBox", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strokeColor">Stroke Color</Label>
                  <div className="flex gap-2">
                    <Popover
                      open={strokeColorPickerOpen}
                      onOpenChange={setStrokeColorPickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-10 w-10 border-2 p-0"
                          style={{ backgroundColor: settings.strokeColor }}
                        >
                          <span className="sr-only">Pick a color</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                          color={settings.strokeColor}
                          onChange={(color) =>
                            updateSetting("strokeColor", color)
                          }
                        />
                        <div className="mt-2 flex">
                          <Input
                            value={settings.strokeColor}
                            onChange={(e) =>
                              updateSetting("strokeColor", e.target.value)
                            }
                            className="flex-1"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      value={settings.strokeColor}
                      onChange={(e) =>
                        updateSetting("strokeColor", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="strokeWidth">
                    Stroke Width: {settings.strokeWidth}
                  </Label>
                  <CustomSlider
                    id="strokeWidth"
                    min={1}
                    max={10}
                    step={0.5}
                    value={[settings.strokeWidth]}
                    onValueChange={(value) =>
                      updateSetting("strokeWidth", value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strokeLinecap">Stroke Linecap</Label>
                  <Select
                    value={settings.strokeLinecap}
                    onValueChange={(value) =>
                      updateSetting("strokeLinecap", value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select linecap style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="butt">Butt</SelectItem>
                      <SelectItem value="round">Round</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animationDuration">
                    Animation Duration: {settings.animationDuration}s
                  </Label>
                  <CustomSlider
                    id="animationDuration"
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={[settings.animationDuration]}
                    onValueChange={(value) =>
                      updateSetting("animationDuration", value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animationDelay">
                    Animation Delay: {settings.animationDelay}s
                  </Label>
                  <CustomSlider
                    id="animationDelay"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[settings.animationDelay]}
                    onValueChange={(value) =>
                      updateSetting("animationDelay", value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animationBounce">
                    Animation Bounce: {settings.animationBounce}
                  </Label>
                  <CustomSlider
                    id="animationBounce"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[settings.animationBounce]}
                    onValueChange={(value) =>
                      updateSetting("animationBounce", value[0])
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="reverseAnimation"
                    checked={settings.reverseAnimation}
                    onCheckedChange={(checked) =>
                      updateSetting("reverseAnimation", checked)
                    }
                  />
                  <Label htmlFor="reverseAnimation">Reverse Animation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableHoverAnimation"
                    checked={settings.enableHoverAnimation}
                    onCheckedChange={(checked) =>
                      updateSetting("enableHoverAnimation", checked)
                    }
                  />
                  <Label htmlFor="enableHoverAnimation">
                    Enable Hover Animation
                  </Label>
                </div>

                {settings.enableHoverAnimation && (
                  <div className="space-y-2">
                    <Label htmlFor="hoverAnimationType">
                      Hover Animation Type
                    </Label>
                    <Select
                      value={settings.hoverAnimationType}
                      onValueChange={(value) =>
                        updateSetting("hoverAnimationType", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select animation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="float">Float</SelectItem>
                        <SelectItem value="pulse">Pulse</SelectItem>
                        <SelectItem value="redraw">Redraw</SelectItem>
                        <SelectItem value="color">Color</SelectItem>
                        <SelectItem value="sequential">Sequential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>
            {/* <TabsContent value="custom-paths">
              <CustomLineInput 
              activePresets={activePresets}
              setActivePresets={setActivePresets}
              />
            </TabsContent> */}
            <TabsContent value="edited">
              <SavedEditedPathsTab
                activePresets={activePresets}
                setActivePresets={setActivePresets}
                onSelectPath={(path, viewBox) => {
                  setCurrentPath(path);
                  updateSetting("viewBox", viewBox);
                  setPreviewKey((prev) => prev + 1);
                }}
              />
            </TabsContent>
            <TabsContent value="saved">
              <SavedPathsTab
                activePresets={activePresets}
                setActivePresets={setActivePresets}
                onSelectPath={(path, viewBox) => {
                  setCurrentPath(path);
                  updateSetting("viewBox", viewBox);
                  setPreviewKey((prev) => prev + 1);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Preview and Drawing Canvas */}
        <div
          className={cn(
            " relative h-[100vh] py-4 ",
            customDrawLine || editPath
              ? "col-span-12 xl:col-span-12"
              : "col-span-12 lg:col-span-8 2xl:col-span-9",
          )}
        >
          {/* Preview Section */}
          <Card className="mb-6 h-full">
            <CardHeader>
              <div
                className={cn(
                  "flex flex-wrap items-center",
                  customDrawLine || editPath
                    ? "justify-between"
                    : "justify-between",
                )}
              >
                <CardTitle>
                  {customDrawLine
                    ? "Drawing"
                    : editPath
                      ? "Editing"
                      : "Preview"}
                </CardTitle>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant={customDrawLine ? "destructive" : "base"}
                    size="sm"
                    onClick={handleLineDraw}
                    disabled={editPath}
                    className="w-fit"
                  >
                    {customDrawLine ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <PencilLine className="h-4 w-4" />
                    )}
                    {customDrawLine ? "Cancel Draw" : "Draw Line"}
                  </Button>
                  <Button
                    variant={editPath ? "destructive" : "base"}
                    size="sm"
                    onClick={handleEditPath}
                    className="w-fit"
                    disabled={!activePresets}
                  >
                    {editPath ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                    {editPath ? "Close Edit" : "Edit Path"}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-fit"
                    onClick={() => setPreviewKey((prev) => prev + 1)}
                  >
                    <RefreshCcw className="h-4 w-4 " />
                  </Button>
                  <Button onClick={copyCode} className="h-10 w-fit ">
                    <Copy className="h-4 w-4 " />
                  </Button>
                  <CopyToClipboard
                    classname="relative w-fit flex items-center gap-2 h-10 top-0 px-2 ml-2"
                    text={compoentCode}
                  >
                    Component Code
                  </CopyToClipboard>
                  {/* <CopyCode code={compoentCode} settings={settings}></CopyCode> */}
                </div>
              </div>
              {!customDrawLine && !editPath && (
                <CardDescription>See your animation in action</CardDescription>
              )}
            </CardHeader>
            <CardContent className="h-[85%] 2xl:h-[90%]">
              <PanelGroup direction="horizontal">
                <Panel defaultSize={customDrawLine ? 50 : 100} minSize={20}>
                  <div
                    className={cn(
                      "relative flex w-full items-center justify-center rounded-xl",
                      editPath ? "h-[95%] p-0 " : "h-[95%] border bg-main p-4 ",
                      customDrawLine && "h-full",
                    )}
                  >
                    {/* SVG Editor Modal */}
                    {editPath ? (
                      <>
                        <PanelGroup direction="horizontal">
                          <Panel
                            defaultSize={30}
                            minSize={10}
                            className="relative rounded-xl border"
                          >
                            <div className="absolute top-0 right-0 bottom-0 left-0 z-0 rounded-xl bg-[radial-gradient(#79797960_1px,#f3f4f6_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(#ffffff33_1px,#000000_1px)] " />

                            <div
                              key={previewKey}
                              className="relative z-10 h-full w-full "
                            >
                              <AnimateSvg
                                width="100%"
                                height="100%"
                                viewBox={settings.viewBox}
                                className="h-full w-full"
                                path={currentPath}
                                strokeColor={settings.strokeColor}
                                strokeWidth={settings.strokeWidth}
                                strokeLinecap={settings.strokeLinecap as any}
                                animationDuration={settings.animationDuration}
                                animationDelay={settings.animationDelay}
                                animationBounce={settings.animationBounce}
                                reverseAnimation={settings.reverseAnimation}
                                enableHoverAnimation={
                                  settings.enableHoverAnimation
                                }
                                hoverAnimationType={settings.hoverAnimationType}
                              />
                            </div>
                          </Panel>
                          <PanelResizeHandle className="grid w-5 place-items-center rounded-xl p-0">
                            <GripVertical className="w-5 text-neutral-400 " />
                          </PanelResizeHandle>
                          <Panel defaultSize={70} minSize={60}>
                            <SvgEditor
                              setShowSaveDialog={setShowSaveDialog}
                              path={currentPath}
                              onPathChange={(newPath) => {
                                setCurrentPath(newPath);
                                // setPreviewKey((prev) => prev + 1);
                              }}
                              onClose={() => setEditPath(false)}
                              strokeColor={settings.strokeColor}
                              strokeWidth={settings.strokeWidth}
                            />
                          </Panel>
                        </PanelGroup>
                      </>
                    ) : (
                      <>
                        <div className="absolute top-0 right-0 bottom-0 left-0 z-0 rounded-xl bg-[radial-gradient(#79797960_1px,#f3f4f6_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(#ffffff33_1px,#000000_1px)] " />

                        {currentPath || savedPaths.length > 0 ? (
                          <div
                            key={previewKey}
                            className="relative z-10 h-full w-full"
                          >
                            {/* {savedPaths.length > 0 ? (
                              <AnimateSvg
                                width="100%"
                                height="100%"
                                viewBox={settings.viewBox}
                                className="w-full h-full"
                                paths={savedPaths.map((p) => ({ d: p }))}
                                strokeColor={settings.strokeColor}
                                strokeWidth={settings.strokeWidth}
                                strokeLinecap={settings.strokeLinecap as any}
                                animationDuration={settings.animationDuration}
                                animationDelay={settings.animationDelay}
                                animationBounce={settings.animationBounce}
                                reverseAnimation={settings.reverseAnimation}
                                enableHoverAnimation={
                                  settings.enableHoverAnimation
                                }
                                hoverAnimationType={settings.hoverAnimationType}
                              />
                            ) : ( */}
                            <AnimateSvg
                              width="100%"
                              height="100%"
                              viewBox={settings.viewBox}
                              className="h-full w-full"
                              path={currentPath}
                              strokeColor={settings.strokeColor}
                              strokeWidth={settings.strokeWidth}
                              strokeLinecap={settings.strokeLinecap as any}
                              animationDuration={settings.animationDuration}
                              animationDelay={settings.animationDelay}
                              animationBounce={settings.animationBounce}
                              reverseAnimation={settings.reverseAnimation}
                              enableHoverAnimation={
                                settings.enableHoverAnimation
                              }
                              hoverAnimationType={settings.hoverAnimationType}
                            />
                            {/* )} */}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400">
                            <p>Draw or select a path to preview</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Panel>
                {customDrawLine && (
                  <>
                    <PanelResizeHandle className="grid w-5 place-items-center rounded-xl p-0">
                      <GripVertical className="w-5 text-neutral-400 " />
                    </PanelResizeHandle>
                    <Panel defaultSize={customDrawLine ? 50 : 0} minSize={40}>
                      <div className="h-full rounded-lg border bg-main p-4 ">
                        <DrawingCanvas
                          width={400}
                          height={300}
                          onPathChange={setCurrentPath}
                          currentPath={currentPath}
                          strokeWidth={settings.strokeWidth}
                          strokeColor={settings.strokeColor}
                          savePath={savePath}
                        />
                      </div>
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </CardContent>
          </Card>

          {/* Save Path Dialog */}
          {showSaveDialog && (
            <SavePathDialog
              setEditPath={setEditPath}
              editPath={editPath}
              path={currentPath}
              viewBox={settings.viewBox}
              onClose={() => setShowSaveDialog(false)}
            />
          )}

          {/* <CodePreview code={generateCode()} /> */}
        </div>
      </div>
    </div>
  );
}

export default SVGLineDrawGenerator;
