import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  label?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {label && (
        <span
          className={cn(
            "inline-flex w-fit px-4 py-1.5",
            "bg-secondary text-secondary-foreground",
            "text-base font-extrabold tracking-widest uppercase",
            "-rotate-2"
          )}
        >
          {label}
        </span>
      )}
      <h2 className="m-0">{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-2xl">
          {description}
        </p>
      )}
    </div>
  )
}
