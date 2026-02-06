"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useSvgStore } from "@/store/use-custom-paths";
import { Plus, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";
interface CustomLineInputProps {
	activePresets: string | null;
	setActivePresets: (presets: string) => void;
}
export function CustomLineInput({
	activePresets,
	setActivePresets,
}: CustomLineInputProps) {
	const { theme } = useTheme();

	const [pathData, setPathData] = useState("");
	const [strokeColor, setStrokeColor] = useState("#000000");
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [strokeLinecap, setStrokeLinecap] = useState<
		"butt" | "round" | "square"
	>("round");
	const [colorPickerOpen, setColorPickerOpen] = useState(false);

	const { customLines, addCustomLine, removeCustomLine, clearCustomLines } =
		useSvgStore();

	const handleAddLine = () => {
		if (!pathData.trim()) {
			toast.error("Empty path data", {
				description: "Please enter SVG path data",
			});
			return;
		}

		// Basic validation to check if it looks like path data
		if (!pathData.trim().startsWith("M")) {
			toast.error("Invalid path data", {
				description: "Path data should start with 'M'",
			});
			return;
		}

		addCustomLine(pathData, strokeColor, strokeWidth, strokeLinecap);
		toast("Custom line added", {
			description: "Your custom line has been added to the collection",
		});
		setPathData("");
	};

	const handleRemoveLine = (id: string) => {
		removeCustomLine(id);
		toast("Custom line removed", {
			description: "The custom line has been removed",
		});
	};

	const handleClearLines = () => {
		if (customLines.length === 0) return;

		clearCustomLines();
		toast("Custom lines cleared", {
			description: "All custom lines have been removed",
		});
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardDescription>
					Add custom SVG path data to create animations
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="path-data">SVG Path Data (d attribute)</Label>
					<Textarea
						id="path-data"
						placeholder="M 10 10 L 90 90..."
						value={pathData}
						onChange={(e) => setPathData(e.target.value)}
						className="h-24 font-mono text-xs"
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="strokeColor">Stroke Color</Label>
						<div className="flex items-center gap-2">
							<Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="h-10 w-10 border-2 p-0"
										style={{ backgroundColor: strokeColor }}
									>
										<span className="sr-only">Pick a color</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-3">
									<HexColorPicker
										color={strokeColor}
										onChange={setStrokeColor}
									/>
									<div className="mt-2 flex">
										<Input
											value={strokeColor}
											onChange={(e) => setStrokeColor(e.target.value)}
											className="flex-1"
										/>
									</div>
								</PopoverContent>
							</Popover>
							<Input
								value={strokeColor}
								onChange={(e) => setStrokeColor(e.target.value)}
								className="flex-1"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="strokeLinecap">Stroke Linecap</Label>
						<Select
							value={strokeLinecap}
							onValueChange={(value) =>
								setStrokeLinecap(value as "butt" | "round" | "square")
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
				</div>
				<div className="space-y-2">
					<Label htmlFor="strokeWidth">Stroke Width: {strokeWidth}</Label>
					<Slider
						id="strokeWidth"
						min={1}
						max={10}
						step={0.5}
						value={[strokeWidth]}
						onValueChange={(value) => setStrokeWidth(value[0])}
					/>
				</div>
				<Button onClick={handleAddLine} className="w-full">
					<Plus className="mr-2 h-4 w-4" /> Add Custom Line
				</Button>

				{customLines.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-medium text-sm">
								Saved Custom Lines ({customLines.length})
							</h3>
							<Button variant="outline" size="sm" onClick={handleClearLines}>
								Clear All
							</Button>
						</div>

						<div className="max-h-60 space-y-2 overflow-y-auto pr-2">
							{customLines.map((line, index) => (
								<div
									key={line.id}
									className="flex items-start gap-2 rounded-md border bg-gray-50 p-2"
								>
									<div className="flex-1">
										<div className="mb-1 flex items-center gap-2">
											<div
												className="h-3 w-3 rounded-full"
												style={{ backgroundColor: line.strokeColor }}
											/>
											<span className="font-medium text-sm">
												Line {index + 1}
											</span>
											<span className="text-gray-500 text-xs">
												{line.strokeWidth}px, {line.strokeLinecap}
											</span>
										</div>
										<div className="max-w-full truncate font-mono text-xs">
											{line.path.length > 50
												? `${line.path.substring(0, 50)}...`
												: line.path}
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveLine(line.id)}
										className="h-6 w-6"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
