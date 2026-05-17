import React from "react";
import type { RenderElement, ElementProps, RendererMap } from "./types";
import { elAttrs } from "./types";
import { classesFromStyles, inlineStylesFromTokens } from "./styles";
import { buildTree } from "./tree";

function DefaultElement({ element, className, style, children, attrs }: { element: RenderElement; className: string; style: React.CSSProperties; children?: React.ReactNode; attrs: Record<string, string> }) {
  return (
    <div {...attrs} className={className} style={style}>
      {children}
      {element.data.content && <span>{element.data.content as string}</span>}
    </div>
  );
}

export function ElementRenderer({ element, renderer, editor }: { element: RenderElement; renderer: RendererMap; editor?: boolean }) {
  const isEditor = editor ?? false;
  const className = classesFromStyles(element.styles as Record<string, unknown>);
  const style = inlineStylesFromTokens(element.styles as Record<string, unknown>);
  const attrs = elAttrs(element.id, element.type, isEditor);
  const children = element.children?.map((c) => <ElementRenderer key={c.id} element={c} renderer={renderer} editor={editor} />);

  const Component = renderer[element.type];
  if (Component) {
    const el = <Component element={element} className={className} style={style} children={children} attrs={attrs} />;
    if (isEditor) {
      const Suspense = React.Suspense;
      return <Suspense fallback={<div {...attrs} className={className} />}>{el}</Suspense>;
    }
    return el;
  }

  return <DefaultElement element={element} className={className} style={style} children={children} attrs={attrs} />;
}

export function RenderPage({ elements, renderer, editor }: { elements: RenderElement[]; renderer: RendererMap; editor?: boolean }) {
  const tree = buildTree(elements);
  return <>{tree.map((el) => <ElementRenderer key={el.id} element={el} renderer={renderer} editor={editor} />)}</>;
}

export { buildTree } from "./tree";
export { classesFromStyles, inlineStylesFromTokens } from "./styles";
export type { RenderElement, ElementProps, RendererMap } from "./types";
