"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      {/* Replace this div with <Image> or inline SVG when logo is ready */}
      <div className="font-extrabold text-2xl tracking-tight">
        Logo
      </div>
    </Link>
  )
}
