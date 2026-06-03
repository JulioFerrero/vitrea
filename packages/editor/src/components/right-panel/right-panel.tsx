import { useEditorStore } from "../../stores";
import { useEditorContext } from "../../lib/context";
import { glassStyle } from "@hi/editor-ui/glass";
import { Copy, Trash2, Upload, RotateCcw } from "lucide-react";
import { CompactInput, Label, Btn, BtnGroup, SectionLabel } from "./primitives";
import { IconButton } from "@hi/editor-ui/icon-button";
import { ContentField } from "./content-field";
import { StyleGroup } from "./style-group";
import { derivePath, slugify } from "../../lib/paths";
import { findElementById } from "@hi/render";

export function RightPanel() {
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const content = useEditorStore((s) => s.content);
  const activePageId = useEditorStore((s) => s.activePageId);
  const pages = useEditorStore((s) => s.pages);
  const hasActiveDraft = useEditorStore((s) => s.hasActiveDraft);
  const updatePageLocal = useEditorStore((s) => s.updatePageLocal);
  const { schema, actions, api, siteId } = useEditorContext();

  const selected = selectedElementId ? findElementById(content, selectedElementId) : null;
  const activePage = pages.find((p) => p.id === activePageId);

  if (!selected) {
    return (
      <div className="w-[240px] h-full flex flex-col backdrop-blur-[10px] relative rounded-2xl" style={glassStyle}>
        {activePage ? (
          <>
            <SectionLabel>Page</SectionLabel>
            <div className="px-3 pb-2 space-y-3">
              <CompactInput label="Title" value={activePage.data.title} onChange={(v) => updatePageLocal(activePage.id, { data: { title: v } })} />
              <CompactInput label="Slug" value={activePage.slug} onChange={(v) => {
                const s = slugify(v);
                updatePageLocal(activePage.id, { slug: s, data: { path: derivePath(s, activePage.data.parentId, pages) } });
              }} />
              <div>
                <Label>Status</Label>
                <BtnGroup>
                  {(["draft", "published"] as const).map((s) => (
                    <Btn key={s} active={activePage.data.status === s} onClick={() => updatePageLocal(activePage.id, { data: { status: s } })}>
                      {s}
                    </Btn>
                  ))}
                </BtnGroup>
              </div>
              {hasActiveDraft && (
                <div className="pt-1 space-y-1.5">
                  <button
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white text-black px-3 py-1.5 text-xs font-medium hover:bg-white/90 transition-colors"
                    onClick={() => actions.publishPage()}
                  >
                    <Upload className="h-3 w-3" />
                    Publish Now
                  </button>
                  <button
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 text-xs font-medium hover:bg-red-500/20 transition-colors"
                    onClick={() => {
                      actions.discardDraft().then(() => {
                        const pageId = useEditorStore.getState().activePageId;
                        if (pageId) actions.loadContent(pageId);
                      });
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Discard Draft
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="px-3 py-8 text-[11px] text-white/60 text-center">Select a page</div>
        )}
      </div>
    );
  }

  const typeConfig = schema.elementTypes.find((t) => t.type === selected.type);
  const updateData = (key: string, value: unknown) => actions.updateNodeData(selected.id, { ...(selected.data as Record<string, unknown> ?? {}), [key]: value });
  const updateStyle = (key: string, value: string) => actions.updateNodeStyles(selected.id, { ...(selected.styles as Record<string, string> ?? {}), [key]: value || undefined });

  return (
    <div className="w-[240px] h-full flex flex-col backdrop-blur-[10px] relative rounded-2xl" style={glassStyle}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[11px] font-semibold capitalize text-white">{typeConfig?.label ?? selected.type}</span>
        <div className="flex items-center gap-0.5">
          <IconButton icon={Copy} label="Duplicate" onClick={() => actions.duplicateNode(selected.id)} iconSize="h-3 w-3" />
          <IconButton icon={Trash2} label="Delete" onClick={() => actions.deleteNode(selected.id)} variant="danger" iconSize="h-3 w-3" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto editor-scroll">
        {typeConfig && typeConfig.fields.length > 0 && (
          <div className="border-b border-white/[0.06]">
            <SectionLabel>Content</SectionLabel>
            <div className="px-3 pb-3 space-y-2">
              {typeConfig.fields.map((f) => (
                <ContentField key={f.name} field={f} data={selected.data} updateData={updateData} api={api} siteId={siteId} />
              ))}
            </div>
          </div>
        )}

        {Object.entries(schema.styleGroups)
          .filter(([k]) => !typeConfig?.styleGroups || typeConfig.styleGroups.includes(k))
          .map(([k, group]) => (
            <StyleGroup key={k} group={group} styles={selected.styles} updateStyle={updateStyle} />
          ))}
      </div>
    </div>
  );
}
