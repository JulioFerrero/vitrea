import React from "react";
import { RenderPage } from "@vitrea/render";
import { COMPONENT_REGISTRY } from "./components";

function PageRendererWrapper(props: { content: import("@vitrea/render").RenderElement[] }) {
  return React.createElement(RenderPage, { content: props.content, renderer: COMPONENT_REGISTRY });
}

export { PageRendererWrapper as PageRenderer };
export { classesFromStyles, inlineStylesFromTokens } from "@vitrea/render";
export type { RenderElement, ElementProps } from "@vitrea/render";
