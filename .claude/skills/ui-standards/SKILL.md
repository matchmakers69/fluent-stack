---
name: ui-standards
description: UI coding standards for this Next.js project. Use when writing any UI code — components, pages, forms, layouts. Enforces shadcn/ui only, correct button variants, design tokens, typography, date formatting, and layout classes. Never use raw hex, Tailwind colour palette, or custom UI components.
---

## When to Apply

Use this skill whenever writing or reviewing:
- New components, pages, or layouts
- Buttons, forms, or interactive elements
- Any text display or date rendering
- Section headings or page structure

## Reference Files

Read the relevant file before writing code for that topic:

| Topic | File | Key rule |
| ----- | ---- | -------- |
| Component library | [components.md](references/components.md) | shadcn/ui only; `SectionHeading` for section titles |
| Button variants & sizes | [buttons.md](references/buttons.md) | Match variant to action; auth variants navbar-only |
| Colours & tokens | [colours.md](references/colours.md) | CSS tokens only — no hex, no Tailwind palette |
| Typography & fonts | [typography.md](references/typography.md) | No font imports in components; never override clamp scale |
| Date formatting | [dates.md](references/dates.md) | `formatDate()` from `src/lib/dates.ts` only |
| Layout & spacing | [layout.md](references/layout.md) | Use `.container`, `.wrapper`, `.container-narrow` |

## Rules Checklist

Before writing or reviewing any UI code, verify:

- [ ] Only shadcn/ui components used — no custom primitives
- [ ] No raw hex or Tailwind colour palette classes (`bg-green-500` etc.)
- [ ] Button variant matches intended action (see buttons.md)
- [ ] Auth button variants used only in navbar
- [ ] No font imports in components — only `src/lib/fonts.ts`
- [ ] Dates formatted via `formatDate()` from `src/lib/dates.ts`
- [ ] Section titles use `SectionHeading` from `@/components/shared`
- [ ] Layout uses `.container`, `.wrapper`, or `.container-narrow`
- [ ] No `background` override on `<html>` or `<body>`
