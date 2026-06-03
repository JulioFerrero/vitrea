import { cn } from "@vitrea/utils";

export function ScrollArea({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-y-auto editor-scroll", className)}>
      {children}
    </div>
  );
}
