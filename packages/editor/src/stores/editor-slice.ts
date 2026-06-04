import type { StateCreator } from "zustand";
import type { PageItem, Viewport, PageElement } from "../types";
import type { HistoryEntry } from "./history";
import { computeUndo, computeRedo, canUndo, canRedo } from "./history";
import { insertChild, removeById, updateById, moveNode, duplicateNode, cloneTree, findById } from "@vitrea/render";

export type SaveStatus = "idle" | "saving" | "saved";

export interface EditorState {
  activeSiteId: string | null;
  activeSiteName: string | null;
  activePageId: string | null;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  viewport: Viewport;
  pages: PageItem[];
  dirtyPageIds: Set<string>;
  content: PageElement[];
  isDirty: boolean;
  hasActiveDraft: boolean;
  isLoading: boolean;
  saveStatus: SaveStatus;
  _history: HistoryEntry[];
  _historyIndex: number;
}

export interface EditorActions {
  setActiveSite: (id: string) => void;
  setActiveSiteName: (name: string | null) => void;
  setActivePage: (id: string) => void;
  setViewport: (viewport: Viewport) => void;
  setPages: (pages: PageItem[]) => void;
  updatePageLocal: (id: string, updates: { data?: Record<string, unknown>; slug?: string }) => void;
  setContent: (content: PageElement[]) => void;
  selectElement: (id: string | null) => void;
  setHoveredElement: (id: string | null) => void;
  updateNode: (id: string, patch: { data?: Record<string, unknown>; styles?: Record<string, string>; type?: string }) => void;
  addChild: (parentId: string | null, element: PageElement, index?: number) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  moveNodeUp: (id: string) => void;
  moveNodeDown: (id: string) => void;
  moveNodeTo: (id: string, newParentId: string | null, index: number) => void;
  pushHistory: () => void;
  setDirty: (dirty: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setHasActiveDraft: (hasDraft: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  applyRemoteUpdate: (id: string, patch: { data?: Record<string, unknown>; styles?: Record<string, string> }) => void;
}

export type EditorStore = EditorState & EditorActions;

export const createEditorSlice: StateCreator<EditorStore> = (set, get) => ({
  activeSiteId: null,
  activeSiteName: null,
  activePageId: null,
  selectedElementId: null,
  hoveredElementId: null,
  viewport: "desktop" as Viewport,
  pages: [],
  dirtyPageIds: new Set<string>(),
  content: [],
  isDirty: false,
  hasActiveDraft: false,
  isLoading: false,
  saveStatus: "idle" as SaveStatus,
  _history: [],
  _historyIndex: -1,

  setActiveSite: (id) => set({ activeSiteId: id, activeSiteName: null, activePageId: null, selectedElementId: null, _history: [], _historyIndex: -1 }),
  setActiveSiteName: (name) => set({ activeSiteName: name }),
  setActivePage: (id) => set({ activePageId: id, selectedElementId: null }),
  setViewport: (viewport) => set({ viewport }),
  setPages: (pages) => set({ pages, dirtyPageIds: new Set() }),
  updatePageLocal: (id, updates) =>
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === id
          ? {
              ...p,
              ...(updates.slug !== undefined ? { slug: updates.slug } : {}),
              data: updates.data ? { ...p.data, ...updates.data } as PageItem["data"] : p.data,
            }
          : p
      ),
      dirtyPageIds: new Set([...s.dirtyPageIds, id]),
      isDirty: true,
    })),
  setContent: (content) => set({ content, isDirty: false, hasActiveDraft: false }),
  selectElement: (id) => set({ selectedElementId: id }),
  setHoveredElement: (id) => set({ hoveredElementId: id }),
  pushHistory: () => set((s) => {
    const entry: HistoryEntry = {
      content: cloneTree(s.content),
      pages: s.pages,
      selectedElementId: s.selectedElementId,
    };
    const history = s._history.slice(0, s._historyIndex + 1);
    history.push(entry);
    if (history.length > 50) history.shift();
    return { _history: history, _historyIndex: history.length - 1 };
  }),
  updateNode: (id, patch) =>
    set((s) => {
      const clone = cloneTree(s.content);
      updateById(clone, id, patch);
      return { content: clone, isDirty: true, hasActiveDraft: true };
    }),
  addChild: (parentId, element, index) =>
    set((s) => {
      const clone = cloneTree(s.content);
      if (parentId) {
        insertChild(clone, parentId, element, index);
      } else {
        if (index !== undefined && index >= 0 && index <= clone.length) {
          clone.splice(index, 0, element);
        } else {
          clone.push(element);
        }
      }
      return { content: clone, isDirty: true, hasActiveDraft: true };
    }),
  removeNode: (id) =>
    set((s) => {
      const clone = cloneTree(s.content);
      removeById(clone, id);
      return {
        content: clone,
        selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
        isDirty: true,
        hasActiveDraft: true,
      };
    }),
  duplicateNode: (id) =>
    set((s) => {
      const clone = cloneTree(s.content);
      const result = findById(clone, id);
      if (result) {
        const dup = duplicateNode(clone, id, crypto.randomUUID());
        if (dup) return { content: clone, selectedElementId: dup.id, isDirty: true, hasActiveDraft: true };
      }
      return { content: clone, isDirty: true, hasActiveDraft: true };
    }),
  moveNodeUp: (id) =>
    set((s) => {
      const clone = cloneTree(s.content);
      const result = findById(clone, id);
      if (result && result.index > 0) {
        const parentChildren = result.parent ? result.parent.children : clone;
        const el = parentChildren.splice(result.index, 1)[0];
        parentChildren.splice(result.index - 1, 0, el);
      }
      return { content: clone, isDirty: true, hasActiveDraft: true };
    }),
  moveNodeDown: (id) =>
    set((s) => {
      const clone = cloneTree(s.content);
      const result = findById(clone, id);
      if (!result) {
        return { content: clone, isDirty: true, hasActiveDraft: true };
      }
      const parentChildren = result.parent ? result.parent.children : clone;
      if (result && result.index < parentChildren.length - 1) {
        const el = parentChildren.splice(result.index, 1)[0];
        parentChildren.splice(result.index + 1, 0, el);
      }
      return { content: clone, isDirty: true, hasActiveDraft: true };
    }),
  moveNodeTo: (id, newParentId, index) =>
    set((s) => {
      const clone = cloneTree(s.content);
      moveNode(clone, id, newParentId, index);
      return { content: clone, isDirty: true, hasActiveDraft: true };
    }),
  applyRemoteUpdate: (id, patch) =>
    set((s) => {
      const clone = cloneTree(s.content);
      updateById(clone, id, patch);
      return { content: clone, isDirty: true, hasActiveDraft: true };
    }),
  setDirty: (dirty) => set((s) => ({ isDirty: dirty, saveStatus: dirty ? "idle" : s.saveStatus })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setHasActiveDraft: (hasDraft) => set({ hasActiveDraft: hasDraft }),
  undo: () => set((s) => computeUndo(s) ?? {}),
  redo: () => set((s) => computeRedo(s) ?? {}),
  canUndo: () => canUndo(get()),
  canRedo: () => canRedo(get()),
});
