"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@hi/utils";
import { glassDarkStyle } from "../lib/glass";

export function Dropdown({
  trigger,
  children,
  align = "right",
  width = 224,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const close = useCallback(() => {
    setOpen(false);
    setAnimIn(false);
    setLeaving(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setLeaving(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    if (open) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open, close]);

  function toggle() {
    if (open) {
      close();
    } else {
      setOpen(true);
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    }
  }

  const triggerRect = triggerRef.current?.getBoundingClientRect();
  const dropdownPos: React.CSSProperties = triggerRect
    ? {
        position: "fixed",
        top: triggerRect.bottom + 8,
        [align === "right" ? "right" : "left"]:
          align === "right"
            ? window.innerWidth - triggerRect.right
            : triggerRect.left,
        width,
      }
    : {};

  const menu = visible ? (
    <div
      className={cn(
        "rounded-2xl transition-all duration-150 ease-out overflow-hidden",
        animIn && !leaving
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-1",
      )}
      style={{ zIndex: 9999, ...glassDarkStyle, ...dropdownPos }}
    >
      {children}
    </div>
  ) : null;

  return (
    <div ref={ref} className="relative">
      <div ref={triggerRef} onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>
      {menu && createPortal(menu, document.body)}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
        variant === "danger"
          ? "text-white hover:bg-red-500/10 hover:text-red-400"
          : "text-white hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

export function DropdownHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 border-b border-white/[0.08]">
      {children}
    </div>
  );
}
