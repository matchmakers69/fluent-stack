# Date Formatting Standards

Use **date-fns** only. All date helpers live in `src/lib/dates.ts`.

❌ Incorrect:
```tsx
date.toLocaleDateString("en-GB")                         // native API
new Intl.DateTimeFormat("en").format(date)               // Intl
import { format } from "date-fns"; format(date, "do MMM yyyy") // direct import in component
```

✅ Correct:
```tsx
import { formatDate } from "@/lib/dates";

formatDate(item.createdAt); // "1st Sep 2025"
```

## Required Display Format

`1st Sep 2025`, `2nd Aug 2025`, `3rd Jan 2026`

## src/lib/dates.ts

```ts
import { format } from "date-fns";

export const DATE_FORMAT = "do MMM yyyy";

export function formatDate(date: Date | string | number): string {
  return format(new Date(date), DATE_FORMAT);
}
```

Any new date helpers (relative time, ranges, etc.) must be added to `src/lib/dates.ts`, never inline.
