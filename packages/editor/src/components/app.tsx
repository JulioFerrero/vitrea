"use client";

import { createElement, useSyncExternalStore } from "react";
import { AuthGate } from "./auth-gate";
import { Dashboard } from "./dashboard";
import { Editor } from "./editor";
import { CmsView } from "./cms/cms-view";
import { UsersPage } from "./users-page";
import { AccountPage } from "./account-page";
import { AssetsPage } from "./assets-page";
import { SiteSettingsPage } from "./site-settings-page";
import { DeveloperPage } from "./developer-page";
import { createApiFetch } from "../lib/api";
import { navigate } from "../lib/navigate";
import type { EditorAppProps } from "../types";

type View = "dashboard" | "editor" | "content" | "users" | "account" | "assets" | "settings" | "developer";

type RouteSnapshot = { view: View; siteId: string | null };

let cachedPathname: string | null = null;
let cachedSnapshot: RouteSnapshot | null = null;

function parsePath(pathname: string): RouteSnapshot {
  const seg = pathname.split("/").filter(Boolean);
  if (seg[0] === "admin" && seg[1] === "users") return { view: "users", siteId: null };
  if (seg[0] === "account") return { view: "account", siteId: null };
  if (seg.length >= 2 && seg[1] === "assets") return { view: "assets", siteId: seg[0] ?? null };
  if (seg.length >= 2 && seg[1] === "content") return { view: "content", siteId: seg[0] ?? null };
  if (seg.length >= 2 && seg[1] === "settings") return { view: "settings", siteId: seg[0] ?? null };
  if (seg.length >= 2 && seg[1] === "developer") return { view: "developer", siteId: seg[0] ?? null };
  return { view: seg[0] ? "editor" : "dashboard", siteId: seg[0] ?? null };
}

function subscribe(onStoreChange: () => void) {
  globalThis.addEventListener("popstate", onStoreChange);
  return () => globalThis.removeEventListener("popstate", onStoreChange);
}

function getSnapshot() {
  const pathname = globalThis.location.pathname;
  if (pathname === cachedPathname && cachedSnapshot) {
    return cachedSnapshot;
  }

  const snapshot = parsePath(pathname);
  cachedPathname = pathname;
  cachedSnapshot = snapshot;
  return snapshot;
}

export function EditorApp({ schema, renderer, api = createApiFetch() }: Readonly<EditorAppProps>) {
  const { view, siteId } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  let content;

  if (view === "content" && siteId) {
    content = createElement(CmsView, { siteId, onBack: () => navigate(`/${siteId}`) });
  } else if (view === "users") {
    content = createElement(UsersPage, { onBack: () => navigate("/") });
  } else if (view === "account") {
    content = createElement(AccountPage, { onBack: () => navigate("/") });
  } else if (view === "assets" && siteId) {
    content = createElement(AssetsPage, { siteId, onBack: () => navigate(`/${siteId}`) });
  } else if (view === "settings" && siteId) {
    content = createElement(SiteSettingsPage, { siteId, onBack: () => navigate(`/${siteId}`) });
  } else if (view === "developer" && siteId) {
    content = createElement(DeveloperPage, { siteId });
  } else if (view === "editor" && siteId) {
    content = createElement(Editor, { siteId, schema, api, renderer });
  } else {
    content = createElement(Dashboard, { api, onSelectSite: (id: string) => navigate(`/${id}`) });
  }

  return <AuthGate api={api}>{content}</AuthGate>;
}
