"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "../stores";

const loadedClasses = new Set<string>();
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

function collectClasses(root: HTMLElement): string[] {
  const classes = new Set<string>();
  const elements = root.querySelectorAll("[class]");
  elements.forEach((el) => {
    el.classList.forEach((c) => classes.add(c));
  });
  return [...classes];
}

async function fetchAndInjectCSS(classes: string[]) {
  const newClasses = classes.filter((c) => !loadedClasses.has(c));
  if (newClasses.length === 0) return;

  try {
    const res = await fetch("/api/tailwind", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ classes: newClasses }),
    });
    const css = await res.text();
    if (!css) return;

    let style = document.getElementById("tw-dynamic") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "tw-dynamic";
      document.head.appendChild(style);
    }
    style.textContent += css;

    for (const c of newClasses) {
      loadedClasses.add(c);
    }
  } catch (err) {
    console.error("Dynamic CSS fetch failed:", err);
  }
}

export function useDynamicCSS(containerRef: React.RefObject<HTMLElement | null>) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const scan = () => {
      const root = containerRef.current;
      if (!root) return;
      const classes = collectClasses(root);
      if (classes.length > 0) {
        fetchAndInjectCSS(classes);
      }
    };

    const observer = new MutationObserver(() => {
      if (pendingTimer) clearTimeout(pendingTimer);
      pendingTimer = setTimeout(scan, 200);
    });

    const root = containerRef.current;
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
      scan();
    }

    return () => observer.disconnect();
  }, [containerRef]);
}
