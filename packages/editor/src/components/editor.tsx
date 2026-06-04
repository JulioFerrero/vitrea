"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "../stores";
import { EditorProvider, useEditorContext } from "../lib/context";
import { EditorShell } from "./editor-shell";
import { useCmsSync } from "../lib/cms-sync";
import type { EditorProps } from "../types";

const initialized = new Map<string, Promise<void>>();

function ensureInit(siteId: string, actions: ReturnType<typeof import("../lib/actions").createEditorActions>) {
  if (initialized.has(siteId)) return initialized.get(siteId)!;

  const p = (async () => {
    const store = useEditorStore.getState();
    store.setActiveSite(siteId);

    const site = await actions.loadSite(siteId);
    const siteData = site as { data?: { name?: string } } | null;
    if (siteData?.data?.name) store.setActiveSiteName(siteData.data.name);

    const pages = await actions.loadPages(siteId);

    const pageId = pages[0]?.id;

    if (pageId) {
      store.setActivePage(pageId);
      await actions.loadContent(pageId);
    }
  })();

  initialized.set(siteId, p);
  return p;
}

function EditorInner({ siteId }: { siteId: string }) {
  const { actions } = useEditorContext();
  const activePageId = useEditorStore((s) => s.activePageId);
  const prevPageRef = useRef<string | null>(activePageId);
  const isDirty = useEditorStore((s) => s.isDirty);

  useCmsSync();

  useEffect(() => {
    ensureInit(siteId, actions);
  }, [siteId, actions]);

  useEffect(() => {
    if (!activePageId) return;
    if (activePageId === prevPageRef.current) return;
    prevPageRef.current = activePageId;
    actions.loadContent(activePageId);
  }, [activePageId, actions]);

  useEffect(() => {
    if (isDirty) {
      actions.scheduleAutoSave();
    }
  }, [isDirty, actions]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        const s = useEditorStore.getState();
        if (s.isDirty) {
          actions.saveAll();
        }
      }
    }
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [actions]);

  return <EditorShell />;
}

export function Editor({ siteId, schema, api, renderer }: EditorProps) {
  return (
    <EditorProvider siteId={siteId} schema={schema} api={api} renderer={renderer}>
      <EditorInner siteId={siteId} />
    </EditorProvider>
  );
}
