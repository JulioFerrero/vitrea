import { getIcon } from "../../icons";
import { Modal } from "@vitrea/editor-ui/modal";

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
    <Modal open={open} onOpenChange={onOpenChange} maxWidth="max-w-md">
      <h2 className="text-base font-semibold text-white tracking-tight">Add Element</h2>
      <p className="text-sm text-white/50 mt-1">Choose a type to add.</p>
      <div className="grid grid-cols-3 gap-2 py-4">
        {elementTypes.map((et) => {
          const Icon = getIcon(et.icon);
          if (!Icon) return null;
          return (
            <button type="button" key={et.type} onClick={() => onSelect(et.type)}
              className="flex flex-col items-center gap-1 rounded-lg border border-white/10 px-3 py-3 text-[11px] text-white/80 hover:border-editor-ring/30 hover:bg-editor-selected hover:text-editor-ring transition-colors">
              <Icon className="h-4 w-4" /><span className="font-medium">{et.label}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
