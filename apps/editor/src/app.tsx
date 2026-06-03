import { EditorApp } from "@vitrea/editor";
import { schema } from "@internal/editor";
import { websiteRenderer } from "@internal/web";

export function App() {
  return <EditorApp schema={schema} renderer={websiteRenderer} />;
}
