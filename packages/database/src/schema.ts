import {
  pgTable,
  jsonb,
  timestamp,
  integer,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const sites = pgTable("sites", {
  id: varchar("id", { length: 21 }).primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  data: jsonb("data").$type<SiteData>().notNull().default({} as SiteData),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pages = pgTable("pages", {
  id: varchar("id", { length: 21 }).primaryKey(),
  siteId: varchar("site_id", { length: 21 })
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 255 }).notNull(),
  data: jsonb("data").$type<PageData>().notNull().default({} as PageData),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const elements = pgTable(
  "elements",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    pageId: varchar("page_id", { length: 21 })
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    parentId: varchar("parent_id", { length: 21 }),
    type: varchar("type", { length: 100 }).notNull(),
    data: jsonb("data").$type<ElementData>().notNull().default({} as ElementData),
    styles: jsonb("styles").$type<ElementStyles>().notNull().default({} as ElementStyles),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pageIdx: index("elements_page_id_idx").on(table.pageId),
    parentIdx: index("elements_parent_id_idx").on(table.parentId),
  })
);

export const files = pgTable("files", {
  id: varchar("id", { length: 21 }).primaryKey(),
  siteId: varchar("site_id", { length: 21 })
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<FileData>().notNull().default({} as FileData),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collections = pgTable(
  "collections",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    siteId: varchar("site_id", { length: 21 })
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    icon: varchar("icon", { length: 100 }).default("folder").notNull(),
    fields: jsonb("fields").$type<CollectionField[]>().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    siteNameIdx: index("collections_site_name_idx").on(table.siteId, table.name),
  })
);

export const documents = pgTable(
  "documents",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    collectionId: varchar("collection_id", { length: 21 })
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    siteId: varchar("site_id", { length: 21 })
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    data: jsonb("data").$type<DocumentData>().notNull().default({} as DocumentData),
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    collectionIdx: index("documents_collection_id_idx").on(table.collectionId),
    siteIdx: index("documents_site_id_idx").on(table.siteId),
  })
);

export const sitesRelations = relations(sites, ({ many }) => ({
  pages: many(pages),
  files: many(files),
  collections: many(collections),
  documents: many(documents),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  site: one(sites, { fields: [pages.siteId], references: [sites.id] }),
  elements: many(elements),
}));

export const elementsRelations = relations(elements, ({ one, many }) => ({
  page: one(pages, { fields: [elements.pageId], references: [pages.id] }),
  parent: one(elements, {
    fields: [elements.parentId],
    references: [elements.id],
    relationName: "elementTree",
  }),
  children: many(elements, { relationName: "elementTree" }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  site: one(sites, { fields: [files.siteId], references: [sites.id] }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  site: one(sites, { fields: [collections.siteId], references: [sites.id] }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  collection: one(collections, {
    fields: [documents.collectionId],
    references: [collections.id],
  }),
  site: one(sites, { fields: [documents.siteId], references: [sites.id] }),
}));

export type SiteData = {
  name: string;
  domain?: string;
  settings?: {
    favicon?: string;
    primaryColor?: string;
    fontFamily?: string;
    description?: string;
  };
};

export type PageData = {
  title: string;
  path: string;
  status: "draft" | "published";
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    noIndex?: boolean;
  };
  parentId?: string;
};

export type ElementData = {
  content?: string;
  src?: string;
  alt?: string;
  href?: string;
  target?: string;
  tagName?: string;
  columns?: number;
  gap?: string;
  maxWidth?: string;
  variant?: string;
  [key: string]: unknown;
};

export type ElementStyles = {
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: string;
  verticalAlign?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  gridTemplateColumns?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  opacity?: string;
  overflow?: string;
  position?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  objectFit?: string;
  [key: string]: unknown;
};

export type FileData = {
  url: string;
  name?: string;
  type?: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type CollectionField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
  collection?: string;
  multiple?: boolean;
  of?: CollectionField[];
  [key: string]: unknown;
};

export type CollectionData = {
  name: string;
  label: string;
  icon: string;
  fields: CollectionField[];
};

export type DocumentData = {
  [key: string]: unknown;
};
