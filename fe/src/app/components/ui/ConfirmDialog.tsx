"use client";

import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  title: string;
  description: string;

  confirmText?: string;
  cancelText?: string;

  confirmVariant?: "primary" | "danger";

  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="md">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>

      <div className="mt-8 flex justify-end gap-3">
        <Button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="border border-zinc-300 bg-transparent text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
        >
          {cancelText}
        </Button>

        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={
            confirmVariant === "danger"
              ? "bg-red-600 hover:bg-red-700"
              : undefined
          }
        >
          {loading ? "Please wait..." : confirmText}
        </Button>
      </div>
    </Modal>
  );
}
