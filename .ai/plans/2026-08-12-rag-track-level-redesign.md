# RAG Track/Level Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Filter RAG results by student's learning track (matura/it/business/general) and CEFR level so every AI answer draws from materials appropriate to that student, and add a 20-question/month usage cap.

**Architecture:** Extend the `documents` table with `track`/`level`/`topic` columns; add `user_profile` and `usage_tracking` tables; gate the `/api/chat` route behind auth + profile + usage checks; require admins to classify documents at upload; new student onboarding flow sets the profile on first login.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM + Neon (neon-http), Clerk v7, Vercel AI SDK 5, gpt-4o-mini, next-intl v4, Zod, React 19

## Global Constraints

- All imports of `process.env` in `src/` must go through `@/env` — never `process.env` directly
- All Drizzle queries live exclusively in `src/features/*/data/` — never in actions, components, or route handlers
- All user-visible strings must be in both `messages/pl.json` and `messages/en.json`
- All new routes live under `src/app/[locale]/` — never outside the locale segment
- `track` values are exactly: `"matura"` | `"it"` | `"business"` | `"general"` (no others)
- `level` values map to: `A2=1`, `B1=2`, `B2=3`, `C1=4` (smallint in DB)
- The onboarding form offers 3 tracks only (matura / it / business — `general` is admin-only)
- `MONTHLY_QUESTION_LIMIT = 20`, `MAX_HISTORY_MESSAGES = 20`
- Model: `openai("gpt-4o-mini")`
- No test runner is configured — verify each task with `npm run build` and manual smoke tests

---

## File Map

**Create:**
- `src/shared/lib/constants.ts` — LEVEL_MAP, CefrLevel, CefrLevelValue, TRACK_VALUES, Track
- `migrations/0002_rag_track_level.sql` — SQL for new columns + tables + data migration
- `src/features/account/data/userProfile.ts` — getUserProfile, createUserProfile
- `src/features/account/data/usage.ts` — getOrCreateUsage, incrementUsage
- `src/app/[locale]/(account)/account/onboarding/page.tsx` — onboarding route
- `src/app/[locale]/(account)/account/onboarding/actions.ts` — createUserProfileAction
- `src/features/account/components/OnboardingForm.tsx` — track+level selection UI
- `src/features/admin/components/StudentProfileList.tsx` — admin student profile editor

**Modify:**
- `drizzle.config.ts` — fix `schema` path from `./src/db/schema.ts` → `./src/shared/db/schema.ts`
- `src/shared/db/schema.ts` — add columns to documents; add userProfile + usageTracking tables
- `src/features/rag/lib/searchRAG.ts` — SearchOptions type + filtered query
- `src/features/rag/data/documents.ts` — no code change, but InsertDocument type changes by schema update (verify only)
- `src/app/api/chat/route.ts` — full rewrite per spec
- `src/app/[locale]/(account)/layout.tsx` — add profile check + onboarding redirect
- `src/app/[locale]/(admin)/uploads/actions.ts` — accept track/level/topic in processPdfFile
- `src/features/marketing/components/PdfUpload.tsx` — add track/level/topic select fields
- `src/features/admin/hooks/usePdfUpload.ts` — pass track/level/topic to action
- `src/app/[locale]/(admin)/uploads/page.tsx` — add StudentProfileList section
- `src/features/chat/components/chat-widget.tsx` — handle 428 with onboarding banner
- `messages/pl.json` — new strings (uploads, onboarding, chat, admin)
- `messages/en.json` — new strings (uploads, onboarding, chat, admin)

---

## Task 1: Fix Drizzle config + add shared constants

**Files:**
- Modify: `drizzle.config.ts`
- Create: `src/shared/lib/constants.ts`

**Interfaces:**
- Produces: `LEVEL_MAP`, `CefrLevel`, `CefrLevelValue`, `TRACK_VALUES`, `Track` — imported by every subsequent task

- [ ] **Step 1: Fix drizzle.config.ts schema path**

The current config points to `./src/db/schema.ts` which does not exist. Change it to `./src/shared/db/schema.ts`:

```ts
// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./src/shared/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 2: Create shared constants file**

```ts
// src/shared/lib/constants.ts
export const LEVEL_MAP = { A2: 1, B1: 2, B2: 3, C1: 4 } as const;
export type CefrLevel = keyof typeof LEVEL_MAP;
export type CefrLevelValue = (typeof LEVEL_MAP)[CefrLevel]; // 1 | 2 | 3 | 4

export const TRACK_VALUES = ["matura", "it", "business", "general"] as const;
export type Track = (typeof TRACK_VALUES)[number];
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: no TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add drizzle.config.ts src/shared/lib/constants.ts
git commit -m "feat: fix drizzle config path + add CEFR/track shared constants"
```

---

## Task 2: Update DB schema + write migration

**Files:**
- Modify: `src/shared/db/schema.ts`
- Create: `migrations/0002_rag_track_level.sql`

**Interfaces:**
- Consumes: `CefrLevelValue`, `Track` semantics (smallint / text values from Task 1)
- Produces: Updated `InsertDocument` type (now requires `track` and `level`); `userProfile` table; `usageTracking` table

- [ ] **Step 1: Update schema.ts — add columns to documents + new tables**

```ts
// src/shared/db/schema.ts
import {
  pgTable,
  serial,
  text,
  vector,
  index,
  smallint,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Stores text chunks and their vector embeddings for RAG.
export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    sourceFileName: text("source_file_name"),
    embedding: vector("embedding", { dimensions: 1536 }),
    track: text("track").notNull(),
    level: smallint("level").notNull(),
    topic: text("topic"),
  },
  (table) => [index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops"))]
);

export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;

export const userProfile = pgTable("user_profile", {
  userId: text("user_id").primaryKey(),
  track: text("track").notNull(),
  level: smallint("level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertUserProfile = typeof userProfile.$inferInsert;
export type SelectUserProfile = typeof userProfile.$inferSelect;

export const usageTracking = pgTable(
  "usage_tracking",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    month: text("month").notNull(),
    questionsUsed: integer("questions_used").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [unique().on(table.userId, table.month)]
);

export type InsertUsageTracking = typeof usageTracking.$inferInsert;
export type SelectUsageTracking = typeof usageTracking.$inferSelect;
```

- [ ] **Step 2: Write the SQL migration**

```sql
-- migrations/0002_rag_track_level.sql

-- Extend documents table
ALTER TABLE documents ADD COLUMN track text;
ALTER TABLE documents ADD COLUMN level smallint;
ALTER TABLE documents ADD COLUMN topic text;

-- Migrate existing rows (phrasal verbs C1 → general track, level 4)
UPDATE documents SET track = 'general', level = 4;

-- Enforce NOT NULL after backfill
ALTER TABLE documents ALTER COLUMN track SET NOT NULL;
ALTER TABLE documents ALTER COLUMN level SET NOT NULL;

-- Create user_profile table
CREATE TABLE "user_profile" (
  "user_id" text PRIMARY KEY NOT NULL,
  "track" text NOT NULL,
  "level" smallint NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Create usage_tracking table
CREATE TABLE "usage_tracking" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "month" text NOT NULL,
  "questions_used" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  UNIQUE ("user_id", "month")
);
```

- [ ] **Step 3: Run the migration against the database**

Run: `npx drizzle-kit migrate` or apply the SQL directly via your database client.

If using psql: `psql $DATABASE_URL -f migrations/0002_rag_track_level.sql`

Expected: no errors; `\d documents` shows `track`, `level`, `topic` columns; `\dt` shows `user_profile` and `usage_tracking` tables.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: TypeScript sees the updated `InsertDocument` type — `track` and `level` are now required. Any existing `insertDocuments` call that omits them will fail to compile (that's expected — they get fixed in Task 6).

- [ ] **Step 5: Commit**

```bash
git add src/shared/db/schema.ts migrations/0002_rag_track_level.sql
git commit -m "feat: add track/level/topic to documents; add user_profile and usage_tracking tables"
```

---

## Task 3: Update searchDocuments

**Files:**
- Modify: `src/features/rag/lib/searchRAG.ts`

**Interfaces:**
- Consumes: `Track`, `CefrLevelValue` from `@/shared/lib/constants`; `documents` schema (Task 2)
- Produces: `SearchOptions` type; `searchDocuments(query, options)` — used by the chat route in Task 5

- [ ] **Step 1: Rewrite searchRAG.ts**

```ts
// src/features/rag/lib/searchRAG.ts
import { db } from "@/shared/db";
import { documents } from "@/shared/db/schema";
import { cosineDistance, sql, gt, desc, and, or, eq, lte } from "drizzle-orm";
import { getEmbedding } from "./embeddings";
import type { CefrLevelValue, Track } from "@/shared/lib/constants";

export type SearchOptions = {
  track: Track;
  level: CefrLevelValue;
  limit?: number;
  threshold?: number;
};

export async function searchDocuments(query: string, options: SearchOptions) {
  const { track, level, limit = 5, threshold = 0.5 } = options;
  const embedding = await getEmbedding(query);
  const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, embedding)})`;

  return db
    .select({
      id: documents.id,
      content: documents.content,
      sourceFileName: documents.sourceFileName,
      similarity,
    })
    .from(documents)
    .where(
      and(
        or(eq(documents.track, track), eq(documents.track, "general")),
        lte(documents.level, level),
        gt(similarity, threshold)
      )
    )
    .orderBy(desc(similarity))
    .limit(limit);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds; existing callers of `searchDocuments` will get a TS error since they pass `(query, limit, threshold)` — that's expected and fixed in Task 5.

- [ ] **Step 3: Commit**

```bash
git add src/features/rag/lib/searchRAG.ts
git commit -m "feat: filter RAG search by track+level; add general-track fallback"
```

---

## Task 4: Account data helpers

**Files:**
- Create: `src/features/account/data/userProfile.ts`
- Create: `src/features/account/data/usage.ts`

**Interfaces:**
- Consumes: `userProfile`, `usageTracking` tables (Task 2); `db` from `@/shared/db`
- Produces:
  - `getUserProfile(userId: string): Promise<SelectUserProfile | undefined>`
  - `createUserProfile(data: InsertUserProfile): Promise<SelectUserProfile>`
  - `getOrCreateUsage(userId: string, month: string): Promise<SelectUsageTracking>`
  - `incrementUsage(userId: string, month: string): Promise<void>`

- [ ] **Step 1: Create userProfile data helper**

```ts
// src/features/account/data/userProfile.ts
import { db } from "@/shared/db";
import { userProfile, type InsertUserProfile, type SelectUserProfile } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

export async function getUserProfile(userId: string): Promise<SelectUserProfile | undefined> {
  return db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });
}

export async function createUserProfile(data: InsertUserProfile): Promise<SelectUserProfile> {
  const [created] = await db.insert(userProfile).values(data).returning();
  return created;
}
```

- [ ] **Step 2: Create usage data helper**

```ts
// src/features/account/data/usage.ts
import { db } from "@/shared/db";
import { usageTracking, type SelectUsageTracking } from "@/shared/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function getOrCreateUsage(
  userId: string,
  month: string
): Promise<SelectUsageTracking> {
  const existing = await db.query.usageTracking.findFirst({
    where: and(eq(usageTracking.userId, userId), eq(usageTracking.month, month)),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(usageTracking)
    .values({ userId, month, questionsUsed: 0 })
    .returning();
  return created;
}

export async function incrementUsage(userId: string, month: string): Promise<void> {
  await db
    .update(usageTracking)
    .set({ questionsUsed: sql`${usageTracking.questionsUsed} + 1` })
    .where(and(eq(usageTracking.userId, userId), eq(usageTracking.month, month)));
}
```

- [ ] **Step 3: Register tables in the Drizzle db client for query builder**

The helpers use `db.query.userProfile` and `db.query.usageTracking`. Drizzle's relational query builder requires tables to be registered in the client. Update `src/shared/db/index.ts`:

```ts
// src/shared/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as schema from "./schema";

const db = drizzle(env.DATABASE_URL, { schema });

export { db };
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: no errors; `db.query.userProfile` and `db.query.usageTracking` resolve correctly.

- [ ] **Step 5: Commit**

```bash
git add src/features/account/data/userProfile.ts src/features/account/data/usage.ts src/shared/db/index.ts
git commit -m "feat: add userProfile and usage data helpers; register schema with Drizzle query builder"
```

---

## Task 5: Rewrite /api/chat route

**Files:**
- Modify: `src/app/api/chat/route.ts`

**Interfaces:**
- Consumes:
  - `auth()` from `@clerk/nextjs/server`
  - `getUserProfile(userId)` → Task 4
  - `getOrCreateUsage(userId, month)` → Task 4
  - `incrementUsage(userId, month)` → Task 4
  - `searchDocuments(query, options)` → Task 3
  - `LEVEL_MAP`, `Track`, `CefrLevelValue` → Task 1
- Produces: `ChaTools`, `ChatMessage` types (consumed by the chat widget in Task 8)

- [ ] **Step 1: Rewrite route.ts**

```ts
// src/app/api/chat/route.ts
import { auth } from "@clerk/nextjs/server";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { searchDocuments } from "@/features/rag/lib/searchRAG";
import { getUserProfile } from "@/features/account/data/userProfile";
import { getOrCreateUsage, incrementUsage } from "@/features/account/data/usage";
import type { CefrLevel, CefrLevelValue, Track } from "@/shared/lib/constants";
import { LEVEL_MAP } from "@/shared/lib/constants";

const MAX_HISTORY_MESSAGES = 20;
const MONTHLY_QUESTION_LIMIT = 20;

const _toolsShape = {
  searchKnowledgeBase: tool({
    description: "Search the course knowledge base for relevant materials.",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant documents."),
    }),
    execute: async (_: { query: string }): Promise<string> => "",
  }),
};

export type ChaTools = InferUITools<typeof _toolsShape>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChaTools>;

const LEVEL_LABELS = Object.fromEntries(
  Object.entries(LEVEL_MAP).map(([label, value]) => [value, label as CefrLevel])
) as Record<CefrLevelValue, CefrLevel>;

function buildSystemPrompt(level: CefrLevelValue): string {
  const levelLabel = LEVEL_LABELS[level];
  return [
    "You are a helpful English tutor assistant for FluentStack, an online English tutoring platform.",
    `The student's proficiency level is ${levelLabel}. Adjust your vocabulary, sentence complexity, and explanations to match this level.`,
    "You have access to a knowledge base of course materials tailored to this student's learning track.",
    "",
    "Search the knowledge base when the student asks about course content, grammar, vocabulary, or anything that might be covered in the materials. You may search more than once if a question requires multiple lookups.",
    "Do NOT search for simple greetings or questions clearly unrelated to English tutoring.",
    "",
    'If the knowledge base returns "NO_COURSE_MATERIAL", answer from your general English teaching knowledge and begin your response with:',
    '"⚠️ Odpowiadam z ogólnej wiedzy — brak materiałów kursu na ten temat w Twojej ścieżce."',
    "",
    'If the knowledge base returns "SEARCH_ERROR", apologize briefly and answer from general knowledge without the disclaimer.',
    "",
    "When search results are available, base your answer on them and cite the source document name if provided. Keep answers concise and focused.",
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      return Response.json({ error: "PROFILE_REQUIRED" }, { status: 428 });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = await getOrCreateUsage(userId, currentMonth);

    if (usage.questionsUsed >= MONTHLY_QUESTION_LIMIT) {
      return Response.json({ error: "MONTHLY_LIMIT_REACHED" }, { status: 429 });
    }

    const { messages }: { messages: ChatMessage[] } = await req.json();

    const tools = {
      searchKnowledgeBase: tool({
        description: "Search the course knowledge base for relevant materials.",
        inputSchema: z.object({
          query: z.string().describe("The search query to find relevant documents."),
        }),
        execute: async ({ query }: { query: string }): Promise<string> => {
          try {
            const results = await searchDocuments(query, {
              track: profile.track as Track,
              level: profile.level as CefrLevelValue,
            });
            if (results.length === 0) return "NO_COURSE_MATERIAL";
            return results
              .map((result, index) => {
                const source = result.sourceFileName
                  ? ` (source: ${result.sourceFileName})`
                  : "";
                return `[${index + 1}]${source}\n${result.content}`;
              })
              .join("\n\n");
          } catch (error) {
            console.error("Error searching knowledge base:", error);
            return "SEARCH_ERROR";
          }
        },
      }),
    };

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: buildSystemPrompt(profile.level as CefrLevelValue),
      stopWhen: stepCountIs(4),
      messages: await convertToModelMessages(messages.slice(-MAX_HISTORY_MESSAGES)),
      tools,
      onFinish: async () => {
        await incrementUsage(userId, currentMonth);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no TypeScript errors.

- [ ] **Step 3: Manual smoke test (requires DB with profile)**

Start dev server: `npm run dev`
- Open the app as a logged-in student **with** a `user_profile` row — chat should work and respond with level-adjusted answers.
- Open as a logged-in student **without** a `user_profile` row — chat API should return 428.
- Verify the AI searches the knowledge base and responses cite source files when available.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: gate chat behind profile+usage checks; add level-aware system prompt"
```

---

## Task 6: PDF upload with track/level/topic

**Files:**
- Modify: `src/app/[locale]/(admin)/uploads/actions.ts`
- Modify: `src/features/marketing/components/PdfUpload.tsx`
- Modify: `src/features/admin/hooks/usePdfUpload.ts`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: `Track`, `CefrLevelValue`, `TRACK_VALUES`, `LEVEL_MAP` from Task 1; `InsertDocument` (now requires track/level) from Task 2
- Produces: Updated `processPdfFile` action accepting `track`, `level`, `topic`

- [ ] **Step 1: Add i18n strings for upload fields**

Add to `messages/pl.json` inside the `"uploads"` key:

```json
"trackLabel": "Ścieżka",
"trackPlaceholder": "Wybierz ścieżkę",
"trackMatura": "Matura",
"trackIt": "IT / Programowanie",
"trackBusiness": "Business English",
"trackGeneral": "Ogólny",
"levelLabel": "Poziom CEFR",
"levelPlaceholder": "Wybierz poziom",
"topicLabel": "Temat (opcjonalnie)",
"topicPlaceholder": "Np. Phrasal verbs, conditionals…",
"trackRequired": "Wybierz ścieżkę",
"levelRequired": "Wybierz poziom"
```

Add to `messages/en.json` inside the `"uploads"` key:

```json
"trackLabel": "Track",
"trackPlaceholder": "Choose track",
"trackMatura": "Matura",
"trackIt": "IT / Programming",
"trackBusiness": "Business English",
"trackGeneral": "General",
"levelLabel": "CEFR Level",
"levelPlaceholder": "Choose level",
"topicLabel": "Topic (optional)",
"topicPlaceholder": "E.g. Phrasal verbs, conditionals…",
"trackRequired": "Please select a track",
"levelRequired": "Please select a level"
```

- [ ] **Step 2: Update the Server Action to accept track/level/topic**

```ts
// src/app/[locale]/(admin)/uploads/actions.ts
"use server";

import { z } from "zod";
import pdf from "pdf-parse";
import { insertDocuments } from "@/features/rag/data/documents";
import { generateEmbeddings } from "@/features/rag/lib/embeddings";
import { chunkContent } from "@/features/rag/lib/chunking";
import { TRACK_VALUES, LEVEL_MAP } from "@/shared/lib/constants";

const levelValues = Object.values(LEVEL_MAP) as [number, ...number[]];

const UploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.type === "application/pdf", { message: "File must be a PDF" }),
  track: z.enum(TRACK_VALUES),
  level: z.coerce.number().refine((v) => (levelValues as number[]).includes(v), {
    message: "Invalid level",
  }),
  topic: z.string().optional(),
});

export async function processPdfFile(
  file: File,
  track: string,
  level: number,
  topic?: string
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  const parsed = UploadSchema.safeParse({ file, track, level, topic });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const bytes = await parsed.data.file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfData = await pdf(buffer);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return { success: false, error: "PDF appears to be empty or has no extractable text" };
    }

    const chunks = await chunkContent(pdfData.text);
    const embeddings = await generateEmbeddings(chunks);

    const records = chunks.map((chunk, index) => ({
      content: chunk,
      sourceFileName: parsed.data.file.name,
      embedding: embeddings[index],
      track: parsed.data.track,
      level: parsed.data.level,
      topic: parsed.data.topic ?? null,
    }));
    await insertDocuments(records);

    return { success: true, message: `Successfully processed ${records.length} chunks` };
  } catch {
    return { success: false, error: "Failed to process PDF" };
  }
}
```

- [ ] **Step 3: Update usePdfUpload hook to accept and pass track/level/topic**

```ts
// src/features/admin/hooks/usePdfUpload.ts
"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { processPdfFile } from "@/app/[locale]/(admin)/uploads/actions";
import type { Track, CefrLevelValue } from "@/shared/lib/constants";

type UploadStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type UploadMeta = {
  track: Track;
  level: CefrLevelValue;
  topic?: string;
};

export function usePdfUpload(meta: UploadMeta | null) {
  const [status, setStatus] = useState<UploadStatus>({ type: "idle" });

  const processFile = useCallback(
    async (file: File) => {
      if (!meta) {
        setStatus({ type: "error", message: "Select track and level first" });
        return;
      }
      setStatus({ type: "loading" });
      const result = await processPdfFile(file, meta.track, meta.level, meta.topic);
      if (result.success) {
        setStatus({ type: "success", message: result.message });
      } else {
        setStatus({ type: "error", message: result.error });
      }
    },
    [meta]
  );

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        setStatus({ type: "error", message: "Only PDF files are accepted" });
        return;
      }
      if (accepted[0]) {
        processFile(accepted[0]);
      }
    },
    [processFile]
  );

  const dropzone = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: status.type === "loading",
  });

  const reset = useCallback(() => setStatus({ type: "idle" }), []);

  return { status, dropzone, reset };
}
```

- [ ] **Step 4: Update PdfUpload component with track/level/topic fields**

```tsx
// src/features/marketing/components/PdfUpload.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { usePdfUpload } from "@/features/admin/hooks/usePdfUpload";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2, FileUp, CheckCircle2, XCircle } from "lucide-react";
import { TRACK_VALUES, LEVEL_MAP } from "@/shared/lib/constants";
import type { Track, CefrLevelValue } from "@/shared/lib/constants";

export function PdfUpload() {
  const t = useTranslations("uploads");
  const [track, setTrack] = useState<Track | "">("");
  const [level, setLevel] = useState<CefrLevelValue | "">("");
  const [topic, setTopic] = useState("");

  const meta =
    track && level ? { track, level: level as CefrLevelValue, topic: topic || undefined } : null;

  const { status, dropzone, reset } = usePdfUpload(meta);
  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
    <div className="space-y-6">
      {/* Metadata fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="track">{t("trackLabel")}</Label>
          <select
            id="track"
            value={track}
            onChange={(e) => setTrack(e.target.value as Track | "")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t("trackPlaceholder")}</option>
            <option value="matura">{t("trackMatura")}</option>
            <option value="it">{t("trackIt")}</option>
            <option value="business">{t("trackBusiness")}</option>
            <option value="general">{t("trackGeneral")}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="level">{t("levelLabel")}</Label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value ? Number(e.target.value) as CefrLevelValue : "")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t("levelPlaceholder")}</option>
            {(Object.entries(LEVEL_MAP) as [string, number][]).map(([label, value]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="topic">{t("topicLabel")}</Label>
        <Input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t("topicPlaceholder")}
        />
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/60 hover:bg-muted/40",
          (status.type === "loading" || !meta) && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />

        {status.type === "loading" ? (
          <>
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">{t("processing")}</p>
          </>
        ) : (
          <>
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <FileUp className="size-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-bold">
                {isDragActive ? t("dropNow") : t("dropzone")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t("pdfOnly")}</p>
            </div>
            <Button variant="secondary" size="sm" type="button" disabled={!meta}>
              {t("browse")}
            </Button>
          </>
        )}
      </div>

      {status.type === "success" && (
        <Alert className="border-primary/40 bg-primary/10">
          <CheckCircle2 className="size-4 text-primary" />
          <AlertTitle>{t("successTitle")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{status.message}</span>
            <Button variant="lavender" size="xs" onClick={reset}>
              {t("uploadAnother")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status.type === "error" && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{status.message}</span>
            <Button variant="pink" size="xs" onClick={reset}>
              {t("tryAgain")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: TypeScript happy; `InsertDocument` now has required `track`/`level` fields and the records in `processPdfFile` satisfy them.

- [ ] **Step 6: Manual smoke test**

Start dev server. Navigate to `/uploads` as admin. Verify:
- Track and level selects appear above the dropzone
- Dropzone is disabled until both track and level are selected
- After uploading a PDF, open DB and confirm the new rows have `track` and `level` set

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale]/\(admin\)/uploads/actions.ts \
        src/features/marketing/components/PdfUpload.tsx \
        src/features/admin/hooks/usePdfUpload.ts \
        messages/pl.json messages/en.json
git commit -m "feat: require track/level/topic when uploading PDFs"
```

---

## Task 7: Student onboarding + account layout redirect

**Files:**
- Modify: `src/app/[locale]/(account)/layout.tsx`
- Create: `src/app/[locale]/(account)/account/onboarding/page.tsx`
- Create: `src/app/[locale]/(account)/account/onboarding/actions.ts`
- Create: `src/features/account/components/OnboardingForm.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: `getUserProfile(userId)` → Task 4; `createUserProfile(data)` → Task 4; `Track`, `CefrLevelValue`, `LEVEL_MAP` → Task 1
- Produces: `/account/onboarding` route; `createUserProfileAction` server action

- [ ] **Step 1: Add i18n strings for onboarding**

Add to `messages/pl.json` under a new `"onboarding"` key:

```json
"onboarding": {
  "title": "Skonfiguruj swój profil",
  "description": "Wybierz ścieżkę nauki i poziom, aby dostosować materiały do Twoich potrzeb.",
  "trackLabel": "Wybierz ścieżkę nauki",
  "levelLabel": "Wybierz swój poziom angielskiego",
  "submit": "Zacznij naukę",
  "saving": "Zapisywanie…",
  "trackMatura": "Matura",
  "trackMaturaDesc": "Przygotowanie do egzaminu maturalnego z angielskiego",
  "trackIt": "IT / Programowanie",
  "trackItDesc": "Angielski techniczny dla programistów i specjalistów IT",
  "trackBusiness": "Business English",
  "trackBusinessDesc": "Angielski biznesowy i komunikacja korporacyjna",
  "levelA2": "A2 – Podstawowy",
  "levelA2Desc": "Rozumiesz proste zdania, potrafisz się przedstawić.",
  "levelB1": "B1 – Średniozaawansowany",
  "levelB1Desc": "Radzisz sobie w codziennych sytuacjach, potrafisz opisać doświadczenia.",
  "levelB2": "B2 – Wyższy średniozaawansowany",
  "levelB2Desc": "Rozumiesz złożone teksty i swobodnie rozmawiasz z native speakerami.",
  "levelC1": "C1 – Zaawansowany",
  "levelC1Desc": "Płynnie posługujesz się angielskim w kontekście zawodowym i akademickim.",
  "trackRequired": "Wybierz ścieżkę nauki",
  "levelRequired": "Wybierz poziom"
}
```

Add to `messages/en.json` under a new `"onboarding"` key:

```json
"onboarding": {
  "title": "Set up your profile",
  "description": "Choose your learning track and level to get materials tailored to your needs.",
  "trackLabel": "Choose your learning track",
  "levelLabel": "Choose your English level",
  "submit": "Start learning",
  "saving": "Saving…",
  "trackMatura": "Matura",
  "trackMaturaDesc": "Preparation for the English matura exam",
  "trackIt": "IT / Programming",
  "trackItDesc": "Technical English for developers and IT professionals",
  "trackBusiness": "Business English",
  "trackBusinessDesc": "Business English and corporate communication",
  "levelA2": "A2 – Elementary",
  "levelA2Desc": "You understand simple sentences and can introduce yourself.",
  "levelB1": "B1 – Intermediate",
  "levelB1Desc": "You can handle everyday situations and describe experiences.",
  "levelB2": "B2 – Upper Intermediate",
  "levelB2Desc": "You understand complex texts and converse fluently with native speakers.",
  "levelC1": "C1 – Advanced",
  "levelC1Desc": "You use English fluently in professional and academic contexts.",
  "trackRequired": "Please select a track",
  "levelRequired": "Please select a level"
}
```

- [ ] **Step 2: Add chat strings for profile-required banner**

Add to `messages/pl.json` inside the `"chat"` key:

```json
"profileRequired": "Najpierw skonfiguruj swój profil, aby korzystać z czatu.",
"profileRequiredCta": "Skonfiguruj profil"
```

Add to `messages/en.json` inside the `"chat"` key:

```json
"profileRequired": "Set up your profile first to use the chat.",
"profileRequiredCta": "Set up profile"
```

- [ ] **Step 3: Create the Server Action**

```ts
// src/app/[locale]/(account)/account/onboarding/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createUserProfile } from "@/features/account/data/userProfile";
import { TRACK_VALUES, LEVEL_MAP } from "@/shared/lib/constants";

const levelValues = Object.values(LEVEL_MAP) as [number, ...number[]];

const OnboardingSchema = z.object({
  track: z.enum(["matura", "it", "business"] as const),
  level: z.coerce.number().refine((v) => (levelValues as number[]).includes(v), {
    message: "Invalid level",
  }),
});

export async function createUserProfileAction(
  input: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthenticated" };

  const parsed = OnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await createUserProfile({
      userId,
      track: parsed.data.track,
      level: parsed.data.level,
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save profile" };
  }
}
```

- [ ] **Step 4: Create the OnboardingForm component**

```tsx
// src/features/account/components/OnboardingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createUserProfileAction } from "@/app/[locale]/(account)/account/onboarding/actions";
import { Button } from "@/shared/components/ui/button";
import { LEVEL_MAP } from "@/shared/lib/constants";
import type { CefrLevelValue } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

type StudentTrack = "matura" | "it" | "business";

const STUDENT_TRACKS: StudentTrack[] = ["matura", "it", "business"];

const LEVELS: { label: string; value: CefrLevelValue }[] = [
  { label: "A2", value: LEVEL_MAP.A2 },
  { label: "B1", value: LEVEL_MAP.B1 },
  { label: "B2", value: LEVEL_MAP.B2 },
  { label: "C1", value: LEVEL_MAP.C1 },
];

export function OnboardingForm() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState<StudentTrack | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CefrLevelValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TRACK_META: Record<StudentTrack, { name: string; desc: string }> = {
    matura: { name: t("trackMatura"), desc: t("trackMaturaDesc") },
    it: { name: t("trackIt"), desc: t("trackItDesc") },
    business: { name: t("trackBusiness"), desc: t("trackBusinessDesc") },
  };

  const LEVEL_META: Record<CefrLevelValue, { name: string; desc: string }> = {
    [LEVEL_MAP.A2]: { name: t("levelA2"), desc: t("levelA2Desc") },
    [LEVEL_MAP.B1]: { name: t("levelB1"), desc: t("levelB1Desc") },
    [LEVEL_MAP.B2]: { name: t("levelB2"), desc: t("levelB2Desc") },
    [LEVEL_MAP.C1]: { name: t("levelC1"), desc: t("levelC1Desc") },
  };

  async function handleSubmit() {
    if (!selectedTrack || !selectedLevel) return;
    setSaving(true);
    setError(null);
    const result = await createUserProfileAction({ track: selectedTrack, level: selectedLevel });
    if (result.success) {
      router.push("/account");
    } else {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Track selection */}
      <div className="space-y-3">
        <p className="font-semibold">{t("trackLabel")}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {STUDENT_TRACKS.map((track) => (
            <button
              key={track}
              type="button"
              onClick={() => setSelectedTrack(track)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-colors",
                selectedTrack === track
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40"
              )}
            >
              <p className="font-semibold">{TRACK_META[track].name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{TRACK_META[track].desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Level selection */}
      <div className="space-y-3">
        <p className="font-semibold">{t("levelLabel")}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedLevel(value)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-colors",
                selectedLevel === value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40"
              )}
            >
              <p className="font-semibold">{LEVEL_META[value].name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{LEVEL_META[value].desc}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!selectedTrack || !selectedLevel || saving}
        className="w-full sm:w-auto"
      >
        {saving ? t("saving") : t("submit")}
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Create the onboarding page**

```tsx
// src/app/[locale]/(account)/account/onboarding/page.tsx
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/shared/components/layout/SectionHeading";
import { OnboardingForm } from "@/features/account/components/OnboardingForm";

export default async function OnboardingPage() {
  const t = await getTranslations("onboarding");

  return (
    <div className="container py-12">
      <SectionHeading
        label="Onboarding"
        title={t("title")}
        description={t("description")}
      />
      <div className="mt-10">
        <OnboardingForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update account layout to redirect when profile is missing**

The layout must redirect users without a `user_profile` to onboarding, but NOT redirect when they're already on the onboarding page (to avoid a redirect loop).

```ts
// src/app/[locale]/(account)/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/features/account/data/userProfile";
import { headers } from "next/headers";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/authentication/sign-in");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname.includes("/onboarding");

  if (!isOnboarding) {
    const profile = await getUserProfile(userId);
    if (!profile) redirect("/account/onboarding");
  }

  return <>{children}</>;
}
```

**Note on `x-pathname`:** Next.js does not set `x-pathname` by default. Add this to `src/proxy.ts` (the Clerk + i18n middleware) so the header is forwarded:

Check `src/proxy.ts` — if it uses `NextResponse.next()`, you can add `request.headers.set("x-pathname", request.nextUrl.pathname)` before returning. If it uses `clerkMiddleware`, use the `afterAuth` callback. The alternative is to use Next.js `usePathname()` approach, but since the layout is a Server Component it cannot use hooks. The cleanest server-side approach:

Add to `src/proxy.ts`:

```ts
// Inside the middleware, before returning:
const response = // ... existing response
response.headers.set("x-pathname", request.nextUrl.pathname);
return response;
```

Read `src/proxy.ts` first to understand the current structure before editing it, then add the header injection without changing the existing logic.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: no errors; onboarding route compiles; layout redirect logic is type-safe.

- [ ] **Step 8: Manual smoke test**

Start dev server.
- Log in as a student with **no** `user_profile` row — should redirect to `/account/onboarding`.
- Select a track and level on the onboarding page, submit — should redirect to `/account`.
- Reload `/account` — should NOT redirect again (profile now exists).

- [ ] **Step 9: Commit**

```bash
git add "src/app/[locale]/(account)/layout.tsx" \
        "src/app/[locale]/(account)/account/onboarding/page.tsx" \
        "src/app/[locale]/(account)/account/onboarding/actions.ts" \
        src/features/account/components/OnboardingForm.tsx \
        src/proxy.ts \
        messages/pl.json messages/en.json
git commit -m "feat: student onboarding flow — profile required before accessing account"
```

---

## Task 8: Chat widget — handle 428 (profile required)

**Files:**
- Modify: `src/features/chat/components/chat-widget.tsx`

**Interfaces:**
- Consumes: `ChaTools`, `ChatMessage` from `/api/chat/route.ts` (Task 5); i18n strings from Task 7 (Step 2)

- [ ] **Step 1: Update chat-widget to detect 428 and show onboarding banner**

The AI SDK's `useChat` hook doesn't expose HTTP status codes directly. We need to intercept the 428 response. Use the `fetch` option on `useChat` to capture non-streaming error responses.

```tsx
// src/features/chat/components/chat-widget.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useTranslations } from "next-intl";
import { MessageCircle, Send, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Textarea } from "@/shared/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

const MESSAGE_LIMIT = 20;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [profileRequired, setProfileRequired] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = useTranslations("chat");
  const { messages, sendMessage, status } = useChat({
    fetch: async (url, init) => {
      const response = await fetch(url, init);
      if (response.status === 428) {
        setProfileRequired(true);
        return new Response(null, { status: 200 });
      }
      return response;
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isLimitReached = messages.length >= MESSAGE_LIMIT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleChatbotSubmit = () => {
    const text = input.trim();
    if (!text || isLoading || isLimitReached || profileRequired) return;
    sendMessage({ text });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatbotSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <Card
          className={cn(
            "flex h-130 w-105 max-w-[calc(100vw-48px)] flex-col gap-0",
            "overflow-visible rounded-[16px] shadow-xl"
          )}
        >
          {/* Header */}
          <CardHeader className="flex shrink-0 flex-row items-center justify-between border-b px-5 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Chat</span>
              <span className="text-xs text-muted-foreground">{t("disclaimer")}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("closeLabel")}
              onClick={() => setOpen(false)}
              className="size-8 md:size-8 rounded-full"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>

          {/* Messages */}
          <CardContent className="min-h-0 flex-1 px-0 py-0">
            <ScrollArea className="h-full px-5 py-4">
              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="text-xs">
                        {message.role === "user" ? "U" : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-[16px] px-3 py-2 text-sm leading-relaxed",
                        message.role === "user"
                          ? "max-w-[75%] bg-primary text-primary-foreground"
                          : "max-w-[85%] bg-muted text-foreground"
                      )}
                    >
                      {message.parts.map((part, i) =>
                        part.type === "text" ? (
                          <span key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="text-xs">AI</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 rounded-[16px] bg-muted px-3 py-2">
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input / banners */}
          <CardFooter className="shrink-0 gap-2 border-t bg-transparent p-4">
            {profileRequired ? (
              <div className="w-full space-y-2 text-center">
                <p className="text-xs text-muted-foreground">{t("profileRequired")}</p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/account/onboarding">{t("profileRequiredCta")}</Link>
                </Button>
              </div>
            ) : isLimitReached ? (
              <p className="w-full text-center text-xs text-muted-foreground">
                Message limit reached. Please refresh to start a new conversation.
              </p>
            ) : (
              <>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="min-h-11 resize-none py-2.5 text-sm"
                  rows={2}
                />
                <Button
                  size="icon"
                  onClick={handleChatbotSubmit}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="size-8 md:size-8 rounded-full"
                >
                  <Send className="size-4" />
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Toggle FAB */}
      {open ? (
        <Button
          size="icon-lg"
          onClick={() => setOpen(false)}
          aria-label={t("closeLabel")}
          className="size-12 rounded-full shadow-lg"
        >
          <X className="size-5" />
        </Button>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          aria-label={t("openLabel")}
          className="h-12 rounded-full shadow-lg px-5 gap-2"
        >
          <MessageCircle className="size-5" />
          {t("openLabel")}
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: no errors; `Link` from `@/i18n/navigation` resolves; translation keys exist.

- [ ] **Step 3: Manual smoke test**

- Log in as a student without a profile; open the chat widget and send a message — the onboarding banner with a link to `/account/onboarding` should appear instead of an AI reply.
- Log in as a student with a profile; send a message — chat should work normally.

- [ ] **Step 4: Commit**

```bash
git add src/features/chat/components/chat-widget.tsx
git commit -m "feat: show onboarding banner in chat when student profile is missing"
```

---

## Task 9: Admin student profile editor

**Files:**
- Create: `src/features/admin/data/studentProfiles.ts`
- Create: `src/features/account/components/StudentProfileList.tsx`
- Modify: `src/app/[locale]/(admin)/uploads/page.tsx`
- Modify: `src/app/[locale]/(admin)/uploads/actions.ts`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: `userProfile` table (Task 2); `Track`, `CefrLevelValue`, `TRACK_VALUES`, `LEVEL_MAP` (Task 1)
- Produces:
  - `listStudentProfiles(): Promise<SelectUserProfile[]>` — all student profiles for admin view
  - `updateStudentProfileAction(userId, track, level)` — server action to overwrite a student's profile

- [ ] **Step 1: Add admin i18n strings**

Add to `messages/pl.json` inside the `"uploads"` key:

```json
"studentsTitle": "Profile uczniów",
"studentsNoProfiles": "Brak profili uczniów.",
"studentsSave": "Zapisz",
"studentsSaveSuccess": "Profil zaktualizowany.",
"studentsSaveError": "Nie udało się zaktualizować profilu."
```

Add to `messages/en.json` inside the `"uploads"` key:

```json
"studentsTitle": "Student Profiles",
"studentsNoProfiles": "No student profiles yet.",
"studentsSave": "Save",
"studentsSaveSuccess": "Profile updated.",
"studentsSaveError": "Failed to update profile."
```

- [ ] **Step 2: Create admin data helper**

```ts
// src/features/admin/data/studentProfiles.ts
import { db } from "@/shared/db";
import { userProfile, type SelectUserProfile } from "@/shared/db/schema";
import { eq } from "drizzle-orm";

export async function listStudentProfiles(): Promise<SelectUserProfile[]> {
  return db.select().from(userProfile).orderBy(userProfile.createdAt);
}

export async function updateStudentProfile(
  userId: string,
  track: string,
  level: number
): Promise<void> {
  await db
    .update(userProfile)
    .set({ track, level })
    .where(eq(userProfile.userId, userId));
}
```

- [ ] **Step 3: Add updateStudentProfileAction to uploads/actions.ts**

Append to the existing `actions.ts` (do not replace `processPdfFile`):

```ts
// Append at the bottom of src/app/[locale]/(admin)/uploads/actions.ts

import { auth } from "@clerk/nextjs/server";
import { updateStudentProfile } from "@/features/admin/data/studentProfiles";

const UpdateProfileSchema = z.object({
  userId: z.string().min(1),
  track: z.enum(TRACK_VALUES),
  level: z.coerce.number().refine((v) => (levelValues as number[]).includes(v), {
    message: "Invalid level",
  }),
});

export async function updateStudentProfileAction(
  input: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "admin") {
    return { success: false, error: "Forbidden" };
  }

  const parsed = UpdateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await updateStudentProfile(parsed.data.userId, parsed.data.track, parsed.data.level);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile" };
  }
}
```

**Note:** `TRACK_VALUES` and `levelValues` are already defined in the file from Task 6. The `auth` import also needs to be added at the top of the file if not already present.

- [ ] **Step 4: Create StudentProfileList component**

```tsx
// src/features/account/components/StudentProfileList.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { updateStudentProfileAction } from "@/app/[locale]/(admin)/uploads/actions";
import { TRACK_VALUES, LEVEL_MAP } from "@/shared/lib/constants";
import type { SelectUserProfile } from "@/shared/db/schema";
import type { Track, CefrLevelValue } from "@/shared/lib/constants";

type StudentRow = {
  userId: string;
  track: string;
  level: number;
};

export function StudentProfileList({ profiles }: { profiles: SelectUserProfile[] }) {
  const t = useTranslations("uploads");
  const [rows, setRows] = useState<StudentRow[]>(
    profiles.map((p) => ({ userId: p.userId, track: p.track, level: p.level }))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "success" | "error">>({});

  if (profiles.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("studentsNoProfiles")}</p>;
  }

  async function handleSave(userId: string) {
    const row = rows.find((r) => r.userId === userId);
    if (!row) return;
    setSaving(userId);
    const result = await updateStudentProfileAction({
      userId: row.userId,
      track: row.track,
      level: row.level,
    });
    setFeedback((prev) => ({ ...prev, [userId]: result.success ? "success" : "error" }));
    setSaving(null);
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.userId}
          className="flex flex-wrap items-center gap-3 rounded-xl border p-4"
        >
          <code className="flex-1 text-xs text-muted-foreground truncate">{row.userId}</code>

          <select
            value={row.track}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((r) => (r.userId === row.userId ? { ...r, track: e.target.value } : r))
              )
            }
            className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
          >
            {TRACK_VALUES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={row.level}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((r) =>
                  r.userId === row.userId ? { ...r, level: Number(e.target.value) } : r
                )
              )
            }
            className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
          >
            {(Object.entries(LEVEL_MAP) as [string, number][]).map(([label, value]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={() => handleSave(row.userId)}
            disabled={saving === row.userId}
          >
            {t("studentsSave")}
          </Button>

          {feedback[row.userId] === "success" && (
            <span className="text-xs text-green-600">{t("studentsSaveSuccess")}</span>
          )}
          {feedback[row.userId] === "error" && (
            <span className="text-xs text-destructive">{t("studentsSaveError")}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Update uploads/page.tsx to show the student editor**

```tsx
// src/app/[locale]/(admin)/uploads/page.tsx
import { getTranslations } from "next-intl/server";
import { PdfUpload } from "@/features/marketing/components/PdfUpload";
import { StudentProfileList } from "@/features/account/components/StudentProfileList";
import { listStudentProfiles } from "@/features/admin/data/studentProfiles";
import { SectionHeading } from "@/shared/components/layout/SectionHeading";

export default async function UploadsPage() {
  const [t, profiles] = await Promise.all([
    getTranslations("uploads"),
    listStudentProfiles(),
  ]);

  return (
    <main className="container space-y-16 pt-32">
      <section>
        <SectionHeading
          label={t("label")}
          title={t("title")}
          description={t("description")}
        />
        <div className="mt-8">
          <PdfUpload />
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("studentsTitle")}</h2>
        <StudentProfileList profiles={profiles} />
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: no TypeScript errors; all imports resolve.

- [ ] **Step 7: Manual smoke test**

Start dev server as admin. Navigate to `/uploads`. Scroll down to see the student profile list. Change a student's track or level and click Save — the success message should appear and the DB should reflect the change.

- [ ] **Step 8: Commit**

```bash
git add src/features/admin/data/studentProfiles.ts \
        src/features/account/components/StudentProfileList.tsx \
        "src/app/[locale]/(admin)/uploads/actions.ts" \
        "src/app/[locale]/(admin)/uploads/page.tsx" \
        messages/pl.json messages/en.json
git commit -m "feat: admin student profile editor — view and edit track/level per student"
```

---

## Self-Review: Spec Coverage Check

| Spec requirement | Task | Status |
|---|---|---|
| Flat extension of `documents` table (`track`, `level`, `topic`) | Task 2 | ✓ |
| `level` as `smallint`, `track` as `text` | Task 2 | ✓ |
| Track values: matura / it / business / general | Task 1 | ✓ |
| `general` track included in every RAG query | Task 3 | ✓ |
| `level <= userLevel` filter | Task 3 (`lte`) | ✓ |
| `NO_COURSE_MATERIAL` fallback token | Task 5 (route) | ✓ |
| `SEARCH_ERROR` fallback token | Task 5 (route) | ✓ |
| HTTP 428 `PROFILE_REQUIRED` | Task 5 (route) | ✓ |
| HTTP 429 `MONTHLY_LIMIT_REACHED` | Task 5 (route) | ✓ |
| Model `gpt-4o-mini` | Task 5 (route) | ✓ |
| `MAX_HISTORY_MESSAGES = 20` | Task 5 (route) | ✓ |
| `onFinish` usage increment | Task 5 (route) | ✓ |
| `user_profile` table | Task 2 | ✓ |
| `usage_tracking` table with unique constraint | Task 2 | ✓ |
| Migration of existing data → `general` / `level=4` | Task 2 (SQL) | ✓ |
| Upload form with track/level/topic fields | Task 6 | ✓ |
| Validation in Server Action before insertDocuments | Task 6 | ✓ |
| Onboarding page (`/account/onboarding`) | Task 7 | ✓ |
| Layout redirects profileless students to onboarding | Task 7 | ✓ |
| Onboarding shows 3 tracks only (no `general`) | Task 7 (action schema) | ✓ |
| Chat widget shows onboarding banner on 428 | Task 8 | ✓ |
| Admin panel — edit student track/level | Task 9 | ✓ |
| Simple overwrite (no history) | Task 9 | ✓ |
| Phrase verbs C1 → general/4 migration | Task 2 (SQL UPDATE) | ✓ |
| `topic` field — free text, not used in RAG filters | Tasks 2, 6 | ✓ |
| Race condition — accepted MVP trade-off | — | Documented in spec; no code needed |
| FAQ chatbot (niezalogowani) | — | Out of scope per spec |
| Corrector mode | — | Out of scope per spec |
