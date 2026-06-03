import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@vitrea/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner sideOffset={4}>
      <PopoverPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
