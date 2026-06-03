import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cn } from "@vitrea/utils";

const Field = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof FieldPrimitive.Root>
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Root
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  />
));
Field.displayName = "Field";

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof FieldPrimitive.Label>
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof FieldPrimitive.Description>
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof FieldPrimitive.Error>
>(({ className, ...props }, ref) => (
  <FieldPrimitive.Error
    ref={ref}
    className={cn("text-sm text-destructive", className)}
    {...props}
  />
));
FieldError.displayName = "FieldError";

const FieldValidity = FieldPrimitive.Validity;

export { Field, FieldLabel, FieldDescription, FieldError, FieldValidity };
