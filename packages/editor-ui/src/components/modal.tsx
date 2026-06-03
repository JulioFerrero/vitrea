"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@vitrea/utils";
import { glassDarkStyle, overlayStyle } from "../lib/glass";

export function Modal({
  open,
  onOpenChange,
  children,
  maxWidth = "max-w-lg",
  variant = "default",
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  maxWidth?: string;
  variant?: "default" | "flat";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    } else {
      setAnimIn(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center transition-opacity duration-200",
        animIn ? "opacity-100" : "opacity-0",
      )}
      style={{ zIndex: 9999, ...overlayStyle }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn(
          "relative w-full mx-4 p-6 rounded-2xl transition-all duration-200",
          maxWidth,
          variant === "flat" ? "bg-black/90 border border-white/[0.08]" : "",
          animIn ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.98] translate-y-1",
          className,
        )}
        style={variant === "default" ? glassDarkStyle : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 h-8 w-8 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
