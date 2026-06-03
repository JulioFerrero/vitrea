"use client";

import { cn } from "@hi/utils";

export function PageShell({
  children,
  title,
  headerAction,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  headerAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-background p-6 md:p-10", className)}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-8">
          {title && <h1 className="text-2xl font-semibold text-white/90">{title}</h1>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="max-w-2xl mx-auto space-y-8">{children}</div>
    </div>
  );
}
