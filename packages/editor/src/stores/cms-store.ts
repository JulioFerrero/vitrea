import { create } from "zustand";

interface SItem {
  type: string;
  title?: string;
  collection?: string;
  filter?: Record<string, string>;
  items?: SItem[];
}

type NavPath = number[];

export interface CmsFieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
  collection?: string;
  multiple?: boolean;
  of?: CmsFieldConfig[];
  preview?: string;
  [key: string]: unknown;
}

export interface CmsCollectionItem {
  id: string;
  siteId: string;
  name: string;
  label: string;
  icon: string;
  fields: CmsFieldConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface CmsDocumentItem {
  id: string;
  collectionId: string;
  siteId: string;
  data: Record<string, unknown>;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface CmsStoreState {
  collections: CmsCollectionItem[];
  documentsByCollection: Record<string, CmsDocumentItem[]>;
  documentCache: Map<string, CmsDocumentItem>;
  isLoading: boolean;
  selectedCollection: CmsCollectionItem | null;
  selectedDocument: CmsDocumentItem | null;
  editingDocument: CmsDocumentItem | null;
  structure: SItem[];
  structureFilter: Record<string, string> | null;
  navPath: NavPath;
}

export interface CmsStoreActions {
  setCollections: (collections: CmsCollectionItem[]) => void;
  setDocuments: (collection: string, documents: CmsDocumentItem[], filter?: Record<string, string> | null) => void;
  addDocument: (document: CmsDocumentItem) => void;
  updateDocumentLocal: (id: string, updates: { data?: Record<string, unknown>; status?: "draft" | "published" }) => void;
  removeDocument: (id: string) => void;
  selectCollection: (collection: CmsCollectionItem | null) => void;
  selectDocument: (document: CmsDocumentItem | null) => void;
  setEditingDocument: (document: CmsDocumentItem | null) => void;
  setLoading: (loading: boolean) => void;
  setStructure: (structure: SItem[]) => void;
  setStructureFilter: (filter: Record<string, string> | null) => void;
  navigate: (path: NavPath) => void;
  getDocument: (id: string) => CmsDocumentItem | undefined;
  getDocumentsByIds: (ids: string[]) => CmsDocumentItem[];
}

export type CmsStore = CmsStoreState & CmsStoreActions;

export const useCmsStore = create<CmsStore>((set, get) => ({
  collections: [],
  documentsByCollection: {},
  documentCache: new Map(),
  isLoading: false,
  selectedCollection: null,
  selectedDocument: null,
  editingDocument: null,
  structure: [],
  structureFilter: null,
  navPath: [],

  setCollections: (collections) =>
    set({ collections }),

  setDocuments: (collection, documents, filter) =>
    set((s) => {
      const cache = new Map(s.documentCache);
      for (const doc of documents) {
        cache.set(doc.id, doc);
      }
      const key = filter ? `${collection}::${JSON.stringify(filter)}` : collection;
      return {
        documentsByCollection: { ...s.documentsByCollection, [key]: documents },
        documentCache: cache,
      };
    }),

  addDocument: (document) =>
    set((s) => {
      const cache = new Map(s.documentCache);
      cache.set(document.id, document);
      const collectionName = s.collections.find((c) => c.id === document.collectionId)?.name;
      if (collectionName) {
        const existing = s.documentsByCollection[collectionName] ?? [];
        return {
          documentsByCollection: {
            ...s.documentsByCollection,
            [collectionName]: [...existing, document],
          },
          documentCache: cache,
        };
      }
      return { documentCache: cache };
    }),

  updateDocumentLocal: (id, updates) =>
    set((s) => {
      const doc = s.documentCache.get(id);
      if (!doc) return {};
      const mergedData = updates.data !== undefined
        ? { ...doc.data, ...updates.data }
        : doc.data;
      const updated = {
        ...doc,
        data: mergedData,
        ...(updates.status !== undefined ? { status: updates.status } : {}),
        updatedAt: new Date().toISOString(),
      };
      const cache = new Map(s.documentCache);
      cache.set(id, updated);

      const newDocsByCollection: Record<string, CmsDocumentItem[]> = {};
      for (const [col, docs] of Object.entries(s.documentsByCollection)) {
        newDocsByCollection[col] = docs.map((d) => (d.id === id ? updated : d));
      }

      return {
        documentsByCollection: newDocsByCollection,
        documentCache: cache,
        selectedDocument: s.selectedDocument?.id === id ? updated : s.selectedDocument,
        editingDocument: s.editingDocument?.id === id ? updated : s.editingDocument,
      };
    }),

  removeDocument: (id) =>
    set((s) => {
      const cache = new Map(s.documentCache);
      cache.delete(id);
      const doc = s.documentCache.get(id);
      if (!doc) return {};
      const newDocsByCollection: Record<string, CmsDocumentItem[]> = {};
      for (const [col, docs] of Object.entries(s.documentsByCollection)) {
        newDocsByCollection[col] = docs.filter((d) => d.id !== id);
      }
      return {
        documentsByCollection: newDocsByCollection,
        documentCache: cache,
        selectedDocument: s.selectedDocument?.id === id ? null : s.selectedDocument,
        editingDocument: s.editingDocument?.id === id ? null : s.editingDocument,
      };
    }),

  selectCollection: (collection) =>
    set({ selectedCollection: collection, selectedDocument: null, editingDocument: null }),

  selectDocument: (document) =>
    set({ selectedDocument: document, editingDocument: null }),

  setEditingDocument: (document) =>
    set({ editingDocument: document }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  getDocument: (id) =>
    get().documentCache.get(id),

  getDocumentsByIds: (ids) =>
    ids.map((id) => get().documentCache.get(id)).filter(Boolean) as CmsDocumentItem[],

  setStructure: (structure) => set({ structure }),
  setStructureFilter: (filter) => set({ structureFilter: filter }),

  navigate: (path) => set({ navPath: path }),
}));


