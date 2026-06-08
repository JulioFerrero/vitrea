import type { VisualizerEntry } from "../types";
import { canvasStyle } from "../lib/glass";

export function ElementCard({
  entry,
  data,
}: Readonly<{
  entry: VisualizerEntry;
  data: Record<string, unknown>;
}>) {
  return (
    <div
      style={{
        ...canvasStyle,
        borderRadius: "12px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        overflow: "auto",
        flex: 1,
        minHeight: "200px",
        background: "#ffffff",
      }}
    >
      {/* Rendered component */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          padding: "0",
          color: "#171717",
          boxSizing: "border-box",
          minHeight: "120px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        <entry.Component {...data} />
      </div>
    </div>
  );
}
