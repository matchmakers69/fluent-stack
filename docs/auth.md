# Authentication — Clerk

This project uses @clerk/nextjs v7 for all authentication.
No other auth library may be used.

## Provider

ClerkProvider wraps the entire app in src/app/layout.tsx only.
Do not add it anywhere else.

## Middleware — src/proxy.ts

Middleware handles ONLY Clerk token validation and i18n routing.
Route protection is NOT done in middleware.
Reason: localePrefix "as-needed" means Polish routes have no
locale prefix so path matchers never match Polish URLs.
Always protect in layout instead.

## Route Protection — in layout.tsx

(dashboard) layout — students:

```ts
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
export default async function DashboardLayout({ children }) {
  const { userId } = await auth()
  if (!userId) redirect("/authentication/sign-in")
  return <>{children}</>
}
```

(admin) layout — admin only:

```ts
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
export default async function AdminLayout({ children }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect("/authentication/sign-in")
  if (sessionClaims?.metadata?.role !== "admin") redirect("/")
  return <>{children}</>
}
```

## Auth pages

Dedicated pages — no modal mode:

- /authentication/sign-in → src/app/[locale]/(auth)/authentication/sign-in/page.tsx
- /authentication/sign-up → src/app/[locale]/(auth)/authentication/sign-up/page.tsx

```tsx
// sign-in/page.tsx
import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/authentication/sign-up" />;
}

// sign-up/page.tsx
import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/authentication/sign-in" />;
}
```

## Reading current user

Server components:

```ts
import { auth, currentUser } from "@clerk/nextjs/server";
const { userId, sessionClaims } = await auth();
```

Client components:

```ts
"use client";
import { useUser } from "@clerk/nextjs";
const { user, isLoaded } = useUser();
```

## Admin role check

```ts
// server
const { sessionClaims } = await auth();
const isAdmin = sessionClaims?.metadata?.role === "admin";

// client
const { user } = useUser();
const isAdmin = user?.publicMetadata?.role === "admin";
```

## Auth UI in Navbar

SignedIn/SignedOut do not exist in @clerk/nextjs v7.
Use useUser() to branch. Use Link from @/i18n/navigation.

```tsx
"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

function AuthButtons() {
  const { isSignedIn } = useUser();
  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="auth-signup">
        <Link href="/umow-konsultacje">Umów konsultację</Link>
      </Button>
      <Button asChild variant="auth-signin">
        <Link href={isSignedIn ? "/dashboard" : "/authentication/sign-in"}>Panel Ucznia</Link>
      </Button>
      {isSignedIn && <UserButton />}
    </div>
  );
}
```

## Navbar nav links

Only two nav links — booking is a CTA button, not a nav link:

```ts
const navLinks = [
  { label: t("home"), href: "/" },
  { label: t("about"), href: "/o-mnie" },
  { label: t("contact"), href: "/kontakt" },
];
```

## Environment variables (.env)

## Admin setup in Clerk Dashboard

1. Clerk Dashboard → Users → your account
2. Edit Public Metadata: { "role": "admin" }
3. This grants access to all (admin) routes

## Route groups summary

| Group       | Path                | Protection      |
| ----------- | ------------------- | --------------- |
| (marketing) | /                   | none            |
| (booking)   | /umow-konsultacje   | none            |
| (auth)      | /authentication/\*  | none            |
| (dashboard) | /dashboard, /lekcje | userId required |
| (admin)     | /uploads            | role=admin      |

## Rules

- Never use cookies, JWTs, or sessions manually
- Never call auth.protect() in middleware
- Always protect in layout.tsx of the route group
- SignedIn/SignedOut components do not exist in v7
- No webhooks in MVP scope
- Auth button styles defined in /docs/ui.md
