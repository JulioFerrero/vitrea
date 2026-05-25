export type StructureItem =
  | StructureCollection
  | StructureList
  | StructureDivider;

export interface StructureCollection {
  type: "collection";
  collection: string;
  title?: string;
  filter?: Record<string, string>;
}

export interface StructureList {
  type: "list";
  title: string;
  icon?: string;
  items: StructureItem[];
}

export interface StructureDivider {
  type: "divider";
}

interface Builder {
  title(t: string): this;
  filter(field: string, value: string): this;
  icon(i: string): this;
  items(children: (StructureItem | CollectionBuilder | ListBuilder | StructureDivider)[]): this;
}

interface CollectionBuilder extends Builder {
  type: "collection";
  collection: string;
}

interface ListBuilder extends Builder {
  type: "list";
  _items: StructureItem[];
}

type StructureContext = {
  collection: (name: string) => CollectionBuilder;
  list: () => ListBuilder;
  divider: () => StructureDivider;
};

const S: StructureContext = {
  collection(name: string): CollectionBuilder {
    const cfg: Record<string, unknown> = {};
    const self = {
      type: "collection" as const,
      collection: name,
      title(t: string) {
        cfg.title = t;
        return self;
      },
      filter(field: string, value: string) {
        cfg.filter = { ...(cfg.filter as Record<string, string> ?? {}), [field]: value };
        return self;
      },
      icon() { return self; },
      items() { return self; },
      _cfg: cfg,
    };
    return self as unknown as CollectionBuilder;
  },

  list(): ListBuilder {
    const self = {
      type: "list" as const,
      _title: "",
      _items: [] as StructureItem[],
      title(t: string) {
        self._title = t;
        return self;
      },
      filter() { return self; },
      icon() { return self; },
      items(children: (StructureItem | CollectionBuilder | ListBuilder | StructureDivider)[]) {
        self._items = children as unknown as StructureItem[];
        return self;
      },
    };
    return self as unknown as ListBuilder;
  },

  divider(): StructureDivider {
    return { type: "divider" };
  },
};

function resolve(item: unknown): StructureItem {
  if (!item || typeof item !== "object") return item as StructureItem;
  const obj = item as Record<string, unknown>;

  if (obj.type === "collection") {
    const cfg = (obj._cfg as Record<string, unknown>) ?? {};
    return {
      type: "collection",
      collection: obj.collection as string,
      title: (cfg.title as string) ?? undefined,
      filter: (cfg.filter as Record<string, string>) ?? undefined,
    };
  }

  if (obj.type === "list") {
    return {
      type: "list",
      title: ((obj._title ?? "") as string),
      items: ((obj._items ?? []) as unknown[]).map(resolve) as StructureItem[],
    };
  }

  return item as StructureItem;
}

export function defineStructure(
  fn: (S: StructureContext) => (StructureItem | CollectionBuilder | ListBuilder)[],
): StructureItem[] {
  const raw = fn(S);
  return raw.map(resolve);
}

export { S };
