"use client";

import { cn } from "@/lib/utils";
import {
	Bookmark,
	Check,
	Copy,
	MousePointer2,
	Pencil,
	RefreshCw,
	Save,
	Settings,
	Undo2,
	X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AnimateSvg } from "./animate-svg";
import { examplesSvgPath } from "./data";

type SettingsState = {
	viewBox: string;
	strokeColor: string;
	strokeWidth: number;
	strokeLinecap: "butt" | "round" | "square";
	animationDuration: number;
	animationDelay: number;
	animationBounce: number;
	reverseAnimation: boolean;
	enableHoverAnimation: boolean;
};

const toolButton =
	"grid size-11 place-items-center rounded border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

function RangeField({
	label,
	value,
	min,
	max,
	step,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (value: number) => void;
}) {
	return (
		<label className="block space-y-2 font-semibold text-xs">
			<span>
				{label}: {value}
				{label.includes("Duration") || label.includes("Delay") ? "s" : ""}
			</span>
			<input
				className="h-2 w-full cursor-pointer accent-zinc-900"
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
		</label>
	);
}

function Toggle({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="flex cursor-pointer items-center gap-2 font-medium text-xs">
			<input
				type="checkbox"
				className="peer sr-only"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<span className="relative h-5 w-9 rounded-full bg-zinc-200 transition after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-zinc-900 peer-checked:after:translate-x-4 dark:bg-zinc-700 dark:peer-checked:bg-white dark:peer-checked:after:bg-zinc-900" />
			{label}
		</label>
	);
}

export default function SVGLineDrawGenerator() {
	const { resolvedTheme } = useTheme();
	const infinity =
		examplesSvgPath.find((example) => example.name === "Infinity") ??
		examplesSvgPath[0];
	const [selected, setSelected] = useState(infinity);
	const [mode, setMode] = useState<"preview" | "draw" | "edit">("preview");
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const [animationKey, setAnimationKey] = useState(0);
	const [settings, setSettings] = useState<SettingsState>({
		viewBox: infinity.viewBox,
		strokeColor: "#000000",
		strokeWidth: 2,
		strokeLinecap: "round",
		animationDuration: 1.5,
		animationDelay: 0,
		animationBounce: 0.3,
		reverseAnimation: false,
		enableHoverAnimation: false,
	});

	useEffect(() => {
		setSettings((current) => ({
			...current,
			strokeColor: resolvedTheme === "dark" ? "#ffffff" : "#000000",
		}));
	}, [resolvedTheme]);

	const update = <K extends keyof SettingsState>(
		key: K,
		value: SettingsState[K],
	) => setSettings((current) => ({ ...current, [key]: value }));

	const choosePreset = (example: (typeof examplesSvgPath)[number]) => {
		setSelected(example);
		update("viewBox", example.viewBox);
		setMode("preview");
		setAnimationKey((key) => key + 1);
	};

	const copyPath = async () => {
		await navigator.clipboard.writeText(selected.path);
		setCopied(true);
		toast.success("SVG path copied");
		window.setTimeout(() => setCopied(false), 1400);
	};

	return (
		<section className="mx-auto w-full max-w-[1800px] overflow-hidden px-3 pb-6 sm:px-5">
			<div className="relative h-[min(68vh,760px)] min-h-[500px] overflow-hidden rounded-xl border border-zinc-200 bg-[#f7f8f9] dark:border-zinc-800 dark:bg-zinc-950">
				<div className="absolute inset-0 bg-[radial-gradient(circle,#cdd1d5_1px,transparent_1.2px)] bg-[size:16px_16px] dark:bg-[radial-gradient(circle,#3f3f46_1px,transparent_1.2px)]" />

				{settingsOpen && (
					<aside className="absolute inset-y-2 left-2 z-30 w-[270px] rounded-lg border border-zinc-200 bg-[#f1f2f4]/95 p-2 shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
						<div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
							<label className="block space-y-1.5 font-semibold text-xs">
								<span>ViewBox</span>
								<input
									className="h-9 w-full rounded border px-2 font-normal dark:bg-zinc-900"
									value={settings.viewBox}
									onChange={(event) => update("viewBox", event.target.value)}
								/>
							</label>
							<div className="mt-4 font-semibold text-xs">Stroke Color</div>
							<div className="mt-1.5 flex gap-2">
								<input
									aria-label="Stroke color"
									type="color"
									value={settings.strokeColor}
									onChange={(event) =>
										update("strokeColor", event.target.value)
									}
									className="h-9 w-9 cursor-pointer rounded border p-0.5"
								/>
								<input
									className="h-9 min-w-0 flex-1 rounded border px-2 text-xs dark:bg-zinc-900"
									value={settings.strokeColor}
									onChange={(event) =>
										update("strokeColor", event.target.value)
									}
								/>
							</div>
							<div className="mt-4 space-y-4">
								<RangeField
									label="Stroke Width"
									value={settings.strokeWidth}
									min={1}
									max={10}
									step={0.5}
									onChange={(value) => update("strokeWidth", value)}
								/>
								<label className="block space-y-1.5 font-semibold text-xs">
									<span>Stroke Linecap</span>
									<select
										className="h-9 w-full rounded border bg-white px-2 font-normal dark:bg-zinc-900"
										value={settings.strokeLinecap}
										onChange={(event) =>
											update(
												"strokeLinecap",
												event.target.value as SettingsState["strokeLinecap"],
											)
										}
									>
										<option value="round">Round</option>
										<option value="butt">Butt</option>
										<option value="square">Square</option>
									</select>
								</label>
								<RangeField
									label="Animation Duration"
									value={settings.animationDuration}
									min={0.5}
									max={5}
									step={0.1}
									onChange={(value) => update("animationDuration", value)}
								/>
								<RangeField
									label="Animation Delay"
									value={settings.animationDelay}
									min={0}
									max={2}
									step={0.1}
									onChange={(value) => update("animationDelay", value)}
								/>
								<RangeField
									label="Animation Bounce"
									value={settings.animationBounce}
									min={0}
									max={1}
									step={0.05}
									onChange={(value) => update("animationBounce", value)}
								/>
								<Toggle
									label="Reverse Animation"
									checked={settings.reverseAnimation}
									onChange={(value) => update("reverseAnimation", value)}
								/>
								<Toggle
									label="Enable Hover Animation"
									checked={settings.enableHoverAnimation}
									onChange={(value) => update("enableHoverAnimation", value)}
								/>
							</div>
						</div>
					</aside>
				)}

				<div
					className={cn(
						"relative z-10 h-full",
						mode === "edit" &&
							"grid grid-cols-2 divide-x divide-zinc-300 dark:divide-zinc-700",
					)}
				>
					<div className="flex h-full items-center justify-center p-8 sm:p-14">
						<AnimateSvg
							key={animationKey}
							width="100%"
							height="100%"
							viewBox={settings.viewBox}
							className="h-full max-h-[75%] w-full"
							path={selected.path}
							strokeColor={settings.strokeColor}
							strokeWidth={settings.strokeWidth}
							strokeLinecap={settings.strokeLinecap}
							animationDuration={settings.animationDuration}
							animationDelay={settings.animationDelay}
							animationBounce={settings.animationBounce}
							reverseAnimation={settings.reverseAnimation}
							enableHoverAnimation={settings.enableHoverAnimation}
						/>
					</div>
					{mode === "edit" && (
						<div className="relative flex h-full items-center justify-center p-8 sm:p-14">
							<div className="absolute top-3 left-3 font-medium text-xs">
								Path length: {selected.path.length} characters
							</div>
							<svg
								viewBox={settings.viewBox}
								className="h-full max-h-[75%] w-full overflow-visible"
							>
								<title>Editable path control points</title>
								<path
									d={selected.path}
									fill="none"
									stroke={settings.strokeColor}
									strokeWidth={settings.strokeWidth}
									strokeLinecap={settings.strokeLinecap}
								/>
								<line
									x1="20"
									y1="50"
									x2="70"
									y2="16"
									stroke="#999"
									strokeWidth=".7"
									strokeDasharray="2 2"
								/>
								<circle cx="20" cy="50" r="5" fill="#2094f3" />
								<circle cx="70" cy="16" r="4" fill="#ff4b4b" />
								<circle cx="120" cy="50" r="5" fill="#2094f3" />
							</svg>
						</div>
					)}
				</div>

				<div className="-translate-x-1/2 absolute bottom-3 left-1/2 z-40 flex gap-2 rounded-lg border border-zinc-200 bg-[#f1f2f4]/95 p-2 shadow-md dark:border-zinc-700 dark:bg-zinc-900/95">
					<button
						type="button"
						aria-label={mode === "preview" ? "Select" : "Close tool"}
						title="Select"
						className={cn(
							toolButton,
							mode !== "preview" &&
								"bg-red-500 text-white hover:bg-red-500 hover:text-white",
						)}
						onClick={() => setMode("preview")}
					>
						{mode === "preview" ? <MousePointer2 size={19} /> : <X size={19} />}
					</button>
					<button
						type="button"
						aria-label="Draw line"
						title="Draw line"
						className={cn(
							toolButton,
							mode === "draw" &&
								"bg-zinc-950 text-white dark:bg-white dark:text-black",
						)}
						onClick={() => setMode(mode === "draw" ? "preview" : "draw")}
					>
						<Pencil size={19} />
					</button>
					<button
						type="button"
						aria-label="Copy path"
						title="Copy path"
						className={toolButton}
						onClick={copyPath}
					>
						{copied ? <Check size={19} /> : <Copy size={19} />}
					</button>
					<button
						type="button"
						aria-label="Animation settings"
						title="Animation settings"
						className={cn(
							toolButton,
							settingsOpen &&
								"bg-zinc-950 text-white dark:bg-white dark:text-black",
						)}
						onClick={() => setSettingsOpen((open) => !open)}
					>
						<Settings size={19} />
					</button>
					<button
						type="button"
						aria-label="Save path"
						title="Save path"
						className={toolButton}
						onClick={() => toast.success("Path saved")}
					>
						<Save size={19} />
					</button>
					<button
						type="button"
						aria-label="Edit path"
						title="Edit path"
						className={cn(
							toolButton,
							mode === "edit" &&
								"bg-zinc-950 text-white dark:bg-white dark:text-black",
						)}
						onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
					>
						<Bookmark size={19} />
					</button>
					{mode === "edit" && (
						<>
							<button type="button" aria-label="Undo" className={toolButton}>
								<Undo2 size={19} />
							</button>
							<button
								type="button"
								aria-label="Reload"
								className={toolButton}
								onClick={() => setAnimationKey((key) => key + 1)}
							>
								<RefreshCw size={19} />
							</button>
						</>
					)}
				</div>
			</div>

			<div className="mt-2 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
				{examplesSvgPath.slice(0, 16).map((example, index) => (
					<button
						key={`${example.id}-${index}`}
						type="button"
						onClick={() => choosePreset(example)}
						className={cn(
							"group relative h-[110px] w-[132px] shrink-0 snap-start overflow-hidden rounded-lg border border-zinc-200 bg-[#f3f4f6] px-4 pt-3 pb-6 text-zinc-950 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white",
							selected.id === example.id &&
								"border-white ring-4 ring-zinc-100 dark:border-zinc-600 dark:ring-zinc-800",
						)}
					>
						<AnimateSvg
							key={animationKey}
							width="100%"
							height="100%"
							viewBox={example.viewBox}
							className="h-full w-full"
							path={example.path}
							strokeColor={resolvedTheme === "dark" ? "#ffffff" : "#111111"}
							strokeWidth={3}
							strokeLinecap="round"
							animationDuration={1.2}
							animationDelay={0}
							animationBounce={0.2}
							reverseAnimation={false}
						/>
						<span className="absolute inset-x-0 bottom-2 text-center font-bold text-[10px]">
							{example.name}
						</span>
					</button>
				))}
			</div>
		</section>
	);
}
