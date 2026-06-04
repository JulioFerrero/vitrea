import {
  pgTable,
  jsonb,
  timestamp,
  varchar,
  boolean,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role"),
  cursorColor: text("cursor_color"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("session_user_id_idx").on(table.userId),
}));

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("account_user_id_idx").on(table.userId),
}));

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sites = pgTable("sites", {
  id: varchar("id", { length: 21 }).primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  data: jsonb("data").$type<SiteData>().notNull().default({} as SiteData),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteMembers = pgTable("site_members", {
  id: varchar("id", { length: 21 }).primaryKey(),
  siteId: varchar("site_id", { length: 21 })
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  siteUserIdx: index("site_members_site_user_idx").on(table.siteId, table.userId),
  userIdx: index("site_members_user_id_idx").on(table.userId),
}));

export const pages = pgTable("pages", {
  id: varchar("id", { length: 21 }).primaryKey(),
  siteId: varchar("site_id", { length: 21 })
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 255 }).notNull(),
  data: jsonb("data").$type<PageData>().notNull().default({} as PageData),
  content: jsonb("content").$type<PageContent[]>().notNull().default([]),
  pubContent: jsonb("pub_content").$type<PageContent[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: varchar("id", { length: 21 }).primaryKey(),
  siteId: varchar("site_id", { length: 21 })
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<FileData>().notNull().default({} as FileData),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const revisions = pgTable(
  "revisions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    pageId: varchar("page_id", { length: 21 })
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 255 }),
    snapshot: jsonb("snapshot").$type<RevisionSnapshot>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pageIdx: index("revisions_page_id_idx").on(table.pageId),
  })
);

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
  members: many(siteMembers),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  site: one(sites, { fields: [pages.siteId], references: [sites.id] }),
  revisions: many(revisions),
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

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  siteMemberships: many(siteMembers),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const siteMembersRelations = relations(siteMembers, ({ one }) => ({
  site: one(sites, { fields: [siteMembers.siteId], references: [sites.id] }),
  user: one(user, { fields: [siteMembers.userId], references: [user.id] }),
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

export type PageContent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  styles: Record<string, string>;
  children: PageContent[];
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

export type RevisionSnapshot = {
  content: PageContent[];
  page: PageData;
};

export type DocumentData = {
  [key: string]: unknown;
};
