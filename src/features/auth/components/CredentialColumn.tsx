import React from "react";

export function CredentialColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="credential-column relative flex w-full flex-col items-center justify-center scroll-touch lg:min-h-screen lg:w-[50%]">
      <div className="flex w-full max-w-160 flex-col px-6 py-8">{children}</div>
    </div>
  );
}
