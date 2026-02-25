"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CopyToClipboard from "@/components/ui/copy-to-clipboard";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ShadowPreset } from "@/types/shadow";
import { Check, Copy, Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface ShadowPreviewProps {
	shadowMode: "box" | "text";
	cssValue: string;
	tailwindClass: string;
	textShadowValue: string;
	setTextShadowValue: React.Dispatch<React.SetStateAction<string>>;
	isRemoveShadow: boolean;
	setIsRemoveShadow: React.Dispatch<React.SetStateAction<boolean>>;
	isEdited: boolean;
	shadowName: string;
	setShadowName: React.Dispatch<React.SetStateAction<string>>;
	saveCurrentShadow: () => void;
	activeShadow: ShadowPreset | null;
	previewBackground: string;
	setPreviewBackground: React.Dispatch<React.SetStateAction<string>>;
}

export default function ShadowPreview({
	shadowMode,
	cssValue,
	tailwindClass,
	textShadowValue,
	setTextShadowValue,
	isRemoveShadow,
	setIsRemoveShadow,
	isEdited,
	shadowName,
	setShadowName,
	saveCurrentShadow,
	activeShadow,
	previewBackground,
	setPreviewBackground,
}: ShadowPreviewProps) {
	const [copiedTailwind, setCopiedTailwind] = useState(false);
	const [copiedCss, setCopiedCss] = useState(false);

	const twValue =
		shadowMode === "text"
			? `[text-shadow:${textShadowValue.replaceAll(" ", "_")}]`
			: tailwindClass;
	const cssProperty = shadowMode === "text" ? "text-shadow" : "box-shadow";
	const cssOutputValue = shadowMode === "text" ? textShadowValue : cssValue;

	const copyToClipboard = (text: string, isTailwind = true) => {
		navigator.clipboard.writeText(text);

		if (isTailwind) {
			setCopiedTailwind(true);
			setTimeout(() => setCopiedTailwind(false), 2000);
		} else {
			setCopiedCss(true);
			setTimeout(() => setCopiedCss(false), 2000);
		}

		toast.success(
			`The ${isTailwind ? "Tailwind CSS class" : "CSS value"} has been copied to your clipboard.`,
		);
	};

	return (
		<ScrollArea className="h-full w-full">
			<Tabs
				defaultValue="preview"
				className="relative flex h-full w-full flex-col"
			>
				<TabsList className="absolute top-1.5 right-1.5 z-10 bg-neutral-950 dark:bg-black">
					<TabsTrigger
						value="preview"
						className="text-white dark:text-gray-300 dark:data-[state=active]:bg-neutral-700"
					>
						Preview
					</TabsTrigger>
					<TabsTrigger
						value="code"
						className="text-white dark:text-gray-300 dark:data-[state=active]:bg-neutral-700"
					>
						Code
					</TabsTrigger>
				</TabsList>

				<TabsContent
					value="preview"
					className="relative mt-0 flex h-full min-h-0 flex-col gap-4"
				>
					<div className="absolute top-2 left-2 flex items-center gap-1">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										className={cn(
											"shrink-0 text-primary",
											isRemoveShadow
												? "bg-black text-white dark:bg-white dark:text-black"
												: "bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-900",
										)}
										onClick={() => {
											setIsRemoveShadow(!isRemoveShadow);
										}}
										disabled={shadowMode === "text"}
									>
										<svg
											width="134"
											height="157"
											viewBox="0 0 134 157"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
											focusable="false"
										>
											<path
												d="M111.25 11.15H83.4375V22.3H111.25C117.369 22.3 122.375 27.3175 122.375 33.45V122.65C122.375 128.783 117.369 133.8 111.25 133.8H83.4375V144.95H111.25C123.488 144.95 133.5 134.915 133.5 122.65V33.45C133.5 21.185 123.488 11.15 111.25 11.15Z"
												fill="currentColor"
											/>
											<path
												d="M61.1875 11.15H22.25C10.0125 11.15 0 21.185 0 33.45V122.65C0 134.915 10.0125 144.95 22.25 144.95H61.1875V156.1H72.3125V0H61.1875V11.15Z"
												fill="currentColor"
											/>
										</svg>
									</Button>
								</TooltipTrigger>
								<TooltipContent className="max-w-sm">
									{shadowMode === "text"
										? "Not used for text shadows"
										: "Check Without Shadow"}
								</TooltipContent>
							</Tooltip>
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										disabled={!isEdited || shadowMode === "text"}
										className={cn(
											!isEdited || shadowMode === "text"
												? "cursor-not-allowed opacity-50"
												: "",
										)}
									>
										<Save />
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[425px]">
									<DialogHeader>
										<DialogTitle>Shadow Name</DialogTitle>
									</DialogHeader>
									<div className="rounded-md border bg-main p-3">
										<div className="mb-2 flex items-center justify-between">
											<Label className="font-medium text-sm">Shadow Name</Label>
										</div>
										<div className="flex gap-2">
											<Input
												value={shadowName}
												onChange={(e) => setShadowName(e.target.value)}
												placeholder="Enter shadow name"
												className="flex-1 bg-card-bg"
											/>
											<Button
												onClick={saveCurrentShadow}
												disabled={!isEdited}
												className={
													!isEdited ? "cursor-not-allowed opacity-50" : ""
												}
											>
												<Save className="mr-2 h-4 w-4" />
												Save
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</TooltipProvider>
					</div>

					<div className="absolute top-2 right-40 z-10 flex items-center gap-2 rounded-md border bg-card-bg p-1.5">
						{["#ECF0F3", "#111827", "#fef3c7", "#dbeafe"].map((bg) => (
							<button
								type="button"
								key={bg}
								onClick={() => setPreviewBackground(bg)}
								className={cn(
									"h-5 w-5 rounded-full border",
									previewBackground === bg && "ring-2 ring-primary",
								)}
								style={{ backgroundColor: bg }}
							/>
						))}
						<Input
							value={previewBackground}
							onChange={(e) => setPreviewBackground(e.target.value)}
							className="h-7 w-24"
						/>
					</div>

					<Card
						className="flex min-h-[360px] flex-1 items-center justify-center p-6 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]"
						style={{ backgroundColor: previewBackground }}
					>
						{shadowMode === "text" ? (
							<div className="rounded-lg border bg-card px-8 py-6">
								<p
									className="font-bold text-5xl"
									style={{ textShadow: textShadowValue }}
								>
									Text Shadow
								</p>
							</div>
						) : (
							<div
								className={`h-40 w-40 rounded-lg bg-neutral-100 dark:bg-neutral-950 ${
									isRemoveShadow ? "border dark:border-none" : ""
								}`}
								style={{ boxShadow: isRemoveShadow ? undefined : cssValue }}
							/>
						)}
					</Card>
					{shadowMode === "text" && (
						<Card className="shrink-0 bg-card-bg p-4 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
							<Label className="mb-2 block">Text Shadow Value</Label>
							<Input
								value={textShadowValue}
								onChange={(e) => setTextShadowValue(e.target.value)}
								placeholder="0px 2px 10px rgba(0,0,0,0.25)"
							/>
						</Card>
					)}
					<Card className="shrink-0 bg-card-bg p-6 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
						<h3 className="mb-2 font-medium text-lg">Tailwind CSS v4 Class</h3>
						<div className="mb-4 flex items-center gap-2">
							<code className="flex-1 overflow-auto rounded-md border bg-main p-2 text-gray-700 text-sm dark:text-gray-300">
								{twValue}
							</code>
							<Button
								size="icon"
								variant="outline"
								className="border-0"
								onClick={() => copyToClipboard(twValue)}
							>
								{copiedTailwind ? (
									<Check className="h-4 w-4" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>

						<h3 className="mb-2 font-medium text-lg">CSS Value</h3>
						<div className="flex items-center gap-2">
							<code className="flex flex-1 overflow-x-auto rounded-md border bg-main p-2 text-gray-700 text-sm dark:text-gray-300">
								{cssProperty}: {cssOutputValue}
							</code>
							<Button
								size="icon"
								variant="outline"
								className="border-0"
								onClick={() =>
									copyToClipboard(`${cssProperty}: ${cssOutputValue};`, false)
								}
							>
								{copiedCss ? (
									<Check className="h-4 w-4" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
					</Card>
				</TabsContent>
				<TabsContent value="code" className="mt-0 h-full min-h-0">
					<div className="w-full overflow-y-hidden rounded-xl border bg-card-bg p-4 dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] dark:border-0">
						<h3 className="mb-4 font-medium text-lg">
							How to use in your project
						</h3>

						<div className="space-y-4">
							<div>
								<h4 className="mb-2 font-medium">
									Using Tailwind CSS v4 Arbitrary Value
								</h4>
								<div className="relative">
									<CopyToClipboard text={twValue} />
									<code className="block overflow-x-auto rounded-md border bg-main p-3 text-gray-700 text-sm dark:text-gray-300">
										{`<div className="${twValue}">Your content here</div>`}
									</code>
								</div>
							</div>

							<div>
								<h4 className="mb-2 font-medium">Using Inline Style</h4>
								<div className="relative">
									<CopyToClipboard text={cssOutputValue} />
									<code className="relative block overflow-x-auto rounded-md border bg-main p-3 text-gray-700 text-sm dark:text-gray-300">
										{shadowMode === "text"
											? `<h2 style={{ textShadow: \"${textShadowValue}\" }}>Text Shadow</h2>`
											: `<div style={{ boxShadow: \"${cssValue}\" }}>Your content here</div>`}
									</code>
								</div>
							</div>

							<div>
								<h4 className="mt-1 mb-2 font-medium">
									Tailwind CSS v4 @theme Token
								</h4>
								<div className="relative">
									<CopyToClipboard
										text={`@theme {\n  --shadow-${activeShadow?.shadowName || activeShadow?.name || "custom"}: ${cssOutputValue};\n}`}
									/>
									<code className="relative block overflow-x-auto whitespace-pre rounded-md border bg-main p-3 text-gray-700 text-sm dark:text-gray-300">
										{`// global.css\n@theme {\n  --shadow-${activeShadow?.shadowName || activeShadow?.name || "custom"}: ${cssOutputValue};\n}`}
									</code>
								</div>
								<p className="mt-2 text-muted-foreground text-sm dark:text-gray-400">
									Then use it with{" "}
									<code className="rounded bg-main px-1 py-0.5">
										{shadowMode === "text"
											? "[text-shadow:var(--shadow-custom)]"
											: "shadow-custom"}
									</code>
								</p>
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</ScrollArea>
	);
}
