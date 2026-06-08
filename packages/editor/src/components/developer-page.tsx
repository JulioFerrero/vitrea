"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Braces, RefreshCcw, Save } from "lucide-react";
import { Button } from "@vitrea/ui/button";
import { createApiFetch } from "../lib/api";
import { navigate } from "../lib/navigate";
import { useEditorStore } from "../stores";
import type { PageElement, PageItem } from "../types";

const api = createApiFetch();

type PageRecord = PageItem & {
  siteId: string;
  createdAt?: string;
  updatedAt?: string;
};

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function parseJson(value: string, label: string): PageElement[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    throw new TypeError(`${label}: ${message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new TypeError(`${label}: expected a JSON array`);
  }

  return parsed as PageElement[];
}

export function DeveloperPage({ siteId }: Readonly<{ siteId: string }>) {
  const storeActivePageId = useEditorStore((s) => s.activePageId);
  const setActiveSite = useEditorStore((s) => s.setActiveSite);
  const setActivePage = useEditorStore((s) => s.setActivePage);
  const setPages = useEditorStore((s) => s.setPages);
  const setContent = useEditorStore((s) => s.setContent);
  const setDirty = useEditorStore((s) => s.setDirty);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const setHasActiveDraft = useEditorStore((s) => s.setHasActiveDraft);

  const [pageList, setPageList] = useState<PageItem[]>([]);
  const [pageId, setPageId] = useState<string>("");
  const [page, setPage] = useState<PageRecord | null>(null);
  const [draftJson, setDraftJson] = useState("[]");
  const [publishedJson, setPublishedJson] = useState("[]");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedPage = useMemo(() => pageList.find((entry) => entry.id === pageId) ?? null, [pageId, pageList]);

  const loadPages = useCallback(async (preferredPageId?: string) => {
    const result = await api.fetch(`/pages?siteId=${encodeURIComponent(siteId)}`) as PageItem[];
    setPageList(result);
    setPages(result);

    const resolvedPageId = preferredPageId && result.some((entry) => entry.id === preferredPageId)
      ? preferredPageId
      : result[0]?.id ?? "";

    setPageId((current) => current || resolvedPageId);
    return resolvedPageId;
  }, [setPages, siteId]);

  const loadPage = useCallback(async (nextPageId: string) => {
    if (!nextPageId) {
      setPage(null);
      setDraftJson("[]");
      setPublishedJson("[]");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.fetch(`/pages/${nextPageId}`) as PageRecord;
      setPage(result);
      setDraftJson(formatJson(result.content ?? []));
      setPublishedJson(formatJson(result.pubContent ?? []));
      setActivePage(nextPageId);
    } catch (fetchError) {
      const messageText = fetchError instanceof Error ? fetchError.message : "Failed to load page";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }, [setActivePage]);

  useEffect(() => {
    setActiveSite(siteId);
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        const resolvedPageId = await loadPages(storeActivePageId ?? undefined);
        if (!cancelled) {
          await loadPage(resolvedPageId);
        }
      } catch (fetchError) {
        if (!cancelled) {
          const messageText = fetchError instanceof Error ? fetchError.message : "Failed to load developer data";
          setError(messageText);
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [loadPage, loadPages, setActiveSite, siteId, storeActivePageId]);

  async function handleReload() {
    const resolvedPageId = await loadPages(pageId);
    await loadPage(resolvedPageId);
  }

  async function handleSave() {
    if (!pageId) {
      setError("Select a page first");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const nextDraft = parseJson(draftJson, "Draft JSON");
      const nextPublished = parseJson(publishedJson, "Published JSON");

      await api.fetch(`/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          content: nextDraft,
          pubContent: nextPublished,
        }),
      });

      setContent(nextDraft);
      setDirty(false);
      setSaveStatus("saved");
      setHasActiveDraft(JSON.stringify(nextDraft) !== JSON.stringify(nextPublished));
      setDraftJson(formatJson(nextDraft));
      setPublishedJson(formatJson(nextPublished));
      setMessage("Saved page JSON");
      await loadPages(pageId);
      await loadPage(pageId);
    } catch (saveError) {
      const messageText = saveError instanceof Error ? saveError.message : "Failed to save JSON";
      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  function handleFormat() {
    try {
      const nextDraft = parseJson(draftJson, "Draft JSON");
      const nextPublished = parseJson(publishedJson, "Published JSON");
      setDraftJson(formatJson(nextDraft));
      setPublishedJson(formatJson(nextPublished));
      setError("");
    } catch (formatError) {
      const messageText = formatError instanceof Error ? formatError.message : "Invalid JSON";
      setError(messageText);
    }
  }

  return (
    <div className="min-h-screen bg-[#08080A] text-white">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#08080A]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            type="button"
            onClick={() => navigate(siteId ? `/${siteId}` : "/")}
            className="inline-flex items-center gap-1.5 text-sm text-white/72 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to editor
          </button>
          <div className="h-5 w-px bg-white/[0.08]" />
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08]">
              <Braces className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-tight text-white">Developer Mode</h1>
              <p className="truncate text-xs text-white/45">Inspect and edit the current page JSON directly from the database.</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void handleReload()} disabled={loading || saving}>
              <RefreshCcw className="mr-1.5 h-4 w-4" />
              Reload
            </Button>
            <Button type="button" size="sm" onClick={() => void handleSave()} disabled={loading || saving || !pageId}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? "Saving..." : "Save JSON"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        <section className="grid gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Site</p>
              <p className="mt-2 text-sm text-white/84">{siteId}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Page</p>
              <p className="mt-2 text-sm text-white/84">{selectedPage?.data.title ?? selectedPage?.slug ?? "No page selected"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Slug</p>
              <p className="mt-2 text-sm text-white/84">{selectedPage?.slug ?? "-"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Status</p>
              <p className="mt-2 text-sm text-white/84">{selectedPage?.data.status ?? "-"}</p>
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/32">Current page</span>
            <select
              value={pageId}
              onChange={(event) => {
                const nextPageId = event.target.value;
                setPageId(nextPageId);
                void loadPage(nextPageId);
              }}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#0d0d11] px-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/40"
            >
              {pageList.length === 0 ? <option value="">No pages found</option> : null}
              {pageList.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.data.title ?? entry.slug}
                </option>
              ))}
            </select>
          </label>
        </section>

        {message ? (
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] px-4 py-3 text-sm text-emerald-300/85">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.05] px-4 py-3 text-sm text-red-300/85">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Draft JSON</h2>
                <p className="mt-1 text-xs text-white/45">Writes to the page `content` field used by the editor draft.</p>
              </div>
              <button
                type="button"
                onClick={handleFormat}
                className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Format
              </button>
            </div>
            <textarea
              value={draftJson}
              onChange={(event) => setDraftJson(event.target.value)}
              spellCheck={false}
              className="min-h-[520px] w-full resize-y border-0 bg-transparent px-5 py-4 font-mono text-[13px] leading-6 text-white/88 outline-none"
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Published JSON</h2>
                <p className="mt-1 text-xs text-white/45">Writes to the page `pubContent` field served by the published website.</p>
              </div>
              <button
                type="button"
                onClick={handleFormat}
                className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Format
              </button>
            </div>
            <textarea
              value={publishedJson}
              onChange={(event) => setPublishedJson(event.target.value)}
              spellCheck={false}
              className="min-h-[520px] w-full resize-y border-0 bg-transparent px-5 py-4 font-mono text-[13px] leading-6 text-white/88 outline-none"
            />
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/55">
            Loading page JSON...
          </div>
        ) : null}

        {page ? (
          <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold text-white">Current record snapshot</h2>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0d0d11] p-4 text-xs leading-6 text-white/70">
              {formatJson({
                id: page.id,
                slug: page.slug,
                data: page.data,
                updatedAt: page.updatedAt,
              })}
            </pre>
          </section>
        ) : null}
      </main>
    </div>
  );
}
