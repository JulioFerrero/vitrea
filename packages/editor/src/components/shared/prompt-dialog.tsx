import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@hi/ui/dialog";
import { inputBase } from "../right-panel/primitives";

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
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) setValue(""); onOpenChange(isOpen); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
            placeholder={placeholder}
            className={inputBase}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-[11px] rounded-md text-white/50 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-1.5 text-[11px] rounded-md bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
