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

export interface CollectionConfig {
  name: string;
  label: string;
  icon: string;
  fields: CmsFieldConfig[];
}

export interface CmsSchema {
  collections: CollectionConfig[];
}

export interface DocumentItem {
  id: string;
  collectionId: string;
  siteId: string;
  data: Record<string, unknown>;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  siteId: string;
  name: string;
  label: string;
  icon: string;
  fields: CmsFieldConfig[];
  createdAt: string;
  updatedAt: string;
}

export type ResolvedReference = Record<string, unknown> & { _id: string };
