import { useState, useCallback } from "react";
import type { VisualizerConfig, VisualizerEntry } from "../types";
import { subtleSurfaceStyle } from "../lib/glass";
import { ElementCard } from "./element-card";
import { FieldEditor } from "./field-editor";

const categoryOrder = ["section", "layout", "content", "utility"];

const iconMap: Record<string, string> = {
  sparkles: "◆",
  "panel-top": "▲",
  "panel-bottom": "▼",
  "panel-left": "◀",
  "panel-right": "▶",
  "layout-grid": "▦",
  text: "T",
  image: "▣",
  button: "◇",
  link: "↗",
  input: "▭",
  badge: "●",
  card: "▬",
  list: "☰",
  divider: "—",
  spacer: "↕",
  container: "□",
  hero: "★",
  footer: "▼",
  nav: "▤",
};

function getIcon(icon: string) {
  return iconMap[icon] || "●";
}

/* ─────────────────────────── Toggle Tab ─────────────────────────── */

function PanelToggle({
  collapsed,
  onToggle,
  side,
  label,
}: Readonly<{
  collapsed: boolean;
  onToggle: () => void;
  side: "left" | "right";
  label: string;
}>) {
  const isLeft = side === "left";
  return (
    <button
      onClick={onToggle}
      title={collapsed ? `Show ${label}` : `Hide ${label}`}
      style={{
        position: "absolute",
        top: collapsed ? "12px" : undefined,
        [isLeft ? "left" : "right"]: "0",
        zIndex: 50,
        width: "24px",
        height: "72px",
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: isLeft ? "0 6px 6px 0" : "6px 0 0 6px",
        borderLeft: isLeft ? "none" : undefined,
        borderRight: isLeft ? undefined : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        fontSize: "11px",
        color: "#a3a3a3",
        fontFamily: "monospace",
        padding: "0",
        outline: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#171717";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#a3a3a3";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
      }}
    >
      {isLeft ? (collapsed ? "▶" : "◀") : collapsed ? "◀" : "▶"}
    </button>
  );
}

/* ─────────────────────────── Sidebar ─────────────────────────── */

function Sidebar({
  entries,
  selected,
  onSelect,
  collapsed,
  onToggle,
}: Readonly<{
  entries: VisualizerEntry[];
  selected: string | null;
  onSelect: (type: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}>) {
  const grouped = entries.reduce<Record<string, VisualizerEntry[]>>(
    (acc, entry) => {
      const cat = entry.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(entry);
      return acc;
    },
    {}
  );

  const sortedCategories = Object.keys(grouped).sort(
    (a, b) =>
      (categoryOrder.indexOf(a) ?? 99) - (categoryOrder.indexOf(b) ?? 99)
  );

  if (collapsed) {
    return (
      <div style={{ position: "relative", width: "0", minWidth: "0" }}>
        <PanelToggle
          collapsed={true}
          onToggle={onToggle}
          side="left"
          label="Library"
        />
      </div>
    );
  }

  return (
    <aside
      style={{
        width: "240px",
        minWidth: "240px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        background: "#fafafa",
        position: "relative",
        transition: "width 0.25s ease",
      }}
    >
      <PanelToggle
        collapsed={false}
        onToggle={onToggle}
        side="left"
        label="Library"
      />
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#a3a3a3",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Library
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#737373",
            marginTop: "4px",
            fontWeight: 400,
          }}
        >
          {entries.length} component{entries.length === 1 ? "" : "s"}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {sortedCategories.map((category) => (
          <div
            key={category}
            style={{ display: "flex", flexDirection: "column", gap: "1px" }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#a3a3a3",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "8px 6px 4px",
              }}
            >
              {category}
            </div>
            {grouped[category].map((entry) => (
              <button
                key={entry.type}
                onClick={() => onSelect(entry.type)}
                style={{
                  background: selected === entry.type ? "#171717" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  padding: "7px 8px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: selected === entry.type ? "#ffffff" : "#525252",
                  fontSize: "12px",
                  fontWeight: selected === entry.type ? 500 : 400,
                  transition: "all 0.12s ease",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
                onMouseEnter={(e) => {
                  if (selected !== entry.type) {
                    e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                    e.currentTarget.style.color = "#171717";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected !== entry.type) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#525252";
                  }
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    opacity: selected === entry.type ? 0.7 : 0.4,
                    width: "14px",
                    textAlign: "center",
                    fontFamily: "monospace",
                  }}
                >
                  {getIcon(entry.icon)}
                </span>
                {entry.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ─────────────────────────── Main App ─────────────────────────── */

export function VisualizerApp({
  config,
}: Readonly<{ config: VisualizerConfig }>) {
  const entries = config.entries;
  const [selectedType, setSelectedType] = useState<string | null>(
    entries[0]?.type ?? null
  );
  const [editedData, setEditedData] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const selectedEntry = entries.find((e) => e.type === selectedType) ?? null;

  const getCurrentData = useCallback(
    (entry: VisualizerEntry) => {
      return { ...entry.defaultData, ...(editedData[entry.type] ?? {}) };
    },
    [editedData]
  );

  const updateField = useCallback(
    (entryType: string, fieldName: string, value: unknown) => {
      setEditedData((prev) => ({
        ...prev,
        [entryType]: { ...(prev[entryType] ?? {}), [fieldName]: value },
      }));
    },
    []
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
        height: "100vh",
        background: "#ffffff",
        color: "#171717",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          height: "48px",
          minHeight: "48px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          background: "#ffffff",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "2px",
              background: "#171717",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#171717",
            }}
          >
            Vitrea
          </span>
          {config.name && (
            <span
              style={{
                fontSize: "12px",
                color: "#a3a3a3",
                fontWeight: 400,
              }}
            >
              / {config.name}
            </span>
          )}
        </div>
        <div style={{ fontSize: "11px", color: "#a3a3a3", fontWeight: 400 }}>
          Component Preview
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Sidebar */}
        <Sidebar
          entries={entries}
          selected={selectedType}
          onSelect={setSelectedType}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((s) => !s)}
        />

        {/* Content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {selectedEntry ? (
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: panelCollapsed ? "1fr" : "1fr 320px",
                gridTemplateRows: "1fr",
                overflow: "hidden",
                minHeight: 0,
                transition: "grid-template-columns 0.25s ease",
              }}
            >
              {/* Left: Preview */}
              <div
                style={{
                  overflow: "auto",
                  padding: "24px",
                  background: "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  position: "relative",
                }}
              >
                {/* Preview header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#171717",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {selectedEntry.label}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#a3a3a3",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                        background: "#f0f0f0",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 400,
                      }}
                    >
                      {selectedEntry.type}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <SchemaBadge
                      label="Category"
                      value={selectedEntry.category}
                    />
                    <SchemaBadge
                      label="Fields"
                      value={String(selectedEntry.fields.length)}
                    />
                  </div>
                </div>

                {/* Component preview */}
                <ElementCard
                  entry={selectedEntry}
                  data={getCurrentData(selectedEntry)}
                />

                {/* Usage hint */}
                <div
                  style={{
                    ...subtleSurfaceStyle,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "11px",
                    color: "#737373",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 500, color: "#525252" }}>
                    Usage:
                  </span>{" "}
                  Import{" "}
                  <code
                    style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: "#171717",
                      background: "#f0f0f0",
                      padding: "1px 4px",
                      borderRadius: "3px",
                    }}
                  >{`<${selectedEntry.type} />`}</code>{" "}
                  from your component library. The preview above reflects your
                  current prop values.
                </div>
              </div>

              {/* Right: Properties panel */}
              {!panelCollapsed && (
                <div
                  style={{
                    borderLeft: "1px solid rgba(0,0,0,0.08)",
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    position: "relative",
                    transition: "width 0.25s ease",
                  }}
                >
                  <PanelToggle
                    collapsed={false}
                    onToggle={() => setPanelCollapsed((s) => !s)}
                    side="right"
                    label="Properties"
                  />
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#171717",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Properties
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#a3a3a3",
                          marginTop: "2px",
                        }}
                      >
                        {selectedEntry.fields.length} field
                        {selectedEntry.fields.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <button
                      onClick={() => resetData(selectedEntry.type)}
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        color: "#737373",
                        fontSize: "11px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.12s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)";
                        e.currentTarget.style.color = "#171717";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                        e.currentTarget.style.color = "#737373";
                      }}
                    >
                      Reset
                    </button>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "16px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {selectedEntry.fields.map((field) => (
                      <FieldEditor
                        key={field.name}
                        field={field}
                        value={getCurrentData(selectedEntry)[field.name]}
                        onChange={(value) =>
                          updateField(selectedEntry.type, field.name, value)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Panel toggle when collapsed (floating over preview) */}
              {panelCollapsed && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: "0",
                    zIndex: 40,
                  }}
                >
                  <PanelToggle
                    collapsed={true}
                    onToggle={() => setPanelCollapsed((s) => !s)}
                    side="right"
                    label="Properties"
                  />
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a3a3a3",
                fontSize: "13px",
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

/* ─────────────────────────── Badge ─────────────────────────── */

function SchemaBadge({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "11px", color: "#a3a3a3" }}>{label}</span>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "#525252",
          background: "#f0f0f0",
          padding: "2px 8px",
          borderRadius: "4px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}
