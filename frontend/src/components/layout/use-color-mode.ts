"use client";

import { useSyncExternalStore } from "react";
import {
  COLOR_MODE_CHANGE_EVENT,
  COLOR_MODE_STORAGE_KEY,
  type ColorMode,
  getStoredColorMode,
} from "./color-mode";

function subscribe(callback: () => void): () => void {
  const handleInvalidate = () => {
    callback();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === COLOR_MODE_STORAGE_KEY || event.key === null) {
      handleInvalidate();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(COLOR_MODE_CHANGE_EVENT, handleInvalidate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(COLOR_MODE_CHANGE_EVENT, handleInvalidate);
  };
}

export function useColorMode(): ColorMode {
  return useSyncExternalStore(subscribe, getStoredColorMode, () => "light");
}
