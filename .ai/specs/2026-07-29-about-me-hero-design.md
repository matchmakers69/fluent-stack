# About Me Hero — Design Spec

Date: 2026-07-29  
Status: Approved for planning  
Page: `/o-mnie` (`src/app/[locale]/(marketing)/o-mnie/page.tsx`)

## Goal

Add a light hero section to the About Me page: page title, short intro, and a single booking CTA. No photo, no home-style slider or animations.

## Decisions

| Topic | Choice |
| ----- | ------ |
| Tone / weight | Light (Contact-like), not full-bleed home Hero |
| Image | None |
| CTA | One button → `/umow-konsultacje` |
| Headline | Simple `about.title` (“O mnie” / “About me”) |
| Implementation | Dedicated `AboutHero` component (ContactHero pattern) |

## Structure

1. New file: `src/components/marketing/AboutHero.tsx`
2. Export from `src/components/marketing/index.ts`
3. `o-mnie/page.tsx` renders `<AboutHero />` instead of the hardcoded `<h1>O mnie</h1>`
4. Existing `generateMetadata` on the page stays unchanged

### AboutHero contents (top to bottom)

1. `h1` — `t("title")`
2. Short intro paragraph — `t("intro")`, muted colour
3. Primary CTA — `Button asChild` `variant="default"` `size="lg"` wrapping `Link` from `@/i18n/navigation` to `/umow-konsultacje`, label `t("cta")`

No `SectionHeading`, no image, no `TextReveal` / slider.

## Layout

Mirror the contact page title block:

- Outer `<section id="about-page">` (same naming pattern as `contact-page`)
- Horizontal padding: `px-8 md:px-16 lg:px-20`
- Top padding: `pt-6 md:pt-8`
- Left-aligned column (not centered)
- Intro uses `text-muted-foreground`; keep the paragraph comfortably readable (follow existing marketing spacing, e.g. not-found gap pattern between title / body / button)
- No custom hero background — site grid from `globals.css` remains
- Mobile-first; no desktop-only styles without a mobile base

Do not use Tailwind colour palette or raw hex. Buttons keep sticker styles from the design system.

## i18n

Namespace: `about` in `messages/pl.json` and `messages/en.json`.

| Key | PL | EN |
| --- | -- | -- |
| `title` | O mnie (existing) | About me (existing) |
| `intro` | Jestem lektorem angielskiego online. Pomagam maturzystom, programistom i osobom uczącym się Business English oraz przygotowującym się do egzaminów Cambridge. | I'm an online English teacher. I help Matura students, developers, and learners focused on Business English or Cambridge exam prep. |
| `cta` | Umów konsultację | Book a consultation |

All user-visible strings come from next-intl. No hardcoded copy in the component or page.

## Out of scope

- Further About page sections (bio, timeline, testimonials)
- Portrait / placeholder image
- Home Hero reuse (slider, typewriting slogan, TextReveal)
- Metadata / SEO changes
- New shadcn primitives

## Verification

- `npm run lint`
- Manual check: `/o-mnie` and `/en/o-mnie` show title, intro, and working CTA to the localized booking route
