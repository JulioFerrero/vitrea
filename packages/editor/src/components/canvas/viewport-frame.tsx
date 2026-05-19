import React, { useRef, useEffect, useState, useCallback } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { Viewport } from "../../types";

const VIEWPORT_WIDTHS: Record<Viewport, number> = { desktop: 1440, tablet: 768, mobile: 375 };
const VIEWPORT_HEIGHTS: Record<Viewport, number> = { desktop: 900, tablet: 1024, mobile: 812 };
const VIEWPORT_LABELS: Record<Viewport, string> = { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" };

const baseCSSCache = { current: "", fetched: false, pendingEls: [] as HTMLElement[] };

function injectBaseCSS() {
  if (baseCSSCache.current) {
    for (const el of baseCSSCache.pendingEls) el.textContent = baseCSSCache.current;
    baseCSSCache.pendingEls = [];
  }
}

const IFRAME_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style id="tw-dynamic"></style><style id="tw-base"></style><style id="viewport-override"></style></head><body style="margin:0;padding:0;min-height:100%;background-color:#0a0a0a;color:#e5e5e5;-webkit-font-smoothing:antialiased"><div id="canvas-root"></div></body></html>`;

function viewportOverrideCSS(h: number) {
  return `.min-h-\\[100dvh\\]{min-height:${h}px!important}.min-h-\\[100vh\\]{min-height:${h}px!important}.h-\\[100dvh\\]{height:${h}px!important}.h-\\[100vh\\]{height:${h}px!important}`;
}

export function ViewportFrame({
  viewport,
  elements,
  renderer,
}: {
  viewport: Viewport;
  elements: any[];
  renderer: { PageRenderer: React.ComponentType<{ elements: any[]; editor?: boolean }> };
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeH, setIframeH] = useState(800);
  const mountedRef = useRef(false);
  const rootRef = useRef<Root | null>(null);
  const cssCache = useRef(new Set<string>());

  const ICONS: Record<Viewport, React.ComponentType<{ className?: string }>> = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

  const pageWidth = VIEWPORT_WIDTHS[viewport];
  const pageViewportH = VIEWPORT_HEIGHTS[viewport];
  const label = VIEWPORT_LABELS[viewport];

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    if (!mountedRef.current) {
      doc.open();
      doc.write(IFRAME_HTML);
      doc.close();
      mountedRef.current = true;

      const baseEl = doc.getElementById("tw-base");
      if (baseEl) {
        if (baseCSSCache.current) {
          baseEl.textContent = baseCSSCache.current;
        } else {
          baseCSSCache.pendingEls.push(baseEl);
          if (!baseCSSCache.fetched) {
            baseCSSCache.fetched = true;
            fetch("/api/iframe-base")
              .then((r) => r.text())
              .then((css) => {
                baseCSSCache.current = css;
                injectBaseCSS();
              })
              .catch(() => {});
          }
        }
      }
    }

    const overrideEl = doc.getElementById("viewport-override");
    if (overrideEl) overrideEl.textContent = viewportOverrideCSS(pageViewportH);

    const mountEl = doc.getElementById("canvas-root");
    if (!mountEl) return;

    if (!rootRef.current) rootRef.current = createRoot(mountEl);

    const tree = elements.length === 0
      ? <div style={{ display: "flex", height: "600px", alignItems: "center", justifyContent: "center", color: "#999" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "18px", fontWeight: 500 }}>Empty page</p>
            <p style={{ marginTop: "4px", fontSize: "14px" }}>Add elements using the toolbar below</p>
          </div>
        </div>
      : <renderer.PageRenderer elements={elements} editor />;

    rootRef.current.render(tree);

    const measure = () => {
      const root = doc.getElementById("canvas-root");
      if (!root) return;
      const finalH = Math.max(Math.ceil(root.getBoundingClientRect().height), pageViewportH);
      if (iframe.style.height !== `${finalH}px`) {
        iframe.style.height = `${finalH}px`;
        setIframeH(finalH);
      }
    };

    const rootEl = doc.getElementById("canvas-root");
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    if (rootEl) ro.observe(rootEl);
    measure();

    const allClasses: string[] = [];
    mountEl.querySelectorAll("[class]").forEach((el) => {
      el.classList.forEach((c) => allClasses.push(c));
    });
    const newClasses = [...new Set(allClasses)].filter((c) => !cssCache.current.has(c));

    const styleEl = doc.getElementById("tw-dynamic");
    if (styleEl && newClasses.length > 0) {
      fetch("/api/tailwind", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ classes: newClasses }),
      })
        .then((r) => r.text())
        .then((css) => {
          if (!css) return;
          styleEl.textContent += css;
          for (const c of newClasses) cssCache.current.add(c);
        })
        .catch(() => {});
    }

    return () => ro.disconnect();
  }, [elements, renderer, pageViewportH]);

  return (
    <div className="flex flex-col items-center gap-3 flex-shrink-0">
      <span className="flex items-center gap-3 text-2xl font-bold text-muted-foreground/70">
        {React.createElement(ICONS[viewport], { className: "h-8 w-8" })}
        {label} · {pageWidth}
      </span>
      <div className="relative">
        <iframe
          ref={iframeRef}
          title={label}
          className="bg-dark-950 rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.3)] border border-white/[0.06] block"
          style={{ width: `${pageWidth}px`, height: `${iframeH}px`, pointerEvents: "none" }}
        />
      </div>
    </div>
  );
}

export function getTotalWidth(): number {
  return VIEWPORT_WIDTHS.desktop + VIEWPORT_WIDTHS.tablet + VIEWPORT_WIDTHS.mobile + 128;
}

export { VIEWPORT_WIDTHS, VIEWPORT_HEIGHTS };
