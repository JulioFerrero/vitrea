interface RenderElement {
  id: string;
  parentId: string | null;
  type: string;
  data: Record<string, unknown>;
  styles: Record<string, unknown>;
  order: number;
  children?: RenderElement[];
}

interface ResolveOptions {
  references: Record<string, string>;
  getDocuments: (collection: string, ids: string[]) => Promise<Record<string, unknown>[]>;
}

export async function resolveDocumentReferences(
  elements: RenderElement[],
  options: ResolveOptions,
): Promise<RenderElement[]> {
  const collectionIds = new Map<string, Set<string>>();

  for (const el of elements) {
    for (const [key, collection] of Object.entries(options.references)) {
      const value = el.data[key];
      if (!value) continue;

      let ids = Array.isArray(value) ? value.map(String) : [String(value)];
      ids = ids.filter((id) => id.length > 0);

      if (ids.length > 0) {
        if (!collectionIds.has(collection)) {
          collectionIds.set(collection, new Set());
        }
        for (const id of ids) {
          collectionIds.get(collection)!.add(id);
        }
      }
    }
  }

  const docCache = new Map<string, Record<string, unknown>>();

  for (const [collection, ids] of collectionIds) {
    const idArray = [...ids];
    if (idArray.length === 0) continue;
    const docs = await options.getDocuments(collection, idArray);
    for (const doc of docs) {
      const id = doc.id as string ?? doc._id as string;
      if (id) docCache.set(id, doc);
    }
  }

  return elements.map((el) => {
    const resolvedData = { ...el.data };

    for (const [key, _collection] of Object.entries(options.references)) {
      const value = el.data[key];
      if (!value) continue;

      if (Array.isArray(value)) {
        resolvedData[key] = value
          .map((id) => docCache.get(String(id)) ?? null)
          .filter(Boolean);
      } else {
        resolvedData[key] = docCache.get(String(value)) ?? null;
      }
    }

    return { ...el, data: resolvedData };
  });
}
