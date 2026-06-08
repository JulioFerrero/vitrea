import React from "react";

export function FieldEditor({
  field,
  value,
  onChange,
}: Readonly<{
  field: { name: string; label: string; type: string };
  value: unknown;
  onChange: (value: string) => void;
}>) {
  const strValue = value === undefined || value === null ? "" : String(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#64748b",
          letterSpacing: "0.02em",
        }}
      >
        {field.label}
        <span
          style={{
            marginLeft: "6px",
            fontFamily: "monospace",
            fontWeight: 400,
            color: "#cbd5e1",
            fontSize: "10px",
          }}
        >
          {field.type}
        </span>
      </label>
      <input
        type={field.type === "url" ? "url" : "text"}
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "rgba(0,0,0,0.02)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "8px",
          padding: "7px 10px",
          color: "#0f172a",
          fontSize: "12px",
          fontFamily: field.type === "url" ? "monospace" : "inherit",
          outline: "none",
          transition: "border-color 0.15s",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
