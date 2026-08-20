"use client";

import { MoreHorizontal } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

interface ProjectActionsMenuProps {
  projectName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectActionsMenu({
  projectName,
  onEdit,
  onDelete,
}: ProjectActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 6,
        left: Math.max(8, rect.right - 144),
      });
    };

    updateMenuPosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        menuRef.current &&
        target instanceof Node &&
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  const menu =
    open && typeof document !== "undefined" && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            className="w-36 max-w-[calc(100vw-1rem)] rounded-[8px] border border-border bg-background p-1 shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 1000,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex h-8 w-full items-center rounded-[6px] px-2 text-left text-[12px] font-medium text-foreground transition-colors hover:bg-surface"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex h-8 w-full items-center rounded-[6px] px-2 text-left text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Open actions for {projectName}</span>
      </button>

      {menu}
    </div>
  );
}
