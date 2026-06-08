import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function FieldError({
  message,
  className,
  ...props
}: { message: string } & Omit<React.ComponentProps<"p">, "children">) {
  return (
    <p
      role="alert"
      className={cn(
        "flex items-center gap-1.5 text-sm font-semibold text-destructive",
        className
      )}
      {...props}
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
