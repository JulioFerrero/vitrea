import { useState, useCallback } from "react";
import type { VisualizerConfig, VisualizerEntry } from "../types";
import { glassStyle } from "../lib/glass";
import { ElementCard } from "./element-card";
import { FieldEditor } from "./field-editor";

const categoryOrder = ["section", "layout", "content", "utility"];

function Sidebar({
  entries,
  selected,
  onSelect,
}: Readonly<{
  entries: VisualizerEntry[];
  selected: string | null;
  onSelect: (type: string) => void;
}>) {
  const grouped = entries.reduce<Record<string, VisualizerEntry[]>>((acc, entry) => {
    const cat = entry.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => (categoryOrder.indexOf(a) ?? 99) - (categoryOrder.indexOf(b) ?? 99),
  );

  return (
    <aside
      style={{
        ...glassStyle,
        width: "260px",
        minWidth: "260px",
        borderRadius: "20px",
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        overflowY: "auto",
        maxHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ padding: "0 6px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
          Components
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
          {entries.length} element{entries.length === 1 ? "" : "s"}
        </div>
      </div>

      {sortedCategories.map((category) => (
        <div key={category} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "10px 8px 4px",
            }}
          >
            {category}
          </div>
          {grouped[category].map((entry) => (
            <button
              key={entry.type}
              onClick={() => onSelect(entry.type)}
              style={{
                background: selected === entry.type ? "rgba(0,0,0,0.05)" : "transparent",
                border: "none",
                borderRadius: "10px",
                padding: "8px 10px",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: selected === entry.type ? "#0f172a" : "#64748b",
                fontSize: "12px",
                fontWeight: selected === entry.type ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ opacity: 0.4 }}>
                {entry.icon === "sparkles" && "\u2728"}
                {entry.icon === "panel-top" && "\u2B06\uFE0F"}
                {entry.icon === "panel-bottom" && "\u2B07\uFE0F"}
                {!["sparkles", "panel-top", "panel-bottom"].includes(entry.icon) && "\u25CF"}
              </span>
              {entry.label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

export function VisualizerApp({ config }: Readonly<{ config: VisualizerConfig }>) {
  const entries = config.entries;
  const [selectedType, setSelectedType] = useState<string | null>(entries[0]?.type ?? null);
  const [editedData, setEditedData] = useState<Record<string, Record<string, unknown>>>({});

  const selectedEntry = entries.find((e) => e.type === selectedType) ?? null;

  const getCurrentData = useCallback(
    (entry: VisualizerEntry) => {
      return { ...entry.defaultData, ...(editedData[entry.type] ?? {}) };
    },
    [editedData],
  );

  const updateField = useCallback(
    (entryType: string, fieldName: string, value: unknown) => {
      setEditedData((prev) => ({
        ...prev,
        [entryType]: { ...(prev[entryType] ?? {}), [fieldName]: value },
      }));
    },
    [],
  );

  const resetData = useCallback((entryType: string) => {
    setEditedData((prev) => {
      const next = { ...prev };
      delete next[entryType];
      return next;
    });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#0f172a",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Geist", "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        gap: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          ...glassStyle,
          borderRadius: "16px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              background: "#2563eb",
              boxShadow: "0 0 0 4px rgba(37,99,235,0.12)",
            }}
          />
          <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a" }}>
            Vitrea Visualizer
          </span>
          {config.name && (
            <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "4px" }}>
              {config.name}
            </span>
          )}
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
          Component preview
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: "flex", gap: "16px", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <Sidebar entries={entries} selected={selectedType} onSelect={setSelectedType} />

        {/* Content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            minWidth: 0,
          }}
        >
          {selectedEntry ? (
            <>
              {/* Preview */}
              <ElementCard entry={selectedEntry} data={getCurrentData(selectedEntry)} />

              {/* Editor panel */}
              <div
                style={{
                  ...glassStyle,
                  borderRadius: "20px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                      Edit props
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      {selectedEntry.fields.length} field{selectedEntry.fields.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <button
                    onClick={() => resetData(selectedEntry.type)}
                    style={{
                      background: "rgba(0,0,0,0.03)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      color: "#64748b",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {selectedEntry.fields.map((field) => (
                    <FieldEditor
                      key={field.name}
                      field={field}
                      value={getCurrentData(selectedEntry)[field.name]}
                      onChange={(value) => updateField(selectedEntry.type, field.name, value)}
                    />
                  ))}
                </div>
              </div>

              {/* Schema info */}
              <div
                style={{
                  ...glassStyle,
                  borderRadius: "16px",
                  padding: "16px 20px",
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                }}
              >
                <SchemaBadge label="Type" value={selectedEntry.type} />
                <SchemaBadge label="Category" value={selectedEntry.category} />
                <SchemaBadge label="Container" value={String(false)} />
                <SchemaBadge label="Fields" value={String(selectedEntry.fields.length)} />
              </div>
            </>
          ) : (
            <div
              style={{
                ...glassStyle,
                borderRadius: "20px",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              Select a component from the sidebar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SchemaBadge({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{label}</span>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#334155",
          background: "rgba(0,0,0,0.04)",
          padding: "2px 8px",
          borderRadius: "6px",
          fontFamily: "monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}
