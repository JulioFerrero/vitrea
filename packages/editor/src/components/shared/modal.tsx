"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@hi/utils";
import { X } from "lucide-react";
import { glassDarkStyle, overlayStyle } from "../../lib/glass";

export function Modal({
  open,
  onOpenChange,
  children,
  className,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(exitTimerRef.current);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    } else {
      setAnimIn(false);
      exitTimerRef.current = setTimeout(() => setMounted(false), 200);
    }
  }, [open]);

  if (!mounted) return null;

  const modal = (
    <div
      className={cn(
        "fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto p-4 transition-opacity duration-200 ease-out",
        animIn ? "opacity-100" : "opacity-0",
      )}
      style={overlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl p-6 my-8 transition-all duration-200 ease-out",
          maxWidth,
          animIn ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2",
          className,
        )}
        style={glassDarkStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
