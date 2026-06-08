import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "dark" | "light";
  width?: number;
  height?: number;
  className?: string;
};

export function Logo({ variant = "dark", width = 210, height = 54, className }: LogoProps) {
  const src = variant === "light" ? "/logos/logo-light.svg" : "/logos/logo-dark.svg";

  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <figure className="relative m-0 block">
        <Image
          src={src}
          alt="FluentStack logo"
          quality={100}
          priority
          width={width}
          height={height}
          sizes={`${width}px`}
          style={{ objectFit: "contain", width: `${width}px`, height: `${height}px` }}
        />
      </figure>
    </Link>
  );
}
