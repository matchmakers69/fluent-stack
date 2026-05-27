"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Strona główna", href: "/" },
  { label: "O mnie", href: "/o-mnie" },
  { label: "Rezerwacja", href: "/rezerwacja" },
];

function AuthButtons() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <>
      <SignInButton mode="modal">
        <Button variant="auth-signin">Sign In</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button variant="auth-signup">Sign Up</Button>
      </SignUpButton>
    </>
  );
}

function MobileAuthButtons() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex flex-col gap-3 pb-8">
        <SignOutButton>
          <Button variant="auth-signout" className="w-full">
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-8">
      <SignInButton mode="modal">
        <Button variant="auth-signin" className="w-full">
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button variant="auth-signup" className="w-full">
          Sign Up
        </Button>
      </SignUpButton>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = scrolled ? "text-white" : "text-foreground";

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 transition-all duration-300",
          scrolled ? "bg-navy" : "bg-transparent"
        )}
      >
        <div className="flex items-center justify-between">
          <Logo className={textColor} />

          {/* Desktop nav links + auth */}
          <div className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-8">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "font-bold hover:opacity-80 transition-opacity",
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
            </div>
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-3">
            {isSignedIn && <UserButton />}
            <button
              onClick={() => setMenuOpen(true)}
              className={cn("font-bold text-2xl leading-none", textColor)}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[oklch(0.18_0.12_280/95%)] flex flex-col px-6 py-4">
          <div className="flex justify-between items-center">
            <Logo className="text-white" />
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white font-bold text-3xl leading-none"
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
                  onClick={() => setMenuOpen(false)}
                  className="text-white font-bold text-3xl hover:opacity-80 transition-opacity"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <MobileAuthButtons />
        </div>
      )}
    </>
  );
}
