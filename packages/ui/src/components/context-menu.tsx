import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { cn } from "@vitrea/utils";

const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Popup>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Positioner>
      <ContextMenuPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Positioner>
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = "ContextMenuContent";

const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));
ContextMenuItem.displayName = "ContextMenuItem";

const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
};
