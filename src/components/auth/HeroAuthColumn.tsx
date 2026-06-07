import React from "react";

export function HeroAuthColumn({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed right-0 top-0 hidden min-h-full w-[50%] hero-auth bg-cover bg-center bg-no-repeat lg:flex lg:flex-col">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 p-10 text-white">
        {children}
      </div>
    </div>
  );
}
