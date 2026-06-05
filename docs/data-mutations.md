# Data Mutations

All data mutations in this project follow a strict layered pattern:
**Server Action → `src/data/` helper → Drizzle ORM**.

No layer may be skipped. No Drizzle calls in actions, no mutations in components.

## Server Actions

Every mutation is a Server Action. There are no exceptions for mutations — use Route Handlers only where documented below.

### File placement

One `actions.ts` per route directory, co-located with the route that uses it:

```
src/app/[locale]/(dashboard)/materialy/
  page.tsx
  actions.ts      ← mutations for this route only
```

Do not create a shared `actions.ts` or put actions in `src/lib/`.

### Function signature rules

- Parameters must be typed — never `FormData`
- All parameters must be validated with Zod `safeParse` before any `src/data/` call
- Return `{ success: true, data? }` or `{ success: false, error: string }` — never throw to the client
- Never call `redirect()` inside a Server Action — return the target path and let the Client Component call `router.push()`

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
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

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

  // ...
}
```

## Database layer — `src/data/`

All Drizzle ORM queries live exclusively in `src/data/`. No file outside this directory may import `db` or write a Drizzle query.

### Auth ownership

Every helper calls `auth()` internally and never accepts `userId` from the caller. Every write or delete on user-owned data must include `userId` in the `where` clause.

```ts
// src/data/lessons.ts

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { lessons } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// CORRECT — auth resolved inside, userId in where clause
export async function deleteLesson(lessonId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db.delete(lessons).where(
    and(eq(lessons.id, lessonId), eq(lessons.userId, userId))
  );
}

// WRONG — accepts userId from caller, cannot be trusted
export async function deleteLesson(lessonId: string, userId: string) {
  await db.delete(lessons).where(eq(lessons.id, lessonId));
}
```

### Naming conventions

| Operation | Prefix | Example |
|-----------|--------|---------|
| Read one  | `get`  | `getLesson` |
| Read many | `list` | `listLessons` |
| Create    | `create` | `createLesson` |
| Update    | `update` | `updateLesson` |
| Delete    | `delete` | `deleteLesson` |

## Route Handler exceptions

Use a Route Handler (`src/app/api/`) only when a Server Action cannot satisfy the requirement:

| Scenario | Reason |
|----------|--------|
| AI streaming responses | Server Actions cannot stream |
| Webhooks (Stripe, Clerk, etc.) | Must be a public POST endpoint with raw body access |
| Contact forms and other public endpoints | May need to work without authentication or session |
| Custom HTTP headers or status codes | Server Actions always return 200 |

For everything else, use a Server Action. When in doubt, use a Server Action.

## Rules summary

- Never call Drizzle directly in `actions.ts` or any component
- Never accept `userId` as a parameter in `src/data/` helpers
- Never use `FormData` as a Server Action parameter type
- Never call `redirect()` inside a Server Action
- Always validate with `z.schema.safeParse()` before touching the DB
- Always include `userId` in `where` clauses for user-owned data
