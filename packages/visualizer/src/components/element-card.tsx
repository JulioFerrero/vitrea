import type { VisualizerEntry } from "../types";
import { glassStyle } from "../lib/glass";

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
        ...glassStyle,
        borderRadius: "24px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        overflow: "auto",
        flex: 1,
        minHeight: "200px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #60a5fa, #2563eb)",
              boxShadow: "0 0 0 4px rgba(37,99,235,0.1)",
            }}
          />
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
            {entry.label}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              background: "rgba(0,0,0,0.04)",
              padding: "2px 8px",
              borderRadius: "6px",
              fontFamily: "monospace",
            }}
          >
            {entry.type}
          </span>
        </div>
      </div>

      {/* Rendered component */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "20px",
          color: "#0f172a",
          border: "1px solid rgba(0,0,0,0.06)",
          boxSizing: "border-box",
        }}
      >
        <entry.Component {...data} />
      </div>
    </div>
  );
}
