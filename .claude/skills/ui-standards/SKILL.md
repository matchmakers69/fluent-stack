---
name: ui-standards
description: UI coding standards for this Next.js project. Use when writing any UI code — components, pages, forms, layouts. Enforces shadcn/ui only, correct button variants, design tokens, typography, date formatting, and layout classes. Never use raw hex, Tailwind colour palette, or custom UI components.
---

## COMPONENT LIBRARY

Only shadcn/ui components. No exceptions.

- Never create custom buttons, inputs, modals, cards, badges from scratch
- Never use MUI, Chakra, or Radix primitives directly
- All shadcn components live in `src/components/ui/` — import from there
- If a needed component doesn't exist yet, add it via CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```

---

## BUTTON VARIANTS

Import: `import { Button } from "@/components/ui/button"`

All buttons default to `type="button"` — this is set in the component. Only use `type="submit"` explicitly when needed inside a form.

| Variant        | Colour                     | Use for                            |
| -------------- | -------------------------- | ---------------------------------- |
| `default`      | green (`--primary`)        | Primary CTA, most important action |
| `secondary`    | yellow (`--secondary`)     | Secondary actions, highlights      |
| `pink`         | hot pink (`--destructive`) | Warnings, delete, bold accent      |
| `lavender`     | lavender (`--accent`)      | Soft actions, tags, categories     |
| `cyan`         | cyan (`--chart-1`)         | Info, links, neutral accent        |
| `outline`      | transparent + border       | Tertiary actions, cancel           |
| `white`        | white bg, purple border    | CTAs on coloured backgrounds       |
| `auth-signin`  | deep navy                  | Sign In — navbar only              |
| `auth-signup`  | purple                     | Sign Up — navbar only              |
| `auth-signout` | transparent + white border | Sign Out — navbar only             |

Never use `ghost` or `link` for visible UI buttons — only for icon-only controls or inline text actions.

Auth variants (`auth-signin`, `auth-signup`, `auth-signout`) are exclusively for Clerk auth buttons in the navbar.

### Sizes

| Size      | Height         | Use for                      |
| --------- | -------------- | ---------------------------- |
| `default` | h-10 / md:h-11 | Standard UI                  |
| `lg`      | h-11 / md:h-12 | Hero CTAs, prominent actions |
| `sm`      | h-9 / md:h-10  | Compact UI, inside cards     |
| `xs`      | h-8 / md:h-9   | Tight spaces, badges         |
| `icon`    | size-6/7       | Icon-only buttons            |

### Button as link

```tsx
<Button asChild variant="secondary" size="lg">
  <a href="/path">Label</a>
</Button>
```

---

## COLOURS

All colours come from CSS variables defined in `globals.css`.

**Never use:**

- Raw hex values (`#2563EB`)
- Tailwind built-in palette (`bg-green-500`, `text-blue-600`)
- oklch values inline in components (use tokens)

**Always use semantic tokens:**

| Token           | Colour      | Tailwind class                                                |
| --------------- | ----------- | ------------------------------------------------------------- |
| `--primary`     | green       | `bg-primary`, `text-primary`                                  |
| `--secondary`   | yellow      | `bg-secondary`, `text-secondary`                              |
| `--destructive` | hot pink    | `bg-destructive`, `text-destructive`                          |
| `--accent`      | lavender    | `bg-accent`, `text-accent`                                    |
| `--chart-1`     | cyan        | `bg-[--chart-1]`, `text-[--chart-1]`                          |
| `--navy`        | dark purple | `bg-[--navy]` — navbar scrolled state only, never for buttons |
| `--muted`       | light grey  | `bg-muted`, `text-muted-foreground`                           |
| `--form-stroke` | dark purple | border + shadow on form inputs                                |

Background has a fixed grid pattern set in `globals.css` — never override `background` on `<html>` or `<body>`.

---

## TYPOGRAPHY

Fonts are set globally in `globals.css` — never import fonts in components. Use `src/lib/fonts.ts` for any font references.

| Role           | Font          | Variable         | When to use                                    |
| -------------- | ------------- | ---------------- | ---------------------------------------------- |
| Body / UI      | Space Grotesk | `--font-sans`    | Everything except h1/display/code              |
| Headings h2–h6 | display font  | `--font-heading` | Section headings                               |
| h1 / hero      | display font  | `--font-display` | h1 and large hero statements only              |
| Accent         | display font  | `--font-accent`  | Stats, numbers, callouts — impact moments only |
| Code           | Geist Mono    | `--font-mono`    | `<code>` and `<pre>` only                      |

Apply display/accent via Tailwind: `font-[family-name:var(--font-display)]`

**Type scale — fluid via clamp (set in globals.css):**

| Tag | Min     | Max      |
| --- | ------- | -------- |
| h1  | 2rem    | 5.5rem   |
| h2  | 1.75rem | 3rem     |
| h3  | 1.4rem  | 2.125rem |
| h4  | 1.1rem  | 1.625rem |
| p   | 0.9rem  | 1.075rem |

Never set `font-size: 62.5%` on html. Never override the clamp scale in components.

---

## DATE FORMATTING

Use **date-fns** only. Never use `toLocaleDateString()`, `Intl.DateTimeFormat`, or manual string concatenation.

All date helpers live in `src/lib/dates.ts` — never import date-fns directly in components.

Required display format: `1st Sep 2025`, `2nd Aug 2025`, `3rd Jan 2026`

```ts
// src/lib/dates.ts
import { format } from "date-fns";

export const DATE_FORMAT = "do MMM yyyy";

export function formatDate(date: Date | string | number): string {
  return format(new Date(date), DATE_FORMAT);
}
```

```ts
// in any component
import { formatDate } from "@/lib/dates";

formatDate(item.createdAt); // "1st Sep 2025"
```

Any new date helpers (relative time, ranges, etc.) must be added to `src/lib/dates.ts`, never inline.

---

## SECTION HEADINGS

Use `SectionHeading` for all section titles. Never build custom section headers.

```tsx
import { SectionHeading } from "@/components/shared";

<SectionHeading
  label="Featured" // optional — yellow badge, always uppercase, -rotate-2
  title="Section title"
  description="Optional subtitle."
  align="left" // "left" (default) | "center"
/>;
```

Never customise the label style. Never replicate this pattern with raw HTML.

---

## LAYOUT & SPACING

Use these container classes from `globals.css`:

| Class               | Max-width | Use for                |
| ------------------- | --------- | ---------------------- |
| `.container`        | 1280px    | Standard page content  |
| `.wrapper`          | 1536px    | Full-bleed sections    |
| `.container-narrow` | 768px     | Forms, focused content |

Padding scales automatically at breakpoints (1rem → 1.5rem → 2rem → 3rem).

Cards and sections: `rounded-2xl` minimum. Minimum `p-6` on cards.

Generous spacing — never cram colourful elements together.

---

## DESIGN LANGUAGE RULES

This project uses a **bold, colourful, playful aesthetic**. Every UI decision must reinforce this.

- Never default to grey/neutral when a colour variant exists
- Cards use dark border + offset shadow: `border-2 border-[oklch(0.18_0.12_280)] shadow-[4px_4px_0px_oklch(0.18_0.12_280)]`
- Form inputs use `--form-stroke` for border and shadow
- Buttons already have the sticker aesthetic built in — do not override their border-radius or shadow
- Prefer colourful variants over `outline` or `ghost` for primary interactions

---

## RULES CHECKLIST

Before writing or reviewing any UI code, verify:

- [ ] Only shadcn/ui components used — no custom primitives
- [ ] No raw hex or Tailwind colour palette classes (`bg-green-500` etc.)
- [ ] Button variant matches intended action (see table above)
- [ ] Auth button variants used only in navbar
- [ ] No font imports in components — only `src/lib/fonts.ts`
- [ ] Dates formatted via `formatDate()` from `src/lib/dates.ts`
- [ ] Section titles use `SectionHeading` from `@/components/shared`
- [ ] Layout uses `.container`, `.wrapper`, or `.container-narrow`
- [ ] No `background` override on `<html>` or `<body>`
