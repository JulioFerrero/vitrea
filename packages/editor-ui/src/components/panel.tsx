"use client";

import { cn } from "@hi/utils";
import { glassStyle, glassDarkStyle, glassPanelClass } from "../lib/glass";

export function Panel({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dark";
}) {
  const style = variant === "dark" ? glassDarkStyle : glassStyle;
  return (
    <div className={cn(glassPanelClass, className)} style={style}>
      {children}
    </div>
  );
}
