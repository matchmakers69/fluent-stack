# Architecture

## Route Groups

This project uses Next.js App Router route groups to separate
concerns without affecting URLs.

| Group       | URL               | Auth     | Purpose          |
|-------------|-------------------|----------|------------------|
| (marketing) | /                 | No       | Home, about      |
| (booking)   | /umow-konsultacje | No       | Booking page     |
| (auth)      | /authentication/* | No       | Sign in, sign up |
| (dashboard) | /dashboard etc    | User     | Student area     |
| (admin)     | /uploads etc      | Admin    | Admin only       |

All route groups live under src/app/[locale]/.
The locale segment is handled automatically by next-intl.
Never create routes outside of [locale].

## Components

Components live in src/components/ organised by feature:

- ui/ shadcn components only — never edit manually
- shared/ Navbar, Footer — used across all route groups
  - shared/Navbar — fixed top navbar, transparent → navy on scroll; used in (marketing) layout
  - shared/Logo — reusable logo placeholder; replace div with SVG/Image when asset is ready
  - shared/LanguageSwitcher — dropdown locale switcher, uses shadcn DropdownMenu, reads locales from src/i18n/routing.ts automatically
- marketing/ Hero, pricing, testimonials
- booking/ Calendar, booking form
- dashboard/ Lesson cards, material list
- auth/ Clerk UI wrappers (SignInButton, SignUpButton, SignOutButton wrapped in project Button variants)

## Middleware

src/proxy.ts handles Clerk token validation and i18n routing only.
Route protection is done in each route group's layout.tsx — never in middleware.
See /docs/auth.md for protection patterns.

## Key Rules

- Never import from a feature folder into another feature folder.
  Shared logic goes into src/lib/ or src/hooks/.
- All types live in src/types/index.ts unless feature-specific,
  in which case co-locate next to the feature component.
- API routes live under src/app/api/ following REST conventions.
