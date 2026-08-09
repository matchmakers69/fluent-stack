"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HamburgerButton } from "./HamburgerButton";

type AppPathname = keyof typeof routing.pathnames;

export function AuthNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const t = useTranslations("navigation");

  const openMenu = () => {
    setHamburgerOpen(true);
    setTimeout(() => setMenuOpen(true), 350);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setHamburgerOpen(false);
  };

  const navLinks: Array<{ label: string; href: AppPathname }> = [
    { label: t("home"), href: "/" },
    { label: t("contact"), href: "/kontakt" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-background h-22.5">
        <div className="px-6 lg:px-12 flex items-center justify-between h-full">
          <Logo variant="dark" />

          <div className="hidden lg:flex items-center gap-4">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="font-bold text-foreground hover:opacity-80 transition-opacity"
              >
                {label}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          <div className="flex lg:hidden items-center gap-4">
            <LanguageSwitcher />
            <HamburgerButton
              isOpen={hamburgerOpen}
              onToggle={hamburgerOpen ? closeMenu : openMenu}
              className="text-foreground"
            />
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[oklch(0.18_0.12_280/95%)] flex flex-col px-6 py-4">
          <div className="flex justify-between items-center">
            <Logo variant="light" />
            <button
              onClick={closeMenu}
              className="text-white font-bold text-3xl leading-none cursor-pointer"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <ul className="flex flex-col gap-8 mt-16 flex-1">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMenu}
                  className="text-white font-bold text-3xl hover:opacity-80 transition-opacity"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <LanguageSwitcher mobile />
        </div>
      )}
    </>
  );
}
