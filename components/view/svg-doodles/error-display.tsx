"use client";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
	error: string;
	path: string;
	onCreateDefaultPath: () => void;
}

export function ErrorDisplay({
	error,
	path,
	onCreateDefaultPath,
}: ErrorDisplayProps) {
	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-6">
			<div className="mb-4 max-w-md rounded-md border border-red-200 bg-red-50 p-4">
				<p className="text-red-800 text-sm">{error}</p>
			</div>
			<p className="mb-4 text-gray-600">Current path data:</p>
			<div className="mb-4 w-full max-w-md overflow-auto rounded border bg-gray-50 p-3">
				<code className="text-xs">{path || "No path data"}</code>
			</div>
			<Button onClick={onCreateDefaultPath}>Create Default Path</Button>
		</div>
	);
}
