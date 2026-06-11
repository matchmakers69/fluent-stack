import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[20px] border-2 border-[oklch(0.42_0.20_278)] bg-clip-padding font-sans font-extrabold tracking-[-0.01em] whitespace-nowrap cursor-pointer shadow-[3px_4px_0px_oklch(0.42_0.20_278)] transition-all outline-none select-none hover:translate-y-[3px] hover:translate-x-[3px] hover:shadow-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        yellow: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        pink: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        lavender: "bg-accent text-accent-foreground hover:bg-accent/90",
        cyan: "bg-[var(--chart-1)] text-[oklch(0.18_0.10_280)] hover:opacity-90",
        "auth-signin":
          "bg-[oklch(0.28_0.18_278)] text-white border-2 border-white shadow-[3px_4px_0px_#ffffff] hover:shadow-none hover:bg-[oklch(0.32_0.20_278)]",
        "auth-signup":
          "bg-[oklch(0.50_0.25_290)] text-white border-2 border-white shadow-[3px_4px_0px_#ffffff] hover:shadow-none hover:bg-[oklch(0.54_0.25_290)]",
        "auth-signout":
          "bg-transparent text-white border-2 border-white shadow-[3px_4px_0px_#ffffff] hover:shadow-none hover:bg-white/10",
        white: "bg-white text-[oklch(0.42_0.20_278)] border-2 border-[oklch(0.42_0.20_278)]",
      },
      size: {
        default:
          "h-10 md:h-11 gap-1.5 px-5 md:px-6 text-[1rem] md:text-[1.075rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-8 md:h-9 rounded-[14px] gap-1 px-3.5 md:px-4 text-[0.8rem] md:text-[0.875rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 md:h-10 rounded-[16px] gap-1 px-4 md:px-4.5 text-[0.9rem] md:text-[0.975rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 md:h-12 gap-1.5 px-5 md:px-7 text-[1rem] md:text-[1.25rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-6 md:size-7",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-5 md:size-6 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-7 md:size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Usage as link: <Button asChild><a href="/path">Label</a></Button>
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  type = "button",
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      type={type}
      {...props}
    />
  );
}

export { Button, buttonVariants };
