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


No test runner is configured yet.

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configured via PostCSS, not a config file)
- **next-intl** (latest v4) — i18n, pl default, en secondary

## Responsive Design

This project uses Tailwind CSS v4 mobile-first breakpoints:
- Default (no prefix): mobile, < 768px
- md: tablet and up, ≥ 768px
- lg: desktop, ≥ 1024px
- xl: wide desktop, ≥ 1280px

All components must be built mobile-first. Define base styles for mobile, then override at md/lg. Never define desktop-only styles without a mobile fallback.

## Architecture

This is an App Router project. All routes live under `src/app/` following Next.js file-system routing conventions — `page.tsx` for routes, `layout.tsx` for shared layouts, `loading.tsx`/`error.tsx` for async boundaries.

The root layout (`src/app/layout.tsx`) loads Geist fonts as CSS variables (`--font-geist-sans`, `--font-geist-mono`) and sets `<body>` as a flex column spanning full viewport height.

Tailwind v4 uses `@import "tailwindcss"` in `globals.css` rather than `@tailwind` directives — no `tailwind.config.js` needed.
