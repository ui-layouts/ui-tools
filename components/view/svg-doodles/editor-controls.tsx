"use client";
import { Button } from "@/components/ui/button";
import { Move, Redo, Save, Undo, X, ZoomIn, ZoomOut } from "lucide-react";

interface EditorControlsProps {
	pathLength: number;
	debugInfo: string;
	historyIndex: number;
	historyLength: number;
	onUndo: () => void;
	onRedo: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onResetView: () => void;
	onClose: () => void;
	/**
	 * Save the current path.
	 */
	onSave: () => void;
}

export function EditorControls({
	pathLength,
	debugInfo,
	historyIndex,
	historyLength,
	onUndo,
	onRedo,
	onZoomIn,
	onZoomOut,
	onResetView,
	onClose,
	onSave,
}: EditorControlsProps) {
	return (
		<div className="flex items-center justify-between border-b p-4">
			<div>
				<h2 className="font-semibold text-xl">Edit SVG Path</h2>
				<p className="text-gray-500 text-xs">
					Path length: {pathLength} characters
				</p>
				{debugInfo && <p className="text-blue-500 text-xs">{debugInfo}</p>}
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={onUndo}
					disabled={historyIndex <= 0}
				>
					<Undo className="mr-1 h-4 w-4" /> Undo
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onRedo}
					disabled={historyIndex >= historyLength - 1}
				>
					<Redo className="mr-1 h-4 w-4" /> Redo
				</Button>
				<Button variant="outline" size="sm" onClick={onZoomIn}>
					<ZoomIn className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onClick={onZoomOut}>
					<ZoomOut className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onClick={onResetView}>
					<Move className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onClick={onClose}>
					<X className="mr-1 h-4 w-4" /> Cancel
				</Button>
				<Button variant="default" size="sm" onClick={onSave}>
					<Save className="mr-1 h-4 w-4" /> Save
				</Button>
			</div>
		</div>
	);
}
