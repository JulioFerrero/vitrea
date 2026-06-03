import { getIcon } from "../../icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@hi/ui/dialog";

export function AddElementDialog({
  open,
  onOpenChange,
  elementTypes,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementTypes: { type: string; label: string; icon: string }[];
  onSelect: (type: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Element</DialogTitle><DialogDescription>Choose a type to add.</DialogDescription></DialogHeader>
        <div className="grid grid-cols-3 gap-2 py-2">
          {elementTypes.map((et) => {
            const Icon = getIcon(et.icon);
            if (!Icon) return null;
            return (
              <button type="button" key={et.type} onClick={() => onSelect(et.type)}
                className="flex flex-col items-center gap-1 rounded-lg border border-white/10 px-3 py-3 text-[10px] text-white/80 hover:border-editor-ring/30 hover:bg-editor-selected hover:text-editor-ring transition-colors">
                <Icon className="h-4 w-4" /><span className="font-medium">{et.label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
