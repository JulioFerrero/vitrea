import type { ComponentType } from "react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "url" | "number";
  options?: string[];
  rows?: number;
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
}

export interface EditorApi {
  fetch: (path: string, init?: RequestInit) => Promise<any>;
}

export interface RendererAdapter {
  PageRenderer: ComponentType<{ elements: RenderElement[]; editor?: boolean }>;
}

export interface PageItem {
  id: string;
  slug: string;
  data: { title: string; path: string; status: string; parentId?: string; order?: number; [key: string]: unknown };
}

export interface RenderElement {
  id: string;
  parentId: string | null;
  type: string;
  data: Record<string, unknown>;
  styles: Record<string, unknown>;
  order: number;
  children?: RenderElement[];
}

export type Viewport = "desktop" | "tablet" | "mobile";

export interface EditorProps {
  siteId: string;
  schema: EditorSchema;
  api: EditorApi;
  renderer: RendererAdapter;
}

export interface EditorConfig {
  database: { url: string };
  schema: EditorSchema;
  renderer?: Record<string, ComponentType<any>>;
}
