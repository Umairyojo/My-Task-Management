export type ColorPalette = "amber" | "blue" | "pink" | "rose" | "emerald" | "black";

export const COLOR_PALETTE_STORAGE_KEY = "task-management-color-palette";

export const colorPaletteOptions: Array<{
  value: ColorPalette;
  label: string;
  color: string;
}> = [
  { value: "amber", label: "Amber", color: "#f59e0b" },
  { value: "blue", label: "Blue", color: "#3b82f6" },
  { value: "pink", label: "Pink", color: "#ec4899" },
  { value: "rose", label: "Rose", color: "#f43f5e" },
  { value: "emerald", label: "Emerald", color: "#10b981" },
  { value: "black", label: "Black", color: "#111111" },
];

export function isColorPalette(value: string | null): value is ColorPalette {
  return (
    value === "amber" ||
    value === "blue" ||
    value === "pink" ||
    value === "rose" ||
    value === "emerald" ||
    value === "black"
  );
}

export function getStoredColorPalette(): ColorPalette {
  if (typeof window === "undefined") {
    return "blue";
  }

  const storedValue = window.localStorage.getItem(COLOR_PALETTE_STORAGE_KEY);

  return isColorPalette(storedValue) ? storedValue : "blue";
}

export function applyColorPalette(palette: ColorPalette): void {
  document.documentElement.dataset.color = palette;
}

export function setStoredColorPalette(palette: ColorPalette): void {
  window.localStorage.setItem(COLOR_PALETTE_STORAGE_KEY, palette);
  applyColorPalette(palette);
}

export function getColorPaletteBootstrapScript(): string {
  return `
(function() {
  try {
    var storageKey = ${JSON.stringify(COLOR_PALETTE_STORAGE_KEY)};
    var stored = window.localStorage.getItem(storageKey);
    var palette =
      stored === "amber" ||
      stored === "blue" ||
      stored === "pink" ||
      stored === "rose" ||
      stored === "emerald" ||
      stored === "black"
        ? stored
        : "blue";
    window.document.documentElement.dataset.color = palette;
  } catch (error) {}
})();
`.trim();
}
