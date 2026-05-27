# Architecture

## Route Groups

This project uses Next.js App Router route groups to separate 
concerns without affecting URLs.

| Group          | URL prefix           | Auth required | Purpose                    |
|----------------|----------------------|---------------|----------------------------|
| (marketing)    | /                    | No            | Home, about page           |
| (booking)      | /rezerwacja          | No            | Public calendar & booking  |
| (dashboard)    | /dashboard etc       | Yes (Clerk)   | Student area               |

Auth is handled via Clerk modals — no auth route group or pages needed.

All route groups live under src/app/[locale]/.
The locale segment is handled automatically by next-intl.
Never create routes outside of [locale].

## Components

Components live in src/components/ organised by feature:
- ui/         shadcn components only — never edit manually
- shared/     Navbar, Footer — used across all route groups
  - shared/Navbar — fixed top navbar, transparent → navy on scroll; used in (marketing) layout
  - shared/Logo   — reusable logo placeholder; replace div with SVG/Image when asset is ready
  - shared/LanguageSwitcher — dropdown locale switcher, uses shadcn DropdownMenu, reads locales from src/i18n/routing.ts automatically
- marketing/  Hero, pricing, testimonials
- booking/    Calendar, booking form
- dashboard/  Lesson cards, material list
- auth/       Clerk UI wrappers (SignInButton, SignUpButton, SignOutButton wrapped in project Button variants)

## Middleware

src/middleware.ts uses Clerk's clerkMiddleware to protect 
all (dashboard) routes. Public routes require no changes — 
they are public by default.

## Key Rules
- Never import from a feature folder into another feature folder.
  Shared logic goes into src/lib/ or src/hooks/.
- All types live in src/types/index.ts unless feature-specific,
  in which case co-locate next to the feature component.
- API routes live under src/app/api/ following REST conventions.
