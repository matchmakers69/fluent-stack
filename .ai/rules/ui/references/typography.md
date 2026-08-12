# Typography Standards

Fonts are set globally in `globals.css` — never import fonts in components. Use `src/lib/fonts.ts` for any font references.

❌ Incorrect:
```tsx
import { Unbounded } from "next/font/google"; // font import in component
<p style={{ fontSize: "18px" }}>Text</p>      // manual font size
<h1 className="text-4xl">Title</h1>           // overriding the clamp scale
```

✅ Correct:
```tsx
<h1>Title</h1>  // clamp scale applied globally
<span className="font-[family-name:var(--font-display)]">Stat</span>
```

## Font Roles

| Role           | Font          | Variable         | When to use                                    |
| -------------- | ------------- | ---------------- | ---------------------------------------------- |
| Body / UI      | Space Grotesk | `--font-sans`    | Everything except h1/display/code              |
| Headings h2–h6 | display font  | `--font-heading` | Section headings                               |
| h1 / hero      | display font  | `--font-display` | h1 and large hero statements only              |
| Accent         | display font  | `--font-accent`  | Stats, numbers, callouts — impact moments only |
| Code           | Geist Mono    | `--font-mono`    | `<code>` and `<pre>` only                      |

Apply display/accent via Tailwind: `font-[family-name:var(--font-display)]`

## Type Scale

Fluid via clamp — set in `globals.css`. Never override in components.

| Tag | Min     | Max      |
| --- | ------- | -------- |
| h1  | 2rem    | 5.5rem   |
| h2  | 1.75rem | 3rem     |
| h3  | 1.4rem  | 2.125rem |
| h4  | 1.1rem  | 1.625rem |
| p   | 0.9rem  | 1.075rem |

Never set `font-size: 62.5%` on html. Never override the clamp scale in components.
