// Define the core types for the shadow generator

export interface ShadowLayer {
	offsetX: number;
	offsetY: number;
	blur: number;
	spread: number;
	color: string;
	opacity: number;
	isInner?: boolean;
	isVisible?: boolean;
}

export interface ShadowPreset {
	id: string;
	name: string;
	tailwind: string;
	css: string;
	darkTailwind?: string;
	darkCss?: string;
	layers: ShadowLayer[];
	darkLayers?: ShadowLayer[];
	isCustom?: boolean;
	shadowName?: string;
}

export interface TextShadowPreset {
	id: string;
	name: string;
	textShadow: string;
	tailwindV4: string;
}

export interface ShadowStore {
	savedShadows: ShadowPreset[];
	favorites: string[];
	addShadow: (shadow: Omit<ShadowPreset, "id">) => string;
	updateShadow: (id: string, shadow: Omit<ShadowPreset, "id">) => void;
	deleteShadow: (id: string) => void;
	toggleFavorite: (id: string) => void;
	isFavorite: (id: string) => boolean;
}
