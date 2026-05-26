import { useEditorStore } from "../stores";
import type { EditorApi } from "../types";

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

export function createSaveActions(api: EditorApi) {
  const store = useEditorStore;

  async function persistDirty() {
    const state = store.getState();
    if (!state.activePageId) return;

    const pageId = state.activePageId;
    try {
      await api.fetch(`/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify({ content: state.content }),
      });
    } catch { /* ignore */ }

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
    store.setState({ dirtyPageIds: new Set() });
  }

  async function withSave(fn: () => Promise<void>) {
    const state = store.getState();
    if (!state.isDirty) return;
    store.getState().setSaveStatus("saving");
    try {
      if (autoSaveTimer) { clearTimeout(autoSaveTimer); autoSaveTimer = null; }
      await persistDirty();
      await fn();
      store.getState().setSaveStatus("saved");
    } catch {
      store.getState().setSaveStatus("idle");
    }
  }

  return {
    saveAll() {
      return withSave(async () => {
        store.getState().setHasActiveDraft(true);
      });
    },

    scheduleAutoSave() {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        if (store.getState().isDirty) persistDirty();
      }, 250);
    },

    async publishPage() {
      const state = store.getState();
      if (!state.activePageId) return;
      store.getState().setSaveStatus("saving");
      try {
        if (autoSaveTimer) { clearTimeout(autoSaveTimer); autoSaveTimer = null; }
        await persistDirty();
        await api.fetch(`/pages/${state.activePageId}/publish`, { method: "POST" });
        store.getState().setHasActiveDraft(false);
        store.getState().setSaveStatus("saved");
      } catch {
        store.getState().setSaveStatus("idle");
      }
    },

    async discardDraft() {
      const state = store.getState();
      if (!state.activePageId) return;
      await api.fetch(`/pages/${state.activePageId}/discard-draft`, { method: "POST" });
      store.getState().setHasActiveDraft(false);
    },

    getDiff(pageId: string) {
      return api.fetch(`/pages/${pageId}/diff`);
    },

    getRevisions(pageId: string) {
      return api.fetch(`/pages/${pageId}/revisions`);
    },

    getRevision(pageId: string, revId: string) {
      return api.fetch(`/pages/${pageId}/revisions/${revId}`);
    },

    async restoreRevision(pageId: string, revId: string) {
      return api.fetch(`/pages/${pageId}/revisions/${revId}/restore`, { method: "POST" });
    },
  };
}
