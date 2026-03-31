"use client";

import { useMediaQuery } from "@/components/ui/use-media-query";
import { preBuiltShadows } from "@/config/shadow-data";
import { useShadowStore } from "@/store/useShadowStore";
import type { ShadowLayer, ShadowPreset } from "@/types/shadow";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ShadowControls from "./shadow-controls";
import ShadowGallery from "./shadow-gallery";
import ShadowPresets from "./shadow-presets";
import ShadowPreview from "./shadow-preview";

export default function ShadowGenerator() {
  const { theme } = useTheme();
  const isTab = useMediaQuery("(max-width:1024px)");
  const isMobile = useMediaQuery("(max-width:768px)");
  const [shadowName, setShadowName] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);

  const {
    savedShadows,
    favorites,
    addShadow,
    updateShadow,
    deleteShadow,
    toggleFavorite,
    isFavorite,
  } = useShadowStore();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRemoveShadow, setIsRemoveShadow] = useState<boolean>(false);
  const [layers, setLayers] = useState<ShadowLayer[]>([
    {
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      spread: 1,
      color: "#000000",
      opacity: 4,
      isVisible: true,
    },
    {
      offsetX: 0,
      offsetY: 1,
      blur: 0,
      spread: 0,
      color: "#000000",
      opacity: 5,
      isVisible: true,
    },
    {
      offsetX: 0,
      offsetY: 2,
      blur: 2,
      spread: 0,
      color: "#000000",
      opacity: 5,
      isVisible: true,
    },
    {
      offsetX: 0,
      offsetY: 2,
      blur: 4,
      spread: 0,
      color: "#000000",
      opacity: 5,
      isVisible: true,
    },
  ]);
  const [activeShadow, setActiveShadow] = useState<ShadowPreset | null>(
    preBuiltShadows[0],
  );
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [tailwindClass, setTailwindClass] = useState("");
  const [cssValue, setCssValue] = useState("");
  const [_uniqueColors, setUniqueColors] = useState<
    { color: string; count: number }[]
  >([]);

  const [globalPositionMode, setGlobalPositionMode] = useState(false);
  const [globalShadowTypeMode, setGlobalShadowTypeMode] = useState(false);
  const [globalBlurMode, setGlobalBlurMode] = useState(false);
  const [globalSpreadMode, setGlobalSpreadMode] = useState(false);
  const [globalOpacityMode, setGlobalOpacityMode] = useState(false);
  const [globalMasterMode, setGlobalMasterMode] = useState(false);

  const toggleGlobalMasterMode = (enabled: boolean) => {
    setGlobalMasterMode(enabled);
    setGlobalPositionMode(enabled);
    setGlobalBlurMode(enabled);
    setGlobalSpreadMode(enabled);
    setGlobalOpacityMode(enabled);
    setGlobalShadowTypeMode(enabled);
  };

  useEffect(() => {
    if (activeShadow) {
      setIsEdited(checkIfEdited(layers, activeShadow));
    }
    const shadowString = layers
      .filter((layer) => layer.isVisible !== false)
      .map((layer) => {
        const { offsetX, offsetY, blur, spread, color, opacity, isInner } =
          layer;
        const rgba = `rgba(${Number.parseInt(
          color.slice(1, 3),
          16,
        )}, ${Number.parseInt(color.slice(3, 5), 16)}, ${Number.parseInt(
          color.slice(5, 7),
          16,
        )}, ${opacity / 100})`;
        return `${
          isInner ? "inset " : ""
        }${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}`;
      })
      .join(", ");

    setCssValue(shadowString);

    const tailwindShadow = `shadow-[${layers
      .filter((layer) => layer.isVisible !== false)
      .map((layer) => {
        const { offsetX, offsetY, blur, spread, color, opacity, isInner } =
          layer;
        const rgba =
          opacity === 100
            ? color
            : `rgba(${Number.parseInt(color.slice(1, 3), 16)},${Number.parseInt(
                color.slice(3, 5),
                16,
              )},${Number.parseInt(color.slice(5, 7), 16)},${opacity / 100})`;
        return `${
          isInner ? "inset_" : ""
        }${offsetX}px_${offsetY}px_${blur}px_${spread}px_${rgba}`;
      })
      .join(",")}]`;

    setTailwindClass(tailwindShadow);

    const colorMap = new Map<string, number>();

    for (const layer of layers) {
      const color = layer.color.toUpperCase();
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }

    const uniqueColorArray = Array.from(colorMap.entries()).map(
      ([color, count]) => ({
        color,
        count,
      }),
    );

    setUniqueColors(uniqueColorArray);
  }, [layers, activeShadow]);

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const checkIfEdited = (
    currentLayers: ShadowLayer[],
    originalPreset: ShadowPreset,
  ) => {
    if (!originalPreset) return false;

    if (currentLayers.length !== originalPreset.layers.length) return true;

    for (let i = 0; i < currentLayers.length; i++) {
      const currentLayer = currentLayers[i];
      const originalLayer = originalPreset.layers[i];

      if (
        currentLayer.offsetX !== originalLayer.offsetX ||
        currentLayer.offsetY !== originalLayer.offsetY ||
        currentLayer.blur !== originalLayer.blur ||
        currentLayer.spread !== originalLayer.spread ||
        currentLayer.color !== originalLayer.color ||
        currentLayer.opacity !== originalLayer.opacity ||
        currentLayer.isInner !== originalLayer.isInner ||
        currentLayer.isVisible !== originalLayer.isVisible
      ) {
        return true;
      }
    }

    return false;
  };

  const applyPreset = (preset: ShadowPreset) => {
    if (isDarkMode && preset.darkLayers) {
      setLayers([...preset.darkLayers]);
    } else {
      setLayers([...preset.layers]);
    }
    setActiveLayerIndex(0);
    setActiveShadow(preset);
    setCurrentPresetId(preset.id || null);
    setIsEdited(false);
    setShadowName(preset.name || "");
  };

  const saveCurrentShadow = () => {
    const shadowToSave = {
      name: shadowName || "Custom Shadow",
      tailwind: tailwindClass,
      css: cssValue,
      darkTailwind: isDarkMode ? tailwindClass : undefined,
      darkCss: isDarkMode ? cssValue : undefined,
      layers: [...layers],
      darkLayers: isDarkMode ? [...layers] : undefined,
      isCustom: true,
    };

    if (currentPresetId && savedShadows.some((s) => s.id === currentPresetId)) {
      updateShadow(currentPresetId, shadowToSave);

      toast.success("Your custom shadow has been updated.!");
    } else {
      const newId = addShadow(shadowToSave);
      setCurrentPresetId(newId);
      toast.success("Your custom shadow has been saved.");
    }

    setIsEdited(false);
  };

  return (
    <>
      <ShadowGallery
        applyPreset={applyPreset}
        activeShadow={activeShadow}
        isDarkMode={isDarkMode}
      />

      {isMobile && (
        <p className="pb-2 text-center text-primary/60">
          Please use a desktop/laptop to view the Editor.
        </p>
      )}
      <div
        id="editor"
        className="relative z-10 mx-auto grid grid-cols-12 gap-4 px-4 pb-5 xl:container sm:pt-8 2xl:px-0"
      >
        {!isTab && (
          <ShadowControls
            layers={layers}
            setLayers={setLayers}
            activeLayerIndex={activeLayerIndex}
            setActiveLayerIndex={setActiveLayerIndex}
            globalMasterMode={globalMasterMode}
            // @ts-ignore
            setGlobalMasterMode={toggleGlobalMasterMode}
            globalPositionMode={globalPositionMode}
            globalBlurMode={globalBlurMode}
            globalSpreadMode={globalSpreadMode}
            globalOpacityMode={globalOpacityMode}
            globalShadowTypeMode={globalShadowTypeMode}
          />
        )}

        <ShadowPreview
          cssValue={cssValue}
          tailwindClass={tailwindClass}
          isRemoveShadow={isRemoveShadow}
          setIsRemoveShadow={setIsRemoveShadow}
          isEdited={isEdited}
          shadowName={shadowName}
          setShadowName={setShadowName}
          saveCurrentShadow={saveCurrentShadow}
          activeShadow={activeShadow}
        />

        {!isMobile && (
          <ShadowPresets
            activeShadow={activeShadow}
            applyPreset={applyPreset}
            savedShadows={savedShadows}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            deleteShadow={deleteShadow}
            currentPresetId={currentPresetId}
            setCurrentPresetId={setCurrentPresetId}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </>
  );
}
