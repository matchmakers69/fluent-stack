# Authentication — Clerk

This project uses `@clerk/nextjs` for all authentication.
No other auth library may be used.

## Provider

`ClerkProvider` wraps the entire app in `src/app/layout.tsx` only.
Do not add it anywhere else.

## Middleware

`src/proxy.ts` (this project uses `proxy.ts` as the middleware file).
The middleware only handles Clerk token validation and i18n routing — it does **not** enforce route protection.

Do NOT add route protection to the middleware. Because `localePrefix: "as-needed"` omits the locale prefix for the default language (pl), URL patterns like `/:locale/materialy(.*)` never match Polish routes. Middleware-level matchers are unreliable here.

## Route Protection

Protect authenticated routes in the **layout** of the relevant route group. All protected routes (`/dashboard`, `/lekcje`, `/materialy`) live under `src/app/[locale]/(dashboard)/` and are guarded by that group's `layout.tsx`:

```ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  return <>{children}</>;
}
```

Unauthenticated users are redirected to `/` (home page). Any new protected route added under `(dashboard)/` is automatically covered.

## Modal mode — no auth pages needed

Auth uses modal mode. There are no `/sign-in` or `/sign-up` pages.

## Reading current user

Server components:

```ts
import { auth, currentUser } from "@clerk/nextjs/server";
const { userId } = await auth();
```

Client components:

```ts
"use client";
import { useUser } from "@clerk/nextjs";
const { user, isLoaded } = useUser();
```

## Auth UI — always use our Button variants

`SignedIn`/`SignedOut` do not exist in `@clerk/nextjs` v7. Use `useUser()` to branch on auth state.

```tsx
"use client";
import { SignInButton, SignUpButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

function AuthButtons() {
  const { isSignedIn } = useUser();

  if (isSignedIn) return <UserButton />;

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
```

## Rules

- Never use cookies, JWTs, or sessions manually
- No webhooks in MVP scope
- Auth button styles defined in `/docs/ui.md` — always use them
