import { createElement } from "react";
import type { RendererAdapter } from "@vitrea/editor";
import { RenderPage } from "@vitrea/render";
import type { RenderElement } from "@vitrea/render";
import { COMPONENT_REGISTRY } from "./components/index.ts";

export { PageRenderer, classesFromStyles, inlineStylesFromTokens } from "./renderer.tsx";
export type { RenderElement, ElementProps } from "./renderer.tsx";
export { COMPONENT_REGISTRY, hasComponent } from "./components/index.ts";

export const websiteRenderer: RendererAdapter = {
  PageRenderer: (props: { content: RenderElement[]; editor?: boolean }) =>
    createElement(RenderPage, { ...props, renderer: COMPONENT_REGISTRY }),
};
