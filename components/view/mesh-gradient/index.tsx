"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Bookmark, PanelsTopLeft, Settings2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type JSX, Suspense, useState } from "react";
import { ControlPanel } from "./control-panel";
import { CopyCode } from "./copy-code";
import { ExampleGradients } from "./example-gradients";

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
	const [settings, setSettings] =
		useState<ShaderGradientSettings>(defaultSettings);
	const [selectedExample, setSelectedExample] = useState<string>("");
	const [activeSidebarTab, setActiveSidebarTab] = useState<"presets" | "settings" | "saved">("settings");
	const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
	const pathname = usePathname();
	const router = useRouter();
	const updateSettings = (
		newSettings: Partial<ShaderGradientSettings>,
	): void => {
		setSettings((prev) => ({ ...prev, ...newSettings }));
	};

	return (
		<>
			{isMobile && (
				<p className="pb-2 text-center text-primary/60">
					Please use a desktop/laptop to view the Editor.
				</p>
			)}

				<div className="h-full w-full overflow-hidden p-3" id="editor">
					<div className={cn("relative grid h-full min-h-0 gap-3", isMobile ? "grid-cols-1" : isSidebarExpanded ? "lg:grid-cols-[70px_320px_minmax(0,1fr)]" : "lg:grid-cols-[70px_0px_minmax(0,1fr)]")}>
						{!isMobile && <div className="inset-shadow-[0_1px_rgb(0_0_0/0.10)] hidden h-full min-h-0 rounded-lg border bg-card-bg p-2 lg:flex lg:flex-col lg:justify-between dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
							<div className="space-y-2">
								{[{ key: "presets", label: "Presets", icon: PanelsTopLeft }, { key: "settings", label: "Settings", icon: Settings2 }, { key: "saved", label: "Saved", icon: Bookmark }].map((item) => (
									<button type="button" key={item.key} onClick={() => { setIsSidebarExpanded(true); setActiveSidebarTab(item.key as "presets" | "settings" | "saved"); }} className={cn("grid h-16 w-full place-items-center rounded-md border px-1 py-1 font-semibold text-[11px]", activeSidebarTab === item.key ? "border-primary bg-primary text-primary-foreground" : "bg-main")}>
										<item.icon className="h-4 w-4" />
										<span>{item.label}</span>
									</button>
								))}
							</div>
							<Select value={pathname} onValueChange={(value) => router.push(value)}>
								<SelectTrigger className="h-9 px-2 text-[10px]"><SelectValue placeholder="Go to editor..." /></SelectTrigger>
								<SelectContent><SelectItem value="/mesh-gradients">Mesh</SelectItem><SelectItem value="/background-snippets">BG</SelectItem><SelectItem value="/color-lab">Color</SelectItem></SelectContent>
							</Select>
						</div>}
						{!isMobile && <div className={cn("inset-shadow-[0_1px_rgb(0_0_0/0.10)] hidden h-full min-h-0 rounded-lg border bg-card-bg p-3 lg:block dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0", !isSidebarExpanded && "pointer-events-none w-0 overflow-hidden border-0 p-0 opacity-0")}>
							<ScrollArea className="h-full">
								{activeSidebarTab === "settings" && <ControlPanel
									settings={settings}
									updateSettings={updateSettings}
									sections={allControls}
								sectionClassNames={{
									basic: "bg-main border 2xl:p-4 p-2 rounded-lg",
									effects: "bg-main border 2xl:p-4 p-2 rounded-lg",
									position: "bg-main border 2xl:p-4 p-2 rounded-lg",
									camera: "bg-main border 2xl:p-4 p-2 rounded-lg",
								}}
								/>}
								{activeSidebarTab === "presets" && (
									<div className="grid grid-cols-2 gap-2">
										{ExampleGradients.map((example) => (
											<Button
												key={example.id}
												variant="empty"
												onClick={() => {
													setSelectedExample(example.id);
													setSettings(example.settings);
												}}
												className={cn(
													"relative h-20 w-full overflow-hidden rounded-md border p-1",
													selectedExample === example.id && "bg-main",
												)}
											>
												<div
													className="h-full w-full rounded-md"
													style={{
														background: `linear-gradient(135deg, ${example.settings.color1}, ${example.settings.color2}, ${example.settings.color3})`,
													}}
												/>
											</Button>
										))}
									</div>
								)}
								{activeSidebarTab === "saved" && <p className="text-sm text-primary/60">Saved gradients will appear here.</p>}
							</ScrollArea>
						</div>}

				{/* Middle Column: Gradient Preview */}
					<div className="relative col-span-12 h-full min-h-0 lg:col-auto">
					<div className="relative flex h-full flex-col gap-2 lg:h-[95vh]">
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
					</div></div>
				</div>
				</div>
			</>
	);
}
