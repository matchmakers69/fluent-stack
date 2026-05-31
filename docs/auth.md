# Authentication — Clerk

This project uses `@clerk/nextjs` for all authentication.
No other auth library may be used.

## Provider

`ClerkProvider` wraps the entire app in `src/app/layout.tsx` only.
Do not add it anywhere else.

## Middleware

`src/proxy.ts` (this project uses `proxy.ts` as the middleware file).
`clerkMiddleware` protects `/dashboard`, `/lessons`, `/educational-materials` routes.
Public routes need no changes — they are public by default.
Never add auth checks inside page or layout components.

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
- Never build custom auth forms — use Clerk modal
- Never create `/sign-in` or `/sign-up` pages
- No webhooks in MVP scope
- Auth button styles defined in `/docs/ui.md` — always use them
