import { useCmsStore, type CmsCollectionItem, type CmsDocumentItem } from "../stores/cms-store";
import type { EditorApi, EditorSchema } from "../types";

export function createCmsActions(api: EditorApi) {
  const store = useCmsStore;

  return {
    async loadCollections(siteId: string) {
      store.getState().setLoading(true);
      const cols = (await api.fetch(`/collections?siteId=${siteId}`)) as CmsCollectionItem[];
      store.getState().setCollections(cols);
      store.getState().setLoading(false);
      return cols;
    },

    async seedCollections(siteId: string, schema: EditorSchema) {
      const content = schema.content;
      if (!content || content.length === 0) return;

      const existing = await api.fetch(`/collections?siteId=${siteId}`) as CmsCollectionItem[];

      for (const col of content) {
        const match = existing.find((c) => c.name === col.name);

        if (match) {
          const needsUpdate = match.label !== col.label ||
            JSON.stringify(match.fields) !== JSON.stringify(col.fields);
          if (needsUpdate) {
            await api.fetch(`/collections/${match.id}`, {
              method: "PATCH",
              body: JSON.stringify({
                label: col.label,
                icon: col.icon,
                fields: col.fields,
              }),
            });
          }
        } else {
          await api.fetch("/collections", {
            method: "POST",
            body: JSON.stringify({
              siteId,
              name: col.name,
              label: col.label,
              icon: col.icon,
              fields: col.fields,
            }),
          });
        }
      }

      const updated = await api.fetch(`/collections?siteId=${siteId}`) as CmsCollectionItem[];
      store.getState().setCollections(updated);
    },

    async loadDocuments(collectionId: string, collectionName: string | null, filter?: Record<string, string>, selectFields?: string[]) {
      store.getState().setLoading(true);
      const queryParts = [`collectionId=${collectionId}`];
      if (filter) {
        for (const [k, v] of Object.entries(filter)) {
          queryParts.push(`filter[${k}]=${encodeURIComponent(v)}`);
        }
      }
      if (selectFields && selectFields.length > 0) {
        queryParts.push(`select=${selectFields.join(",")}`);
      }
      const url = `/documents?${queryParts.join("&")}`;
      const docs = (await api.fetch(url)) as CmsDocumentItem[];
      if (collectionName) {
        store.getState().setDocuments(collectionName, docs, filter ?? null);
      }
      store.getState().setLoading(false);
      return docs;
    },

    async createDocument(
      collectionId: string,
      siteId: string,
      data: Record<string, unknown>,
    ): Promise<CmsDocumentItem> {
      const doc = (await api.fetch("/documents", {
        method: "POST",
        body: JSON.stringify({ collectionId, siteId, data }),
      })) as CmsDocumentItem;
      store.getState().addDocument(doc);
      return doc;
    },

    async updateDocument(id: string, updates: { data?: Record<string, unknown>; status?: "draft" | "published" }) {
      await api.fetch(`/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      store.getState().updateDocumentLocal(id, updates);
    },

    async deleteDocument(id: string) {
      await api.fetch(`/documents/${id}`, { method: "DELETE" });
      store.getState().removeDocument(id);
    },

    async loadDocumentsByIds(ids: string[]): Promise<CmsDocumentItem[]> {
      const docs = (await api.fetch("/documents/batch", {
        method: "POST",
        body: JSON.stringify({ ids }),
      })) as CmsDocumentItem[];
      for (const doc of docs) {
        store.getState().addDocument(doc);
      }
      return docs;
    },

    async loadFullDocument(id: string): Promise<CmsDocumentItem> {
      const doc = (await api.fetch(`/documents/${id}`)) as CmsDocumentItem;
      store.getState().addDocument(doc);
      return doc;
    },
  };
}

export type CmsActions = ReturnType<typeof createCmsActions>;
