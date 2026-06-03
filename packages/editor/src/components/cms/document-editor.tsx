"use client";

import { useState, useMemo, useRef, memo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CmsCollectionItem, CmsDocumentItem, CmsFieldConfig } from "../../stores/cms-store";
import { useCmsContext } from "../../lib/context";
import { createCmsActions } from "../../lib/cms-actions";
import { ReferencePicker } from "./reference-picker";
import { MediaLibrary } from "../media-library";
import { Modal } from "@hi/editor-ui/modal";
import { Button, Input } from "@hi/editor-ui/form-primitives";
import { cn } from "@hi/utils";
import { Image as ImageIcon } from "lucide-react";

const textareaClass = "flex w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-editor-ring/30 focus:border-editor-ring/40 transition-all duration-200 resize-y min-h-[80px]";
const labelClass = "block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5";

export function DocumentEditor({ document, collection, siteId }: {
  document: CmsDocumentItem;
  collection: CmsCollectionItem | null;
  siteId: string;
}) {
  const { api } = useCmsContext();
  const actions = useMemo(() => createCmsActions(api), [api]);
  const [data, setData] = useState<Record<string, unknown>>({ ...document.data });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField(name: string, value: unknown) {
    setData((d) => ({ ...d, [name]: value }));
  }

  function updateArrayField(name: string, items: unknown[]) {
    setData((d) => ({ ...d, [name]: items }));
  }

  async function save() {
    setSaving(true);
    await actions.updateDocument(document.id, { data });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function toggleStatus() {
    await actions.updateDocument(document.id, {
      status: document.status === "published" ? "draft" : "published",
    });
  }

  if (!collection) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-base font-semibold text-white/80">{collection.label}</h2>
          <p className="text-[11px] text-white/30 mt-0.5 font-mono">{document.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleStatus}
            className={cn("text-[11px] px-3 py-1.5 rounded-xl border font-medium transition-all duration-200",
              document.status === "published"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/[0.15]"
                : "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/[0.15]")}>
            {document.status === "published" ? "Published" : "Draft"}
          </button>
          <button type="button" onClick={save} disabled={saving}
            className={cn("text-[11px] px-4 py-1.5 rounded-xl font-semibold transition-all duration-200",
              saved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/80 hover:bg-white/[0.15]")}>
            {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {collection.fields.map((field) => {
          if (field.type === "array") {
            return (
              <ArrayBlock
                key={field.name}
                field={field}
                items={(Array.isArray(data[field.name]) ? data[field.name] : []) as Record<string, unknown>[]}
                onChange={(items) => updateArrayField(field.name, items)}
                siteId={siteId}
              />
            );
          }
          return (
            <FormField
              key={field.name}
              field={field}
              value={data[field.name]}
              onChange={(v) => updateField(field.name, v)}
              siteId={siteId}
            />
          );
        })}
      </div>

      <div className="mt-10 pt-4 border-t border-white/[0.06] text-[11px] text-white/20 font-mono">
        Created: {new Date(document.createdAt).toLocaleString()}
        <br />Updated: {new Date(document.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}

function FormField({ field, value, onChange, siteId }: {
  field: CmsFieldConfig; value: unknown; onChange: (v: unknown) => void; siteId: string;
}) {
  const label = field.label ?? field.name;
  const str = typeof value === "string" ? value : "";
  const cmsCtx = useCmsContext();

  if (field.type === "reference") {
    const ids: string[] = Array.isArray(value) ? (value as string[]).map(String) : (typeof value === "string" && value.length > 0 ? [value] : []);
    return (
      <div>
        <div className={labelClass}>{label}</div>
        <ReferencePicker collection={field.collection ?? ""} selectedIds={ids} multiple={field.multiple ?? false} siteId={siteId}
          onChange={(newIds) => onChange(field.multiple ? newIds : (newIds[0] ?? null))} />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <div className={labelClass}>
          {label}{field.required && <span className="text-destructive ml-0.5">*</span>}
        </div>
        <textarea value={str} placeholder={(field.default as string) ?? ""} rows={4}
          onChange={(e) => onChange(e.target.value)} className={textareaClass} />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <div className={labelClass}>{label}</div>
        <select value={str} onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-xl border border-border bg-transparent text-foreground px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 appearance-none cursor-pointer">
          <option value="">Select...</option>
          {(field.options ?? []).map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === "boolean") {
    const checked = value === true || value === "true";
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-transparent accent-editor-ring" />
        <span className="text-sm text-white/70">{label}</span>
      </label>
    );
  }

  if (field.type === "image") {
    return (
      <div>
        <div className={labelClass}>{label}</div>
        {str ? (
          <div className="relative group rounded-xl overflow-hidden border border-white/[0.06] bg-editor-surface">
            <img src={str} alt="" className="w-full max-h-48 object-cover" />
            <button type="button" onClick={() => onChange("")}
              className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-lg bg-black/60 text-white hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all">&times;</button>
          </div>
        ) : (
          <div className="space-y-1">
            <Input placeholder="Image URL..."
              value={str} onChange={(v) => onChange(v)} />
            <MediaPickerButton onChange={onChange} api={cmsCtx.api} siteId={siteId} />
          </div>
        )}
        {str && <MediaPickerButton onChange={onChange} api={cmsCtx.api} siteId={siteId} />}
      </div>
    );
  }

  return (
    <div>
      <div className={labelClass}>
        {label}{field.required && <span className="text-destructive ml-0.5">*</span>}
      </div>
      <Input
        type={field.type === "number" ? "number" : "text"}
        value={str}
        placeholder={(field.default as string) ?? ""}
        onChange={(v) => onChange(v)}
      />
    </div>
  );
}

function ArrayBlock({ field, items, onChange, siteId }: {
  field: CmsFieldConfig; items: Record<string, unknown>[]; onChange: (items: unknown[]) => void; siteId: string;
}) {
  const subs = field.of ?? [];
  const label = field.label ?? field.name;
  const previewField = field.preview;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const skipAnimRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    const next = [...items];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    skipAnimRef.current = true;
    onChange(next);
  }

  function add() {
    const newItem: Record<string, unknown> = {};
    for (const sf of subs) {
      if (sf.default !== undefined) newItem[sf.name] = sf.default;
    }
    const newIndex = items.length;
    onChange([...items, newItem]);
    setEditingIndex(newIndex);
  }

  function editItem(index: number, fieldName: string, val: unknown) {
    const next = [...items];
    next[index] = { ...next[index], [fieldName]: val };
    onChange(next);
  }

  function remove(index: number) {
    if (editingIndex === index) setEditingIndex(null);
    onChange(items.filter((_, i) => i !== index));
  }

  function itemPreview(item: Record<string, unknown>): string {
    if (previewField) {
      const val = item[previewField];
      if (typeof val === "string" && val.trim()) return val;
    }
    for (const sf of subs) {
      if (sf.type === "text" || sf.type === "textarea") {
        const val = item[sf.name];
        if (typeof val === "string" && val.trim()) return val;
      }
    }
    return "Empty";
  }

  const editingItem = editingIndex !== null ? items[editingIndex] : null;

  useEffect(() => {
    skipAnimRef.current = false;
  });

  return (
    <div>
      <div className={labelClass}>{label} ({items.length})</div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((_, i) => i)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.map((item, idx) => (
              <SortableItem
                key={idx}
                id={idx}
                item={item}
                index={idx}
                preview={itemPreview(item)}
                isEditing={editingIndex === idx}
                skipAnim={skipAnimRef.current}
                onEdit={() => setEditingIndex(idx)}
                onRemove={() => remove(idx)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button type="button" onClick={add}
        className="w-full mt-3 rounded-xl border border-dashed border-white/10 px-4 py-3 text-xs text-white/30 hover:text-white/50 hover:border-white/20 transition-all duration-200">
        + Add {label}
      </button>

      <Modal open={editingIndex !== null} onOpenChange={(o) => { if (!o) setEditingIndex(null); }} variant="flat" maxWidth="max-w-lg">
        <h2 className="text-base font-semibold text-white tracking-tight">
          {label} #{editingIndex !== null ? editingIndex + 1 : ""}
        </h2>
        <p className="text-sm text-white/40 mt-1">Edit this {label.toLowerCase()} item</p>

        <div className="space-y-5 py-2 max-h-[55vh] overflow-y-auto editor-scroll mt-4">
          {editingItem && subs.map((sf) => (
            <FormField
              key={sf.name}
              field={sf}
              value={editingItem[sf.name]}
              onChange={(v) => editItem(editingIndex!, sf.name, v)}
              siteId={siteId}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="danger" onClick={() => { remove(editingIndex!); setEditingIndex(null); }}>
            Remove
          </Button>
          <Button variant="outline" onClick={() => setEditingIndex(null)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const SortableItem = memo(function SortableItem({ id, item: _item, index, preview, isEditing, skipAnim, onEdit, onRemove }: {
  id: number;
  item: Record<string, unknown>;
  index: number;
  preview: string;
  isEditing: boolean;
  skipAnim: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition: sortableTransition, isDragging } = useSortable({
    id,
    animateLayoutChanges: skipAnim ? () => false : undefined,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: sortableTransition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors duration-150 group",
        isDragging
          ? "border-editor-ring/40 bg-editor-surface shadow-xl"
          : isEditing
            ? "border-editor-ring/30 bg-editor-selected"
            : "border-white/[0.06] bg-editor-surface/60 hover:border-white/10 hover:bg-editor-surface"
      )}>
      <button type="button" {...attributes} {...listeners}
        className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded text-white hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="3" cy="2.5" r="0.9" />
          <circle cx="9" cy="2.5" r="0.9" />
          <circle cx="3" cy="6" r="0.9" />
          <circle cx="9" cy="6" r="0.9" />
          <circle cx="3" cy="9.5" r="0.9" />
          <circle cx="9" cy="9.5" r="0.9" />
        </svg>
      </button>

      <button type="button" onClick={onEdit}
        className="flex-1 text-left min-w-0 flex items-center gap-2">
        <span className="text-[11px] text-white/20 flex-shrink-0 font-mono tabular-nums">#{index + 1}</span>
        <span className="text-sm text-white/70 truncate">{preview}</span>
      </button>

      <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-lg text-white/20 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" />
        </svg>
      </button>
    </div>
  );
  }, (prev, next) => {
  return prev.preview === next.preview && prev.isEditing === next.isEditing && prev.id === next.id;
});

function MediaPickerButton({ onChange, api, siteId }: {
  onChange: (v: unknown) => void; api: { fetch: (path: string, init?: RequestInit) => Promise<unknown> }; siteId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[11px] text-white/30 hover:text-editor-ring transition-colors"
      >
        <ImageIcon className="h-3 w-3 text-white" />
        Media Library
      </button>
      <MediaLibrary
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(url) => { onChange(url); setOpen(false); }}
        siteId={siteId}
        api={{ fetch: api.fetch } as import("../../types").EditorApi}
      />
    </>
  );
}
