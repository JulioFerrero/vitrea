// #region debug-point B:internal-editor-index
fetch("http://127.0.0.1:7777/event", { method: "POST", body: JSON.stringify({ sessionId: "editor-tailwind-client", runId: "pre-fix", hypothesisId: "B", location: "internal/editor/src/index.ts:1", msg: "[DEBUG] internal editor index evaluated", data: { exportsReferences: true }, ts: Date.now() }) }).catch(() => {});
// #endregion
export { schema, elements } from "./elements/index.ts";
export { content } from "./elements/content.ts";
export { cmsStructure } from "./elements/structure.ts";
