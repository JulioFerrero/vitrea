import { useEditorStore } from "../stores";
import type { EditorApi, EditorSchema, RenderElement, PageItem } from "../types";

function derivePath(slug: string, parentId: string | undefined, pages: PageItem[]): string {
  if (!parentId) return "/" + slug;
  const parent = pages.find((p) => p.id === parentId);
  if (!parent) return "/" + slug;
  return parent.data.path.replace(/\/$/, "") + "/" + slug;
}

export function createEditorActions(api: EditorApi, schema: EditorSchema) {
  const store = useEditorStore;

  function getTypeConfig(type: string) {
    return schema.elementTypes.find((t) => t.type === type);
  }

  return {
    async loadSites() {
      return api.fetch("/sites");
    },

    async createSite(name: string, slug: string) {
      return api.fetch("/sites", {
        method: "POST",
        body: JSON.stringify({ slug, data: { name } }),
      });
    },

    async loadPages(siteId: string) {
      const pages = (await api.fetch(`/pages?siteId=${siteId}`)) as PageItem[];
      store.getState().setPages(pages);
      return pages;
    },

    async createPage(siteId: string, title: string, slug: string, parentId?: string) {
      let resolvedParentId = parentId;
      if (!resolvedParentId) {
        const existing = store.getState().pages;
        const root = existing.find((p) => p.data.path === "/");
        if (root) resolvedParentId = root.id;
      }
      const path = `/${slug}`;
      const page = await api.fetch("/pages", {
        method: "POST",
        body: JSON.stringify({ siteId, slug, data: { title, path, status: "draft", parentId: resolvedParentId } }),
      });
      await this.loadPages(siteId);
      return page;
    },

    async deletePage(id: string) {
      await api.fetch(`/pages/${id}`, { method: "DELETE" });
      const state = store.getState();
      if (state.activePageId === id) {
        const remaining = state.pages.filter((p) => p.id !== id);
        const next = remaining.length > 0 ? remaining[0]!.id : null;
        if (next) store.getState().setActivePage(next);
        else store.getState().setActiveSite(store.getState().activeSiteId!);
      }
      const siteId = state.activeSiteId;
      if (siteId) await this.loadPages(siteId);
    },

    async loadElements(pageId: string) {
      store.getState().setLoading(true);
      const elements = (await api.fetch(`/elements?pageId=${pageId}`)) as RenderElement[];
      store.getState().setElements(elements);
      store.getState().setLoading(false);
      return elements;
    },

    async addElement(pageId: string, type: string, parentId?: string | null) {
      const elements = store.getState().elements;
      const siblings = parentId
        ? elements.filter((e) => e.parentId === parentId)
        : elements.filter((e) => !e.parentId);
      const maxOrder = siblings.reduce((max, e) => Math.max(max, e.order), -1);
      const config = getTypeConfig(type);

      const element = (await api.fetch("/elements", {
        method: "POST",
        body: JSON.stringify({
          pageId,
          type,
          parentId: parentId ?? null,
          data: config?.defaultData ?? {},
          styles: config?.defaultStyles ?? {},
          order: maxOrder + 1,
        }),
      })) as RenderElement;

      store.setState((s) => ({
        elements: [...s.elements, element],
        dirtyElementIds: new Set([...s.dirtyElementIds, element.id]),
        isDirty: true,
        selectedElementId: element.id,
      }));
      return element;
    },

    updateElementData(id: string, data: Record<string, unknown>) {
      store.getState().updateElement(id, { data: data as any });
    },

    updateElementStyles(id: string, styles: Record<string, unknown>) {
      store.getState().updateElement(id, { styles: styles as any });
    },

    async deleteElement(id: string) {
      await api.fetch(`/elements/${id}`, { method: "DELETE" });
      store.getState().removeElement(id);
    },

    async duplicateElement(id: string) {
      const state = store.getState();
      const el = state.elements.find((e) => e.id === id);
      if (!el) return;
      const siblings = el.parentId
        ? state.elements.filter((e) => e.parentId === el.parentId)
        : state.elements.filter((e) => !e.parentId);
      const maxOrder = siblings.reduce((max, e) => Math.max(max, e.order), -1);
      const pageId = state.activePageId!;

      const allClones: RenderElement[] = [];

      async function cloneTree(elementId: string, newParentId: string | null, isRoot: boolean): Promise<void> {
        const src = state.elements.find((e) => e.id === elementId);
        if (!src) return;
        const created = (await api.fetch("/elements", {
          method: "POST",
          body: JSON.stringify({
            pageId,
            type: src.type,
            parentId: newParentId,
            data: { ...src.data },
            styles: { ...src.styles },
            order: isRoot ? maxOrder + 1 : src.order,
          }),
        })) as RenderElement;
        allClones.push(created);
        const children = state.elements.filter((e) => e.parentId === src.id);
        for (const child of children) {
          await cloneTree(child.id, created.id, false);
        }
      }

      await cloneTree(id, el.parentId ?? null, true);
      store.setState((s) => ({
        elements: [...s.elements, ...allClones],
        dirtyElementIds: new Set([...s.dirtyElementIds, ...allClones.map((e) => e.id)]),
        isDirty: true,
        selectedElementId: allClones[0]?.id ?? s.selectedElementId,
      }));
      return allClones;
    },

    async saveAll() {
      const state = store.getState();
      store.getState().setSaveStatus("saving");
      try {
        for (const id of state.dirtyElementIds) {
          const el = state.elements.find((e) => e.id === id);
          if (el) {
            await api.fetch(`/elements/${el.id}`, {
              method: "PATCH",
              body: JSON.stringify({ data: el.data, styles: el.styles, order: el.order }),
            });
          }
        }
        for (const pageId of state.dirtyPageIds) {
          const page = state.pages.find((p) => p.id === pageId);
          if (page) {
            await api.fetch(`/pages/${pageId}`, {
              method: "PATCH",
              body: JSON.stringify({ slug: page.slug, data: page.data }),
            });
          }
        }
        store.getState().setDirty(false);
        store.setState({ dirtyPageIds: new Set(), dirtyElementIds: new Set() });
        store.getState().setSaveStatus("saved");
      } catch {
        store.getState().setSaveStatus("idle");
      }
    },
  };
}

export type EditorActions = ReturnType<typeof createEditorActions>;
