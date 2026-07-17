"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;

  title?: string;
  description?: string;

  children: ReactNode;

  width?: "sm" | "md" | "lg" | "xl" | "2xl";

  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
}

const widths = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={() => {
          if (closeOnOverlayClick) onClose();
        }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full ${widths[width]} rounded-2xl bg-white shadow-2xl transition-all duration-200 dark:bg-zinc-900 animate-in fade-in zoom-in-95`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
