"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDrawPathsStore } from "@/store/use-draw-paths-store";
import { useSavedEditedPathsStore } from "@/store/use-saved-edited-paths";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

interface SavePathDialogProps {
	setEditPath: (arg0: boolean | null) => void;
	editPath?: boolean;
	path: string;
	viewBox: string;
	onClose: () => void;
	onSuccess?: (id: string) => void;
	existingPathId?: string;
}

export function SavePathDialog({
	setEditPath,
	editPath,
	path,
	viewBox,
	onClose,
	onSuccess,
	existingPathId,
}: SavePathDialogProps) {
	const [name, setName] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);

	const { addPath, updatePath, getPathById } = useDrawPathsStore();
	const { addEditedPath, updateEditedPath, getEditedPathById } =
		useSavedEditedPathsStore();

	const isEditMode = Boolean(editPath);

	useEffect(() => {
		if (existingPathId) {
			const existing = isEditMode
				? getEditedPathById(existingPathId)
				: getPathById(existingPathId);
			if (existing) {
				setName(existing.name);
				setIsUpdating(true);
			}
		}
	}, [existingPathId, getPathById, getEditedPathById, isEditMode]);

	const handleSave = () => {
		if (!name.trim()) {
			toast.error("Name required", {
				description: "Please enter a name for your path",
			});
			return;
		}

		if (!path) {
			toast.success("No path to save", {
				description: "There is no path data to save",
			});
			return;
		}

		try {
			let id: string;

			if (isUpdating && existingPathId) {
				if (isEditMode) {
					updateEditedPath(existingPathId, {
						name: name.trim(),
						path,
						viewBox,
					});
				} else {
					updatePath(existingPathId, {
						name: name.trim(),
						path,
						viewBox,
					});
				}
				id = existingPathId;

				toast.success("Path updated", {
					description: `"${name}" has been updated in your collection`,
				});
			} else {
				id = isEditMode
					? addEditedPath(name.trim(), path, viewBox)
					: addPath(name.trim(), path, viewBox);

				toast.success("Path saved", {
					description: `"${name}" has been saved to your collection`,
				});
			}

			if (onSuccess) {
				onSuccess(id);
			}

			onClose();
			setEditPath(null);
		} catch (error) {
			console.error("Error saving path:", error);
			toast.error("Save failed", {
				description: "There was an error saving your path. Please try again.",
			});
		}
	};

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-lg border bg-card-bg shadow-lg">
				<div className="flex items-center justify-between border-b p-4">
					<h2 className="font-semibold text-xl">
						{isUpdating ? "Update Path" : "Save Path"}
					</h2>
					<Button variant="solid" color="red" size="icon" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<div className="space-y-4 p-4">
					<div className="space-y-2">
						<Label htmlFor="path-name">Path Name</Label>
						<Input
							id="path-name"
							value={name}
							required
							className="bg-main"
							onChange={(e) => setName(e.target.value)}
							placeholder="My awesome path"
							autoFocus
						/>
					</div>

					<div className="space-y-2">
						<Label>Path Preview</Label>
						<div className="max-h-24 overflow-auto rounded border bg-main p-3">
							<code className="break-all font-mono text-xs">{path}</code>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 border-t p-4">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave}>
						{isUpdating ? "Update Path" : "Save Path"}
					</Button>
				</div>
			</div>
		</div>
	);
}
