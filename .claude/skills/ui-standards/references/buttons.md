# Button Standards

Import from `@/components/ui/button`. All buttons default to `type="button"` — only use `type="submit"` explicitly inside a form.

## Variants

❌ Incorrect — wrong variant, raw HTML, or Radix directly:
```tsx
<button className="bg-green-500">Submit</button>
<Button variant="ghost">Delete</Button>
```

✅ Correct:
```tsx
<Button variant="default">Submit</Button>
<Button variant="pink">Delete</Button>
```

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

## Sizes

| Size      | Height         | Use for                      |
| --------- | -------------- | ---------------------------- |
| `default` | h-10 / md:h-11 | Standard UI                  |
| `lg`      | h-11 / md:h-12 | Hero CTAs, prominent actions |
| `sm`      | h-9 / md:h-10  | Compact UI, inside cards     |
| `xs`      | h-8 / md:h-9   | Tight spaces, badges         |
| `icon`    | size-6/7       | Icon-only buttons            |

## Button as link

```tsx
<Button asChild variant="secondary" size="lg">
  <a href="/path">Label</a>
</Button>
```
