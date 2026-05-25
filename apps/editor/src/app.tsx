import { useState, useEffect } from "react";
import { createApiFetch, Dashboard, Editor, CmsView, CmsProvider } from "@hi/editor";
import { schema, websiteRenderer } from "@hi/website";

const api = createApiFetch();

type View = "dashboard" | "editor" | "content";

function parsePath(): { view: View; siteId: string | null } {
  const segments = globalThis.location.pathname.split("/").filter(Boolean);
  if (segments[0] === "content") {
    return { view: "content", siteId: segments[1] ?? null };
  }
  return { view: segments[0] ? "editor" : "dashboard", siteId: segments[0] || null };
}

export function App() {
  const [{ view, siteId }, setRoute] = useState(parsePath);

  useEffect(() => {
    function onPopState() {
      setRoute(parsePath());
    }
    globalThis.addEventListener("popstate", onPopState);
    return () => globalThis.removeEventListener("popstate", onPopState);
  }, []);

  function navigateToSite(id: string) {
    globalThis.history.pushState({}, "", `/${id}`);
    setRoute({ view: "editor", siteId: id });
  }

  function navigateToEditor() {
    if (siteId) {
      globalThis.history.pushState({}, "", `/${siteId}`);
      setRoute({ view: "editor", siteId });
    }
  }

  if (view === "content" && siteId) {
    return (
      <CmsProvider api={api} siteId={siteId} schema={schema}>
        <CmsView siteId={siteId} onBack={navigateToEditor} />
      </CmsProvider>
    );
  }

  if (view === "editor" && siteId) {
    return <Editor siteId={siteId} schema={schema} api={api} renderer={websiteRenderer} />;
  }

  return <Dashboard api={api} onSelectSite={navigateToSite} />;
}
