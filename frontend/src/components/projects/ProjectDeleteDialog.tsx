"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ProjectDeleteDialogProps {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ProjectDeleteDialog({
  open,
  projectName,
  onClose,
  onConfirm,
}: ProjectDeleteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm();
      onClose();
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : "Unable to delete project.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return typeof document !== "undefined"
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/30 px-4 py-4 sm:items-center sm:py-6"
          onClick={onClose}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="my-auto w-full max-w-[400px] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[16px] border border-border bg-background p-4 shadow-[0_18px_44px_rgba(0,0,0,0.12)]"
          >
            <h2 className="text-[17px] font-semibold leading-5 text-foreground">
              Delete Project
            </h2>
            <p className="mt-2 text-[12px] leading-5 text-muted">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{projectName}</span>?
            </p>

            {error ? (
              <p className="mt-4 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center rounded-[4px] border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={isSubmitting}
                className="inline-flex h-9 items-center rounded-[4px] bg-red-600 px-4 text-[12px] font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;
}
