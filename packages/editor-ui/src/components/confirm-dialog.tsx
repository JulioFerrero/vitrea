"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./form-primitives";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "primary",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "primary" | "danger";
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} maxWidth="max-w-sm">
      <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
      <p className="text-sm text-white/50 mt-1">{description}</p>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant={variant} onClick={() => { onConfirm(); onOpenChange(false); }}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
