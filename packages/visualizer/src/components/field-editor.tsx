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
  const isUrl = field.type === "url";
  const isNumber = field.type === "number";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "#525252",
          letterSpacing: "0.01em",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {field.label}
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 400,
            color: "#d4d4d4",
            fontSize: "10px",
            textTransform: "uppercase",
          }}
        >
          {field.type}
        </span>
      </label>
      <input
        type={isUrl ? "url" : isNumber ? "number" : "text"}
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "#fafafa",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "6px",
          padding: "8px 10px",
          color: "#171717",
          fontSize: "12px",
          fontFamily: isUrl
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.04)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
