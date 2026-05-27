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

### Typography

- Headings: `font-extrabold`, `tracking-tight`, dark foreground 
  (`text-foreground`)
- Body: regular weight, `text-muted-foreground` for secondary text
- Never use more than 2 font sizes on a single screen

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
