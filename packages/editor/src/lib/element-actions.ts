import { useEditorStore } from "../stores";
import type { EditorApi, EditorSchema, PageElement } from "../types";
import { createElement } from "@vitrea/render";
import { sendCollabUpdate } from "./collab-bridge";

export function createElementActions(api: EditorApi, schema: EditorSchema) {
  const store = useEditorStore;

  function getTypeConfig(type: string) {
    return schema.elementTypes.find((t) => t.type === type);
  }

  return {
    async loadContent(pageId: string) {
      store.getState().setLoading(true);
      const page = await api.fetch(`/pages/${pageId}`) as { content?: PageElement[]; data?: Record<string, unknown> };
      const content = (page.content ?? []) as PageElement[];
      const isPublished = (page.data as Record<string, unknown> | undefined)?.status !== "published";
      store.getState().setContent(content);
      store.getState().setHasActiveDraft(false);
      store.getState().setLoading(false);
      return content;
    },

    addChild(parentId: string | null, type: string, index?: number) {
      const config = getTypeConfig(type);
      const element = createElement(
        type,
        config?.defaultData ?? {},
        config?.defaultStyles ?? {},
      );
      store.getState().pushHistory();
      store.getState().addChild(parentId, element, index);
      store.getState().selectElement(element.id);
      return element;
    },

    updateNodeData(id: string, data: Record<string, unknown>) {
      store.getState().pushHistory();
      store.getState().updateNode(id, { data });
      sendCollabUpdate(id, { data });
    },

    updateNodeStyles(id: string, styles: Record<string, string>) {
      store.getState().pushHistory();
      store.getState().updateNode(id, { styles });
      sendCollabUpdate(id, { styles });
    },

    deleteNode(id: string) {
      store.getState().pushHistory();
      store.getState().removeNode(id);
    },

    duplicateNode(id: string) {
      store.getState().pushHistory();
      store.getState().duplicateNode(id);
    },

    moveNodeUp(id: string) {
      store.getState().pushHistory();
      store.getState().moveNodeUp(id);
    },

    moveNodeDown(id: string) {
      store.getState().pushHistory();
      store.getState().moveNodeDown(id);
    },

    moveNodeTo(id: string, newParentId: string | null, index: number) {
      store.getState().pushHistory();
      store.getState().moveNodeTo(id, newParentId, index);
    },
  };
}
