---
name: data-mutations
description: Layered data mutation pattern for this Next.js project. Use when writing Server Actions, database helpers, or any code that creates, updates, or deletes data. Enforces the Server Action → src/data/ → Drizzle ORM chain. Never skip a layer.
---

## PATTERN

Every mutation follows this chain — no exceptions:

```
Client Component → Server Action (actions.ts) → src/data/ helper → Drizzle ORM
```

No layer may be skipped:

- No Drizzle imports in `actions.ts`
- No Drizzle imports in components
- No mutations outside `src/data/`

---

## SERVER ACTIONS

### File placement

One `actions.ts` per route directory, co-located with the route that uses it:

```
src/app/[locale]/(account)/materialy/
  page.tsx
  actions.ts   ← mutations for this route only
```

Never create a shared `actions.ts` or put actions in `src/lib/`.

### Function rules

- Parameters must be typed — never `FormData`
- Always validate with `ZodSchema.safeParse()` before any `src/data/` call
- Always return `{ success: true, data? }` or `{ success: false, error: string }` — never throw to the client
- Never call `redirect()` inside a Server Action — return the path and let the Client Component call `router.push()`

```ts
// actions.ts
"use server";

import { z } from "zod";
import { createLesson } from "@/data/lessons";

const CreateLessonSchema = z.object({
  title: z.string().min(1),
  scheduledAt: z.string().datetime(),
});

export async function createLessonAction(input: z.infer<typeof CreateLessonSchema>) {
  const parsed = CreateLessonSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  try {
    const lesson = await createLesson(parsed.data);
    return { success: true, data: lesson };
  } catch {
    return { success: false, error: "Failed to create lesson" };
  }
}
```

### Calling from a Client Component

```tsx
"use client";

import { useRouter } from "next/navigation";
import { createLessonAction } from "./actions";

export function CreateLessonForm() {
  const router = useRouter();

  async function handleSubmit(values: { title: string; scheduledAt: string }) {
    const result = await createLessonAction(values);
    if (result.success) {
      router.push("/lekcje");
    } else {
      // show result.error to the user
    }
  }
}
```

---

## DATABASE LAYER — `src/data/`

All Drizzle ORM queries live exclusively in `src/data/`. No file outside this directory may import `db` or write a Drizzle query.

### Auth ownership

Every helper resolves `auth()` internally — never accepts `userId` from the caller. Every write or delete on user-owned data must include `userId` in the `where` clause.

```ts
// src/data/lessons.ts — CORRECT
export async function deleteLesson(lessonId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db.delete(lessons).where(and(eq(lessons.id, lessonId), eq(lessons.userId, userId)));
}

// WRONG — never accept userId from caller
export async function deleteLesson(lessonId: string, userId: string) {
  await db.delete(lessons).where(eq(lessons.id, lessonId));
}
```

### Naming conventions

| Operation | Prefix   | Example        |
| --------- | -------- | -------------- |
| Read one  | `get`    | `getLesson`    |
| Read many | `list`   | `listLessons`  |
| Create    | `create` | `createLesson` |
| Update    | `update` | `updateLesson` |
| Delete    | `delete` | `deleteLesson` |

---

## ROUTE HANDLER EXCEPTIONS

Use `src/app/api/` Route Handlers only when a Server Action cannot satisfy the requirement:

| Scenario                                 | Reason                                              |
| ---------------------------------------- | --------------------------------------------------- |
| AI streaming responses                   | Server Actions cannot stream                        |
| Webhooks (Stripe, Clerk, etc.)           | Must be a public POST endpoint with raw body access |
| Contact forms and other public endpoints | May need to work without auth or session            |
| Custom HTTP headers or status codes      | Server Actions always return 200                    |

For everything else — use a Server Action.

---

## RULES CHECKLIST

Before writing or reviewing any mutation code, verify:

- [ ] No Drizzle query outside `src/data/`
- [ ] No `db` import in `actions.ts` or any component
- [ ] No `userId` accepted as parameter in `src/data/` helpers
- [ ] No `FormData` as Server Action parameter type
- [ ] No `redirect()` inside a Server Action
- [ ] Every action validates input with `safeParse()` before touching data layer
- [ ] Every user-owned query includes `userId` in `where` clause
- [ ] `actions.ts` is co-located with its route, not shared
