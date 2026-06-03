import type { ComponentType } from "react";
import type { CollectionConfig, StructureItem } from "@vitrea/cms";
import type { RenderElement as BaseRenderElement } from "@vitrea/render";
export type { PageElement } from "@vitrea/render";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "url" | "number" | "reference";
  options?: string[];
  rows?: number;
  collection?: string;
  multiple?: boolean;
}

export interface StyleFieldConfig {
  name: string;
  label?: string;
  type: "select" | "color" | "text";
  options?: string[];
  placeholder?: string;
}

export interface StyleGroupConfig {
  label: string;
  fields: StyleFieldConfig[];
}

export interface ElementTypeConfig {
  type: string;
  label: string;
  icon: string;
  category: string;
  isContainer: boolean;
  defaultStyles: Record<string, string>;
  defaultData: Record<string, unknown>;
  fields: FieldConfig[];
  styleGroups?: string[];
}

export interface EditorSchema {
  elementTypes: ElementTypeConfig[];
  styleGroups: Record<string, StyleGroupConfig>;
  content?: CollectionConfig[];
  structure?: StructureItem[];
}

export interface EditorApi {
  fetch: (path: string, init?: RequestInit) => Promise<unknown>;
}

export interface RendererAdapter {
  PageRenderer: ComponentType<{ content: RenderElement[]; editor?: boolean }>;
}

export interface PageItem {
  id: string;
  slug: string;
  data: { title: string; path: string; status: string; parentId?: string; order?: number; [key: string]: unknown };
  content?: RenderElement[];
  pubContent?: Record<string, unknown>;
}

export interface RenderElement extends BaseRenderElement {}

export type Viewport = "desktop" | "tablet" | "mobile";

export interface EditorProps {
  siteId: string;
  schema: EditorSchema;
  api: EditorApi;
  renderer: RendererAdapter;
}

export interface EditorAppProps {
  schema: EditorSchema;
  renderer: RendererAdapter;
  api?: EditorApi;
}

export interface EditorConfig {
  database: { url: string };
  schema: EditorSchema;
  renderer?: Record<string, ComponentType<Record<string, unknown>>>;
  content?: CollectionConfig[];
}
