interface HelpFooterProps {
	zoomLevel: number;
}

export function HelpFooter({ zoomLevel }: HelpFooterProps) {
	return (
		<div className="border-t p-4">
			<div className="text-gray-500 text-sm">
				<p>
					<strong>Controls:</strong> Drag blue points to move anchors (control
					points move with them). Drag red points to adjust curves. Double-click
					on a line to add a new point. Right-click on a point to remove it.
				</p>
				<p className="mt-1">
					<strong>Navigation:</strong> Alt+drag or middle-click to pan.{" "}
					<kbd className="rounded border bg-gray-100 px-1 py-0.5 text-xs">
						Ctrl+Wheel
					</kbd>{" "}
					to zoom.
					<kbd className="ml-2 rounded border bg-gray-100 px-1 py-0.5 text-xs">
						Ctrl+Z
					</kbd>{" "}
					to undo,
					<kbd className="ml-1 rounded border bg-gray-100 px-1 py-0.5 text-xs">
						Ctrl+Y
					</kbd>{" "}
					to redo.
				</p>
				{zoomLevel !== 1 && (
					<div className="absolute top-4 right-4 rounded bg-black/70 px-2 py-1 text-white text-xs">
						Zoom: {zoomLevel.toFixed(1)}x
					</div>
				)}
			</div>
		</div>
	);
}
