"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Input, Button } from "./form-primitives";

export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValue = "",
  placeholder,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setValue("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={(isOpen) => { if (!isOpen) setValue(""); onOpenChange(isOpen); }}>
      <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
      {description && <p className="text-sm text-white/50 mt-1">{description}</p>}
      <div className="space-y-3 pt-2">
        <Input
          value={value}
          onChange={setValue}
          placeholder={placeholder}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </div>
    </Modal>
  );
}
