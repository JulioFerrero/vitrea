/**
 * @vitrea/render — Element renderer, tree utilities, and Tailwind CSS generator.
 *
 * Renders page element trees using React components, provides immutable tree
 * manipulation functions, and includes a Tailwind CSS generator for server-side
 * style generation.
 *
 * ## Example
 *
 * ```tsx
 * import { RenderPage, createElement } from "@vitrea/render";
 *
 * const tree = [
 *   createElement("hero-section", { title: "Hello" }, { padding: "8" }),
 * ];
 *
 * function App() {
 *   return <RenderPage content={tree} renderer={myRenderer} />;
 * }
 * ```
 *
 * @module
 */

export { RenderPage, ElementRenderer, classesFromStyles, inlineStylesFromTokens } from "./renderer";
export { withStyles } from "./with-styles";
export { findById, findElementById, insertChild, removeById, updateById, moveNode, duplicateNode, cloneTree, walkTree, createElement, generateId } from "./tree-utils";
export type { PageElement } from "./tree-utils";
export type { RenderElement, ElementProps, RendererMap } from "./types";
