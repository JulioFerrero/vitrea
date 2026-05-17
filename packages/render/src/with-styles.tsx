import React from "react";
import type { ElementProps } from "./types";
import { classesFromStyles, inlineStylesFromTokens } from "./styles";

export function withStyles<P extends Partial<ElementProps>>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, "className" | "style"> & { element: ElementProps["element"] }> {
  return function StyledComponent(props) {
    const { element, ...rest } = props as any;
    const className = classesFromStyles(element.styles as Record<string, unknown>);
    const style = inlineStylesFromTokens(element.styles as Record<string, unknown>);
    return <Component {...(rest as P)} element={element} className={className} style={style} />;
  };
}
