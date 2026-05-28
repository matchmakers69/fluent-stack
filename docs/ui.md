# UI Coding Standards

> See /docs/architecture.md for folder structure and component organisation rules.

## Component Library

**Only shadcn/ui components may be used in this project.**

- Do not create custom UI components (buttons, inputs, modals, cards, badges, etc.).
- Do not use any other component library (MUI, Chakra, Radix primitives directly, etc.).
- If a needed component does not yet exist in the project, add it via the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- All shadcn components live in `src/components/ui/` — import from there.

## Date Formatting

Use **date-fns** for all date formatting. Do not use `new Date().toLocaleDateString()`, `Intl.DateTimeFormat`, or manual string concatenation for dates.

### Required Format

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format token with `format` from date-fns:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```

### Reusable Date Utilities — `src/lib/dates.ts`

All date-fns imports, format strings, and helper functions must live in **`src/lib/dates.ts`** and be exported from there. Do not import date-fns directly in components or pages, and do not duplicate format strings or helpers across files.

```ts
// src/lib/dates.ts
import { format } from "date-fns";

export const DATE_FORMAT = "do MMM yyyy";

export function formatDate(date: Date | string | number): string {
  return format(new Date(date), DATE_FORMAT);
}
```

Usage in a component:

```ts
import { formatDate } from "@/lib/dates";

formatDate(workout.createdAt); // "1st Sep 2025"
```

Any new date-related helpers (e.g. relative time, range formatting) must be added to `src/lib/dates.ts` and imported from there — never inline.
## Design Language

This project uses a bold, colourful, playful aesthetic. Every UI decision 
should reinforce this — never default to grey/neutral when a colour variant 
exists.

### Buttons

Buttons use a sticker aesthetic: `rounded-[14px]`, a dark border (`border-2 border-[oklch(0.18_0.12_280)]`), and an offset shadow (`shadow-[3px_3px_0px_oklch(0.18_0.12_280)]`) that deepens on hover (`hover:shadow-[4px_4px_0px_...]`). They also lift slightly on hover (`hover:-translate-y-0.5`). Font weight is `font-bold` (700).

Never use Tailwind radius scale (`rounded-2xl`, `rounded-lg` etc) for buttons — always use `rounded-[14px]` so the shape is independent of the `--radius` token.

Available variants and their intended use:

| Variant        | CSS token              | Use for                        |
|----------------|------------------------|--------------------------------|
| `default`      | `--primary` green      | Primary / most important CTA   |
| `secondary`    | `--secondary` yellow   | Secondary actions, highlights  |
| `pink`         | `--destructive`        | Warnings, delete, bold accent  |
| `lavender`     | `--accent`             | Soft actions, tags, categories |
| `cyan`         | `--chart-1`            | Info, links, neutral accent    |
| `auth-signin`  | deep navy              | Sign In — on dark navbar       |
| `auth-signup`  | purple                 | Sign Up — on dark navbar       |
| `auth-signout` | transparent            | Sign Out — on dark navbar      |
| `white`        | white bg, purple border | Outlined CTA, use on coloured backgrounds |

Auth variants use white border and white shadow. Use these exclusively for Clerk auth buttons in the navbar.

Never use `ghost` or `link` variants for visible UI buttons — only for 
icon-only controls or inline text actions.

Default size is `lg` (`h-11 px-5 text-lg` on desktop, `h-9 px-4 text-sm` on mobile) unless space is constrained.

To render a button as an `<a>` tag (e.g. for navigation), use the `asChild` prop:

```tsx
<Button asChild variant="yellow" size="lg">
  <a href="/path">Label</a>
</Button>
```

### SectionHeading component

Use SectionHeading for all section titles on the page.
Import from `@/components/shared`.

Props:
- `label` (optional) — small badge above the title; always yellow, no border-radius, uppercase, slightly rotated (`-rotate-2`). Never customise the label style.
- `title` — the main h2 heading
- `description` (optional) — muted subtitle text
- `align` — `left` (default) | `center`

Example:
```tsx
<SectionHeading
  label="Featured"
  title="Section title here"
  description="Optional description text."
/>
```

Never build custom section headers — always use this component.

### Typography

| Role     | Font              | Variable        | When to use                         |
|----------|-------------------|-----------------|-------------------------------------|
| Body/UI  | Outfit            | --font-sans     | Body text, buttons, links, UI       |
| Headings | Plus Jakarta Sans | --font-heading  | h1–h6, section titles, cards        |
| Display  | Archivo Black     | --font-display  | Hero titles, large statements       |
| Accent   | Anton             | --font-accent   | Stats, numbers, short bold callouts |
| Code     | Geist Mono        | --font-mono     | Code blocks, pre elements           |

Fluid type scale (clamp — min, fluid, max):

| Tag | Min      | Max      |
|-----|----------|----------|
| h1  | 3rem     | 5.5rem   |
| h2  | 2.25rem  | 3.75rem  |
| h3  | 1.75rem  | 2.5rem   |
| h4  | 1.375rem | 1.875rem |
| p   | 1.1rem   | 1.35rem  |

Rules:
- h1–h6 automatically use font-heading via globals.css
- Body, buttons, links use font-sans (Outfit) by default
- Never import fonts in components — use src/lib/fonts.ts
- For non-heading elements styled as headings add `font-heading` class explicitly
- font-mono only for code and pre elements
- Do NOT set font-size: 62.5% on html — Tailwind assumes 1rem = 16px. Use clamp() for fluid sizing instead.
- font-display and font-accent are for impact moments only — hero sections, large numbers, short punchy statements. Never use for body text, navigation or UI elements.
- Apply display/accent fonts via Tailwind: `font-[family-name:var(--font-display)]` / `font-[family-name:var(--font-accent)]`

### Colours

All colours come from CSS variables defined in `globals.css`. Never use 
raw hex or Tailwind's built-in colour palette (e.g. `bg-green-500`). 
Always use semantic tokens:

- `bg-primary` — green
- `bg-secondary` — yellow  
- `bg-destructive` — hot pink
- `bg-accent` — lavender
- `bg-[--chart-1]` — cyan
- `bg-[--navy]` — navbar scrolled state, never use for buttons

The background has a subtle grid pattern (set in `globals.css`) — 
do not override `background` on `<html>` or `<body>`.

### Spacing & Layout

- Cards and sections use `rounded-2xl` minimum
- Generous padding — minimum `p-6` on cards, `px-8` on page containers
- Colourful elements need breathing room — avoid cramped layouts
