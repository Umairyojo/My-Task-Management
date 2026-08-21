"use client";

import { useEffect } from "react";
import { applyColorMode } from "./color-mode";
import { useColorMode } from "./use-color-mode";

export function ColorModeSync() {
  const colorMode = useColorMode();

  useEffect(() => {
    applyColorMode(colorMode);
  }, [colorMode]);

  return null;
}
