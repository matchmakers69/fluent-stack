import React from "react";

interface HeroAuthColumnProps {
  image?: string;
  children?: React.ReactNode;
}

export function HeroAuthColumn({
  image = "/images/auth/register-hero.jpg",
  children,
}: HeroAuthColumnProps) {
  return (
    <div
      className="fixed right-0 top-0 hidden min-h-full w-[50%] hero-auth bg-cover bg-center bg-no-repeat lg:flex lg:flex-col"
      style={{ backgroundImage: `url('${image}')` }}
    >
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 p-10 text-white">
        {children}
      </div>
    </div>
  );
}
