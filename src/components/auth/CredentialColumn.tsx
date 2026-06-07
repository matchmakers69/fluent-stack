import React from "react";

export function CredentialColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-auth-left relative flex min-h-screen w-full flex-col items-center justify-center scroll-touch lg:w-[50%]">
      <div className="flex w-full max-w-160 flex-col px-6 py-8">{children}</div>
    </div>
  );
}
