"use client";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HamburgerButton } from "./HamburgerButton";
import { cn } from "@/lib/utils";

type AppPathname = keyof typeof routing.pathnames;

function AuthButtons() {
  const { isSignedIn } = useUser();
  const t = useTranslations("navigation");

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="auth-signup">
        <Link href="/umow-konsultacje">{t("booking")}</Link>
      </Button>
      <Button asChild variant="auth-signin">
        <Link href={isSignedIn ? "/dashboard" : "/authentication/sign-in"}>
          {t("studentPanel")}
        </Link>
      </Button>
      {isSignedIn && <UserButton />}
    </div>
  );
}

function MobileAuthButtons() {
  const { isSignedIn } = useUser();
  const t = useTranslations("navigation");

  return (
    <div className="flex flex-col gap-3 pb-8">
      <Button asChild variant="auth-signup" className="w-full">
        <Link href="/umow-konsultacje">{t("booking")}</Link>
      </Button>
      <Button asChild variant="auth-signin" className="w-full">
        <Link href={isSignedIn ? "/dashboard" : "/authentication/sign-in"}>
          {t("studentPanel")}
        </Link>
      </Button>
      {isSignedIn && (
        <SignOutButton>
          <Button variant="auth-signout" className="w-full">
            {t("signOut")}
          </Button>
        </SignOutButton>
      )}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const { isSignedIn } = useUser();
  const t = useTranslations("navigation");

  const openMenu = () => {
    setHamburgerOpen(true);
    setTimeout(() => setMenuOpen(true), 350);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setHamburgerOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = scrolled ? "text-white" : "text-foreground";

  const navLinks: Array<{ label: string; href: AppPathname }> = [
    { label: t("home"), href: "/" },
    { label: t("about"), href: "/o-mnie" },
    { label: t("contact"), href: "/kontakt" },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 h-22.5",
          scrolled ? "bg-navy" : "bg-transparent"
        )}
      >
        <div className="px-6 lg:px-12 flex items-center justify-between h-full">
          <Logo className={textColor} />

          {/* Desktop nav links + auth */}
          <div className="hidden lg:flex items-stretch h-full gap-10">
            <ul className="flex items-stretch h-full gap-8">
              {navLinks.map(({ label, href }) => (
                <li key={href} className="flex items-stretch">
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center font-bold hover:opacity-80 transition-opacity",
                      textColor
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <AuthButtons />
              <LanguageSwitcher scrolled={scrolled} />
            </div>
          </div>

          {/* Mobile right side */}
          <div className="flex lg:hidden items-center gap-3">
            {isSignedIn && <UserButton />}
            <HamburgerButton
              isOpen={hamburgerOpen}
              onToggle={hamburgerOpen ? closeMenu : openMenu}
              className={textColor}
            />
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[oklch(0.18_0.12_280/95%)] flex flex-col px-6 py-4">
          <div className="flex justify-between items-center">
            <Logo className="text-white" />
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
          <MobileAuthButtons />
        </div>
      )}
    </>
  );
}
