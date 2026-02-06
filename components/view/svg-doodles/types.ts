export interface ControlPoint {
	x: number;
	y: number;
	command: string;
	isControl: boolean;
}

export interface SvgEditorProps {
	path: string;
	onPathChange: (path: string) => void;
	onClose: () => void;
	strokeColor?: string;
	strokeWidth?: number;
	viewBox?: string;
}

export interface EditorState {
	controlPoints: ControlPoint[];
	draggedPointIndex: number;
	currentEditPath: string;
	controlPointsHistory: ControlPoint[][];
	historyIndex: number;
	zoomLevel: number;
	hoverPointIndex: number | null;
	isPanning: boolean;
	panOffset: { x: number; y: number };
	startPanPosition: { x: number; y: number };
	error: string | null;
	debugInfo: string;
}
