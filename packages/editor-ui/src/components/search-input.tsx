"use client";

import { Search } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-editor-ring/30 focus:border-editor-ring/40 transition-all duration-200"
      />
    </div>
  );
}
