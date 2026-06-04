import { createContext, useContext, useMemo } from "react";
import type { EditorSchema, EditorApi, RendererAdapter } from "../types";
import type { EditorActions } from "../lib/actions";
import { createEditorActions } from "../lib/actions";

const EditorContext = createContext<{
  siteId: string;
  schema: EditorSchema;
  api: EditorApi;
  renderer: RendererAdapter;
  actions: EditorActions;
} | null>(null);

const CmsContext = createContext<{
  api: EditorApi;
  siteId: string;
  schema: EditorSchema | null;
} | null>(null);

export function CmsProvider({
  api,
  siteId,
  schema,
  children,
}: {
  api: EditorApi;
  siteId: string;
  schema?: EditorSchema;
  children: React.ReactNode;
}) {
  return (
    <CmsContext.Provider value={{ api, siteId, schema: schema ?? null }}>
      {children}
    </CmsContext.Provider>
  );
}

export function useCmsContext() {
  const editor = useContext(EditorContext);
  const ctx = useContext(CmsContext);
  if (ctx) return ctx;
  if (editor) return { api: editor.api, siteId: "", schema: editor.schema };
  throw new Error("useCmsContext must be used within CmsProvider or EditorProvider");
}

export function EditorProvider({
  siteId,
  schema,
  api,
  renderer,
  children,
}: {
  siteId: string;
  schema: EditorSchema;
  api: EditorApi;
  renderer: RendererAdapter;
  children: React.ReactNode;
}) {
  const actions = useMemo(() => createEditorActions(api, schema), [api, schema]);

  return (
    <EditorContext.Provider value={{ siteId, schema, api, renderer, actions }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditorContext must be used within EditorProvider");
  return ctx;
}
