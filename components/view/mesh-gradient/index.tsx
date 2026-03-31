"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/components/ui/use-media-query";
import { cn } from "@/lib/utils";
import type {
  ControlSections,
  EnvPreset,
  GradientType,
  LightType,
  PointerEventsOption,
  ShaderGradientSettings,
} from "@/types/shader-gradient";
import { ShaderGradientCanvas } from "@shadergradient/react";
import { ShaderGradient } from "@shadergradient/react";
import { ChevronsDown, Menu, MenuIcon } from "lucide-react";
import { type JSX, Suspense, useState } from "react";
import { ControlPanel } from "./control-panel";
import { CopyCode } from "./copy-code";
import { ExampleGradients } from "./example-gradients";
import CarbonAd from "@/components/common/carbon-ads";

const defaultSettings: ShaderGradientSettings = {
  animate: "on",
  type: "waterPlane",
  wireframe: false,
  shader: "defaults",
  uTime: 8,
  uSpeed: 0.3,
  uStrength: 1.5,
  uDensity: 1.5,
  uFrequency: 0,
  uAmplitude: 0,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationX: 50,
  rotationY: 0,
  rotationZ: -60,
  color1: "#242880",
  color2: "#8d7dca",
  color3: "#212121",
  reflection: 0.1,
  cAzimuthAngle: 180,
  cPolarAngle: 80,
  cDistance: 2.8,
  cameraZoom: 9.1,
  lightType: "3d",
  brightness: 1,
  envPreset: "city",
  grain: "on",
  toggleAxis: false,
  zoomOut: false,
  hoverState: "",
  enableTransition: false,
  pointerEvents: "none",
  pixelDensity: 1,
  fovEnabled: false, // Default to disabled
  fov: 100,
};

const gradientTypes: GradientType[] = ["waterPlane", "plane", "sphere"];
const _shaderTypes: string[] = ["defaults", "positionMix"];
const envPresets: EnvPreset[] = ["city", "dawn", "lobby"];
const lightTypes: LightType[] = ["3d", "env"];
const pointerEventsOptions: PointerEventsOption[] = ["none", "auto"];

// All controls organized by sections
const allControls: ControlSections = {
  basic: {
    title: "Basic Settings",
    controls: {
      type: {
        type: "buttonGroup", // Changed from "select" to "buttonGroup"
        options: gradientTypes,
      },
      // shader: {
      //   type: "buttonGroup", // Changed from "select" to "buttonGroup"
      //   options: shaderTypes,
      // },
      animate: {
        type: "toggle",
        options: ["on", "off"],
      },
      color1: {
        type: "color",
      },
      color2: {
        type: "color",
      },
      color3: {
        type: "color",
      },
      // Canvas properties
      lazyLoad: {
        type: "toggle",
      },
      fovEnabled: {
        type: "toggle",
      },
      fov: {
        type: "slider",
        min: 10,
        max: 300,
        step: 1,
      },
      pixelDensity: {
        type: "slider",
        min: 1,
        max: 9,
        step: 1,
      },
      pointerEvents: {
        type: "buttonGroup",
        options: pointerEventsOptions,
      },
    },
  },
  effects: {
    title: "Effects & Animation",
    controls: {
      grain: {
        type: "toggle",
        options: ["on", "off"],
      },
      uTime: {
        type: "slider",
        min: 0,
        max: 20,
        step: 0.1,
      },
      uSpeed: {
        type: "slider",
        min: 0,
        max: 2,
        step: 0.01,
      },
      uStrength: {
        type: "slider",
        min: 0,
        max: 5,
        step: 0.1,
      },
      uDensity: {
        type: "slider",
        min: 0,
        max: 5,
        step: 0.1,
      },
      uFrequency: {
        type: "slider",
        min: 0,
        max: 5,
        step: 0.1,
      },
      uAmplitude: {
        type: "slider",
        min: 0,
        max: 5,
        step: 0.1,
      },
      reflection: {
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
      },
      brightness: {
        type: "slider",
        min: 0,
        max: 2,
        step: 0.1,
      },
      lightType: {
        type: "buttonGroup", // Changed from "select" to "buttonGroup"
        options: lightTypes,
      },
      envPreset: {
        type: "buttonGroup", // Changed from "select" to "buttonGroup"
        options: envPresets,
      },
    },
  },
  position: {
    title: "Position & Rotation",
    controls: {
      positionX: {
        type: "slider",
        min: -10,
        max: 10,
        step: 0.1,
      },
      positionY: {
        type: "slider",
        min: -10,
        max: 10,
        step: 0.1,
      },
      positionZ: {
        type: "slider",
        min: -10,
        max: 10,
        step: 0.1,
      },
      rotationX: {
        type: "slider",
        min: -180,
        max: 180,
        step: 1,
      },
      rotationY: {
        type: "slider",
        min: -180,
        max: 180,
        step: 1,
      },
      rotationZ: {
        type: "slider",
        min: -180,
        max: 180,
        step: 1,
      },
    },
  },
  camera: {
    title: "Camera Settings",
    controls: {
      cAzimuthAngle: {
        type: "slider",
        min: 0,
        max: 360,
        step: 1,
      },
      cPolarAngle: {
        type: "slider",
        min: 0,
        max: 180,
        step: 1,
      },
      cDistance: {
        type: "slider",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      // cameraZoom: {
      //   type: "slider",
      //   min: 0.1,
      //   max: 20,
      //   step: 0.1,
      // },
    },
  },
};

export function ShaderGradientGenerator(): JSX.Element {
  const isMobile = useMediaQuery("(max-width:1024px)");
  const [viewAll, setViewAll] = useState(false);

  const [settings, setSettings] =
    useState<ShaderGradientSettings>(defaultSettings);
  const [selectedExample, setSelectedExample] = useState<string>("");
  const updateSettings = (
    newSettings: Partial<ShaderGradientSettings>,
  ): void => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <>
      <article className="space-y-3 pb-8 pt-8">
        <h1 className="text-center font-medium text-2xl sm:text-3xl md:text-5xl">
          Creative Mesh-Gradient <br /> For Developers
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
          "xl:overflow-none relative mx-auto grid w-[80%] max-w-screen-lg grid-cols-3 gap-2 overflow-hidden pb-10 sm:gap-4 lg:grid-cols-4 lg:gap-8 lg:pb-10 xl:max-w-screen-xl xl:grid-cols-5 2xl:gap-10",
          viewAll ? "h-full" : "lg:h-[28rem]",
        )}
      >
        {!viewAll && (
          <div className="absolute bottom-0 left-0 z-10 grid h-60 w-full place-content-center bg-gradient-to-t from-42% from-white dark:from-black" />
        )}

        {(viewAll ? ExampleGradients : ExampleGradients.slice(0, 10)).map(
          (mesh) => (
            <div
              key={mesh.id}
              className="relative grid aspect-square w-full cursor-pointer place-items-center rounded-lg border bg-card-bg p-2 shadow-[0px_1px_0px_0px_rgba(17,17,26,0.1)] lg:p-5 2xl:h-48 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-neutral-950"
              onClick={() => {
                setSelectedExample(mesh.id);
                setSettings(mesh?.settings);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSelectedExample(mesh.id);
                  setSettings(mesh?.settings);
                }
              }}
            >
              <div
                className="relative h-full w-full overflow-hidden rounded-md"
                style={{
                  background: `linear-gradient(135deg, ${mesh.settings.color1}, ${mesh.settings.color2}, ${mesh.settings.color3})`,
                }}
              >
                {mesh?.settings?.grain === "on" && (
                  <div className=" absolute top-0 left-0 h-full w-full bg-[url('/noise.gif')] opacity-10" />
                )}
              </div>
            </div>
          ),
        )}
      </div>
      {isMobile && (
        <p className="pb-2 text-center text-primary/60">
          Please use a desktop/laptop to view the Editor.
        </p>
      )}

      <div
        className="relative mx-auto w-full gap-3 px-3 pb-5 lg:container lg:grid lg:grid-cols-12 lg:px-0 xl:grid-cols-4"
        id="editor"
      >
        {/* Left Column: Control Panel */}
        {!isMobile && (
          <div
            className={
              "relative inset-shadow-[0_1px_rgb(0_0_0/0.10)] h-[95vh] rounded-xl border bg-card-bg lg:z-0 lg:col-span-4 lg:block lg:max-h-[95vh] lg:w-full xl:col-span-1 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0 "
            }
          >
            <ScrollArea className=" h-full rounded-xl p-3">
              <ControlPanel
                settings={settings}
                updateSettings={updateSettings}
                sections={allControls}
                sectionClassNames={{
                  basic: "bg-main border 2xl:p-4 p-2 rounded-lg",
                  effects: "bg-main border 2xl:p-4 p-2 rounded-lg",
                  position: "bg-main border 2xl:p-4 p-2 rounded-lg",
                  camera: "bg-main border 2xl:p-4 p-2 rounded-lg",
                }}
              />
            </ScrollArea>
          </div>
        )}

        {/* Middle Column: Gradient Preview */}
        <div className="relative flex h-full flex-col gap-2 lg:col-span-8 lg:h-[95vh] xl:col-span-3 ">
          <div className="relative inset-shadow-[0_1px_rgb(0_0_0/0.10)] h-96 flex-grow rounded-xl border border-t-0 bg-card-bg p-2 lg:h-auto dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
            <CopyCode settings={settings} />
            <Suspense>
              <ShaderGradientCanvas
                key={settings.fovEnabled ? settings.fov : "defaultFOV"}
                className="rounded-lg"
                style={{
                  width: "100%",
                  height: "100%",
                }}
                lazyLoad={settings.lazyLoad}
                {...(settings.fovEnabled ? { fov: settings.fov } : {})}
                pixelDensity={settings.pixelDensity}
                pointerEvents={settings.pointerEvents}
              >
                <ShaderGradient
                  animate={settings.animate}
                  type={settings.type}
                  wireframe={settings.wireframe}
                  shader={settings.shader}
                  uTime={settings.uTime}
                  uSpeed={settings.uSpeed}
                  uStrength={settings.uStrength}
                  uDensity={settings.uDensity}
                  uFrequency={settings.uFrequency}
                  uAmplitude={settings.uAmplitude}
                  positionX={settings.positionX}
                  positionY={settings.positionY}
                  positionZ={settings.positionZ}
                  rotationX={settings.rotationX}
                  rotationY={settings.rotationY}
                  rotationZ={settings.rotationZ}
                  color1={settings.color1}
                  color2={settings.color2}
                  color3={settings.color3}
                  reflection={settings.reflection}
                  cAzimuthAngle={settings.cAzimuthAngle}
                  cPolarAngle={settings.cPolarAngle}
                  cDistance={settings.cDistance}
                  cameraZoom={settings.cameraZoom}
                  lightType={settings.lightType}
                  brightness={settings.brightness}
                  envPreset={settings.envPreset}
                  grain={settings.grain}
                  toggleAxis={settings.toggleAxis}
                  zoomOut={settings.zoomOut}
                  hoverState={settings.hoverState}
                  enableTransition={settings.enableTransition}
                />
              </ShaderGradientCanvas>
            </Suspense>
          </div>
          <ScrollArea className="inset-shadow-[0_1px_rgb(0_0_0/0.10)] h-36 w-full gap-2 rounded-xl border border-t-0 bg-card-bg p-2 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0 ">
            <div className="flex h-full w-full whitespace-nowrap">
              {ExampleGradients.map((example, _index) => (
                <Button
                  key={example?.id}
                  variant="empty"
                  onClick={() => {
                    setSelectedExample(example.id);
                    setSettings(example?.settings);
                  }}
                  className={cn(
                    "relative h-full w-32 shrink-0 cursor-pointer overflow-hidden rounded-md p-2",
                    selectedExample === example.id
                      ? "border bg-main"
                      : "layeroutline",
                  )}
                >
                  <div
                    className="relative h-full w-full overflow-hidden rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${example.settings.color1}, ${example.settings.color2}, ${example.settings.color3})`,
                    }}
                  >
                    {example?.settings?.grain === "on" && (
                      <div className=" absolute top-0 left-0 h-full w-full bg-[url('/noise.gif')] opacity-10" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
