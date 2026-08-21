"use client";

import { Check, ChevronDown, MoonStar, SunMedium } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  colorModeOptions,
  type ColorMode,
  setStoredColorMode,
} from "./color-mode";
import { useColorMode } from "./use-color-mode";

export function ColorModeMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const colorMode = useColorMode();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectColorMode = (nextMode: ColorMode) => {
    setStoredColorMode(nextMode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Open color mode menu</span>
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Color mode"
          className="absolute right-0 top-full z-20 mt-2 w-[216px] rounded-lg border border-border bg-background p-2 shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
        >
          <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Color Mode
          </div>

          <div className="space-y-1">
            {colorModeOptions.map((option) => {
              const selected = option.value === colorMode;
              const Icon = option.value === "light" ? SunMedium : MoonStar;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => handleSelectColorMode(option.value)}
                  className={[
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                    selected ? "bg-surface" : "hover:bg-surface",
                  ].join(" ")}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium leading-4 text-foreground">
                      {option.label}
                    </span>
                    <span className="block text-[10px] leading-4 text-muted">
                      {option.description}
                    </span>
                  </span>

                  <span
                    className={[
                      "inline-flex h-4 w-4 items-center justify-center rounded-[3px] border",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-transparent",
                    ].join(" ")}
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
