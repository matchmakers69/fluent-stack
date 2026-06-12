# Component Standards

Only shadcn/ui components. No exceptions.

❌ Incorrect:
```tsx
import { Button } from "@mui/material";
import { Button } from "@radix-ui/react-button";
// building a custom card from scratch with raw HTML
```

✅ Correct:
```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

## Rules

- Never create custom buttons, inputs, modals, cards, badges from scratch
- Never use MUI, Chakra, or Radix primitives directly
- All shadcn components live in `src/components/ui/` — import from there

## Adding a New Component

If a needed component doesn't exist yet, add it via CLI:
```bash
npx shadcn@latest add <component-name>
```

## SectionHeading

Use `SectionHeading` for all section titles. Never build custom section headers.

❌ Incorrect:
```tsx
<div>
  <span className="bg-yellow-400 text-xs uppercase">Featured</span>
  <h2>Section title</h2>
</div>
```

✅ Correct:
```tsx
import { SectionHeading } from "@/components/shared";

<SectionHeading
  label="Featured"        // optional — yellow badge, always uppercase, -rotate-2
  title="Section title"
  description="Optional subtitle."
  align="left"            // "left" (default) | "center"
/>
```

Never customise the label style. Never replicate this pattern with raw HTML.
