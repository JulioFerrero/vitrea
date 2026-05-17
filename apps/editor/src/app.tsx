import { useState, useEffect } from "react";
import { createApiFetch, Dashboard, Editor } from "@hi/editor";
import { schema, websiteRenderer } from "@hi/website";

const api = createApiFetch();

export function App() {
  const [siteId, setSiteId] = useState(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    return segments[0] || null;
  });

  useEffect(() => {
    function onPopState() {
      const segments = window.location.pathname.split("/").filter(Boolean);
      setSiteId(segments[0] || null);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigateToSite(id: string) {
    window.history.pushState({}, "", `/${id}`);
    setSiteId(id);
  }

  if (!siteId) {
    return <Dashboard api={api} onSelectSite={navigateToSite} />;
  }

  return <Editor siteId={siteId} schema={schema} api={api} renderer={websiteRenderer} />;
}
