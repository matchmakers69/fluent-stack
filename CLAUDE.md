# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## CRITICAL: Always Consult /docs First

**Before writing any code**, you MUST read the relevant documentation file in the `/docs` directory. This is non-negotiable and applies to every code generation task regardless of how familiar the topic seems. The `/docs` files contain project-specific decisions, patterns, and constraints that override general knowledge.

- /docs/ui.md
- /docs/architecture.md — read before creating any new file, folder, route or component
- /docs/auth.md — read before touching anything auth-related (Clerk, middleware, protected routes, webhooks)
- /docs/i18n.md — read before adding any visible text, creating pages, or touching navigation
- /docs/data-mutations.md — read before writing any Server Action, database query, or src/data/ helper

No test runner is configured yet.

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configured via PostCSS, not a config file)
- **next-intl** (latest v4) — i18n, pl default, en secondary
- **Typography**: Unbounded (body + h2-h6), Archivo Black (h1 + display), Anton (accent), Geist Mono (code) — loaded via `src/shared/lib/fonts.ts`
- **@t3-oss/env-core** — env validation, schema in src/env.ts

## Responsive Design

This project uses Tailwind CSS v4 mobile-first breakpoints:

- Default (no prefix): mobile, < 576px
- sm: large phones, ≥ 576px
- md: tablet and up, ≥ 768px
- lg: desktop, ≥ 1024px
- xl: wide desktop, ≥ 1280px
- 2xl: very wide, ≥ 1536px

Custom breakpoints: sm:576px md:768px lg:1024px xl:1280px 2xl:1536px.
Container classes defined in globals.css — always use .full-width, .wrapper, .container, .container-narrow.
Never use Tailwind max-w-\* for page layout.

All components must be built mobile-first. Define base styles for mobile, then override at sm/md/lg/xl/2xl. Never define desktop-only styles without a mobile fallback.

## Architecture

This is an App Router project. All routes live under `src/app/` following Next.js file-system routing conventions — `page.tsx` for routes, `layout.tsx` for shared layouts, `loading.tsx`/`error.tsx` for async boundaries.

The locale layout (`src/app/[locale]/layout.tsx`) applies font CSS variables via `fontsClassName` from `src/shared/lib/fonts.ts` and sets `<body>` as a flex column spanning full viewport height.

Tailwind v4 uses `@import "tailwindcss"` in `globals.css` rather than `@tailwind` directives — no `tailwind.config.js` needed.

Never use process.env directly in src/ — always import from @/env. Exception: scripts/ directory.

### Feature-driven layout

Source is split into two top-level dirs under `src/`:

- **`src/shared/`** — cross-cutting code; **never** imports from `src/features/`
  - `shared/components/ui/` — shadcn/ui primitives
  - `shared/components/layout/` — Navbar, Footer, Logo, SectionHeading, etc.
  - `shared/lib/` — utils, fonts, seo, structured-data
  - `shared/db/` — Drizzle client and schema

- **`src/features/`** — vertical slices; each feature owns its components, lib, hooks, data
  - `features/auth/` — sign-in, sign-up, forgot-password, SSO callback components
  - `features/marketing/` — Hero, Contact, PdfUpload components + submitContactForm + contact validation
  - `features/account/` — Profile components + profile validation
  - `features/rag/` — embeddings, searchRAG, chunking, documents data
  - `features/chat/` — chat widget
  - `features/admin/` — usePdfUpload hook, jira lib

Use `@/shared/...` and `@/features/...` import paths via the `@/*` → `./src/*` alias.
