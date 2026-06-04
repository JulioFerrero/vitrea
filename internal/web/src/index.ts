import { createElement } from "react";
import type { RendererAdapter } from "@vitrea/editor";
import { RenderPage } from "@vitrea/render";
import type { RenderElement } from "@vitrea/render";
import { COMPONENT_REGISTRY } from "./components";

export { PageRenderer, classesFromStyles, inlineStylesFromTokens } from "./renderer";
export type { RenderElement, ElementProps } from "./renderer";
export { COMPONENT_REGISTRY, hasComponent } from "./components";

export const websiteRenderer: RendererAdapter = {
  PageRenderer: (props: { content: RenderElement[]; editor?: boolean }) =>
    createElement(RenderPage, { ...props, renderer: COMPONENT_REGISTRY }),
};
