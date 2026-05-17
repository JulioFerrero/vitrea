import React from "react";
import { RenderPage } from "@hi/render";
import { COMPONENT_REGISTRY } from "./components";

function PageRendererWrapper(props: { elements: import("@hi/render").RenderElement[] }) {
  return React.createElement(RenderPage, { elements: props.elements, renderer: COMPONENT_REGISTRY });
}

export { PageRendererWrapper as PageRenderer };
export { buildTree, classesFromStyles, inlineStylesFromTokens } from "@hi/render";
export type { RenderElement, ElementProps } from "@hi/render";
