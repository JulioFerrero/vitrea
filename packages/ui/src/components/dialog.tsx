import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@vitrea/utils";
import { X } from "lucide-react";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Popup>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogPrimitive.Backdrop
      className="dialog-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', transition: 'opacity 200ms ease' }}
    />
    <DialogPrimitive.Popup
      ref={ref}
      className={cn(
        "dialog-popup grid w-full max-w-lg gap-4 border border-border bg-background p-6 shadow-2xl sm:rounded-2xl",
        className
      )}
      style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, transition: 'opacity 200ms ease, transform 200ms ease' }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xl p-1 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Popup>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
