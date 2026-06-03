"use client";

import type { ComponentType } from "react";

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="h-8 w-8 text-white mx-auto mb-3" />}
      <p className="text-white/40">{title ?? "Nothing here yet"}</p>
      {description && <p className="text-white/30 text-xs mt-1">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-3 text-xs text-editor-ring hover:text-editor-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
