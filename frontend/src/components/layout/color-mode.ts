export type ColorMode = "light" | "dark";

export const COLOR_MODE_STORAGE_KEY = "task-management-color-mode";

export const colorModeOptions: Array<{
  value: ColorMode;
  label: string;
  description: string;
}> = [
  {
    value: "light",
    label: "Light",
    description: "Clean workspace with a bright canvas.",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Reduced glare for lower-light use.",
  },
];

export function isColorMode(value: string | null): value is ColorMode {
  return value === "light" || value === "dark";
}

export function getStoredColorMode(): ColorMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedMode = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);

  return isColorMode(storedMode) ? storedMode : "light";
}

export function applyColorMode(mode: ColorMode): void {
  const root = document.documentElement;

  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

export function setStoredColorMode(mode: ColorMode): void {
  window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  applyColorMode(mode);
}

export function getColorModeBootstrapScript(): string {
  return `
(function() {
  try {
    var storageKey = ${JSON.stringify(COLOR_MODE_STORAGE_KEY)};
    var stored = window.localStorage.getItem(storageKey);
    var theme = stored === "dark" ? "dark" : "light";
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {}
})();
`.trim();
}
