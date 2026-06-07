"use client";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

type AppPathname = keyof typeof routing.pathnames;

export function AuthNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations("navigation");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = scrolled ? "text-white" : "text-foreground";

  const navLinks: Array<{ label: string; href: AppPathname }> = [
    { label: t("home"), href: "/" },
    { label: t("contact"), href: "/kontakt" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 h-[5.625rem]",
        scrolled ? "bg-navy" : "bg-transparent"
      )}
    >
      <div className="px-6 lg:px-12 flex items-center justify-between h-full">
        <Logo className={textColor} />

        <div className="flex items-center gap-4 sm:gap-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "hidden sm:flex items-center font-bold hover:opacity-80 transition-opacity",
                textColor
              )}
            >
              {label}
            </Link>
          ))}
          <LanguageSwitcher scrolled={scrolled} />
        </div>
      </div>
    </nav>
  );
}
