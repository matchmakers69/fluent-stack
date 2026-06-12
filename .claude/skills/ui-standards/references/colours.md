# Colour Standards

All colours come from CSS variables defined in `globals.css`.

❌ Incorrect:
```tsx
<div className="bg-green-500 text-blue-600">...</div>
<div style={{ color: "#2563EB" }}>...</div>
```

✅ Correct:
```tsx
<div className="bg-primary text-secondary-foreground">...</div>
```

**Never use:**
- Raw hex values (`#2563EB`)
- Tailwind built-in palette (`bg-green-500`, `text-blue-600`)
- oklch values inline in components (use tokens)

## Token Table

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
