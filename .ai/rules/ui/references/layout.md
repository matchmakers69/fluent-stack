# Layout & Spacing Standards

Use container classes from `globals.css`. Never use Tailwind's `max-w-*` for page layout.

❌ Incorrect:
```tsx
<div className="max-w-screen-xl mx-auto px-4">...</div>
<section style={{ maxWidth: "1280px" }}>...</section>
```

✅ Correct:
```tsx
<div className="container">...</div>
<section className="wrapper">...</section>
```

## Container Classes

| Class               | Max-width | Use for                |
| ------------------- | --------- | ---------------------- |
| `.container`        | 1280px    | Standard page content  |
| `.wrapper`          | 1536px    | Full-bleed sections    |
| `.container-narrow` | 768px     | Forms, focused content |

Padding scales automatically at breakpoints (1rem → 1.5rem → 2rem → 3rem).

## Cards & Sections

- `rounded-2xl` minimum on cards and sections
- Minimum `p-6` on cards
- Cards use dark border + offset shadow: `border-2 border-[oklch(0.18_0.12_280)] shadow-[4px_4px_0px_oklch(0.18_0.12_280)]`
- Form inputs use `--form-stroke` for border and shadow
- Generous spacing — never cram colourful elements together

## Design Language

This project uses a **bold, colourful, playful aesthetic**:
- Never default to grey/neutral when a colour variant exists
- Buttons already have the sticker aesthetic built in — do not override their border-radius or shadow
- Prefer colourful variants over `outline` or `ghost` for primary interactions
