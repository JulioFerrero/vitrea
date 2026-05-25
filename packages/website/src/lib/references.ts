import type { RenderElement } from "@hi/render";
import { schema } from "../elements";
import { db, documents } from "@hi/database";
import { inArray } from "drizzle-orm";

function buildReferenceMap(): Record<string, string> {
  const refs: Record<string, string> = {};
  for (const et of schema.elementTypes) {
    for (const field of et.fields) {
      if (field.type === "reference" && field.collection) {
        refs[field.name] = field.collection;
      }
    }
  }
  return refs;
}

export async function resolvePageReferences(elements: RenderElement[]): Promise<RenderElement[]> {
  const refs = buildReferenceMap();
  const refNames = Object.keys(refs);
  if (refNames.length === 0) return elements;

  const allIds = new Set<string>();
  for (const el of elements) {
    for (const name of refNames) {
      const val = el.data[name];
      if (!val) continue;
      if (Array.isArray(val)) {
        for (const id of val) {
          if (typeof id === "string") allIds.add(id);
        }
      } else if (typeof val === "string") {
        allIds.add(val);
      }
    }
  }

  if (allIds.size === 0) return elements;

  const idArray = [...allIds];
  const docRows = await db.select().from(documents).where(inArray(documents.id, idArray));
  const docMap = new Map<string, Record<string, unknown>>();
  for (const doc of docRows) {
    docMap.set(doc.id, doc as unknown as Record<string, unknown>);
  }

  return elements.map((el) => {
    const resolvedData = { ...el.data };
    let changed = false;
    for (const name of refNames) {
      const val = resolvedData[name];
      if (!val) continue;
      if (Array.isArray(val)) {
        resolvedData[name] = (val as string[])
          .map((id: string) => docMap.get(id) ?? null)
          .filter(Boolean);
        changed = true;
      } else if (typeof val === "string") {
        const doc = docMap.get(val);
        if (doc) {
          resolvedData[name] = doc;
          changed = true;
        }
      }
    }
    return changed ? { ...el, data: resolvedData } : el;
  });
}
