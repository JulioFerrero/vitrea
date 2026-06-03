"use client";

import { useRef } from "react";

export function FileUpload({ onFileSelect, accept = "image/*", children }: {
  onFileSelect: (file: File) => void;
  accept?: string;
  children: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()}>
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
