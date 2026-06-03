export { CollapsibleSection } from "@hi/editor-ui/collapsible-section";

export interface CtxMenuState {
  x: number;
  y: number;
  kind: "page" | "element";
  id: string;
  isRoot?: boolean;
  isContainer?: boolean;
  name?: string;
}
