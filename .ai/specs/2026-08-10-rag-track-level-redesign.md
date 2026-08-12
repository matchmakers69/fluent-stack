# RAG Redesign: Materiały per ścieżka + poziom

**Data:** 2026-08-10  
**Status:** Approved for planning  
**Zakres:** Filtrowanie RAG po ścieżce nauki i poziomie CEFR ucznia

---

## Problem

Obecny RAG przeszukuje wszystkie chunki bez rozróżnienia ścieżki ani poziomu. Przy rosnącej liczbie materiałów prowadzi to do zwracania nieadekwatnych fragmentów (np. słownictwo biznesowe dla maturzysty) i marnowania limitu 20 pytań/miesiąc na niskotrafny kontekst.

---

## Decyzje projektowe

| Temat | Decyzja |
|-------|---------|
| Podejście do schematu | Płaskie rozszerzenie tabeli `documents` (Podejście 1) |
| Typ kolumny `level` | `smallint` (A2=1, B1=2, B2=3, C1=4) — umożliwia `<=` w SQL |
| Typ kolumny `track` | `text` z walidacją TypeScript — elastyczniejsze niż `pgEnum` |
| Wartości `track` | `matura` / `it` / `business` / `general` |
| Materiały ogólne | Czwarta ścieżka `general` — dołączana do każdego zapytania RAG |
| Zakres poziomów w filtrze | `level <= userLevel` — uczeń widzi swój poziom + niższe |
| Fallback przy braku wyników | Token `NO_COURSE_MATERIAL` → model odpowiada z adnotacją |
| Obsługa błędu DB | Token `SEARCH_ERROR` → model przeprasza bez adnotacji |
| Brak profilu ucznia | HTTP 428 `PROFILE_REQUIRED` |
| Przekroczony limit | HTTP 429 `MONTHLY_LIMIT_REACHED` |
| Model AI | `gpt-4o-mini` — wystarczający dla tutoringu, ~10× tańszy od gpt-4o |
| Historia konwersacji | `MAX_HISTORY_MESSAGES = 20` (zamiast poprzednich 10) |
| Inkrementacja usage | `onFinish` — pytanie liczone tylko po dostarczeniu odpowiedzi |
| Race condition usage | Akceptowany trade-off MVP (patrz sekcja Ograniczenia) |
| Pole `topic` | Wolny tekst, czysto opisowy — nie używany w filtrach RAG |
| Zmiana profilu ucznia | Proste nadpisanie, bez historii. Nauczyciel może edytować w adminie |
| Migracja istniejących danych | Phrasal verbs C1 → `track='general'`, `level=4` |

---

## Schemat bazy danych

### Stałe współdzielone

```ts
// src/shared/lib/constants.ts
export const LEVEL_MAP = { A2: 1, B1: 2, B2: 3, C1: 4 } as const;
export type CefrLevel = keyof typeof LEVEL_MAP;
export type CefrLevelValue = (typeof LEVEL_MAP)[CefrLevel]; // 1 | 2 | 3 | 4

export const TRACK_VALUES = ["matura", "it", "business", "general"] as const;
export type Track = (typeof TRACK_VALUES)[number];
```

### Rozszerzenie tabeli `documents`

Dodać do istniejącej definicji (bez `DEFAULT` — wymagane przy każdym insercie):

```ts
track: text("track").notNull(),    // Track
level: smallint("level").notNull(), // CefrLevelValue
topic: text("topic"),              // opcjonalne, opisowe
```

Istniejący indeks HNSW pozostaje bez zmian.

### Nowa tabela `user_profile`

```ts
export const userProfile = pgTable("user_profile", {
  userId:    text("user_id").primaryKey(),
  track:     text("track").notNull(),
  level:     smallint("level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Nowa tabela `usage_tracking`

```ts
export const usageTracking = pgTable(
  "usage_tracking",
  {
    id:            serial("id").primaryKey(),
    userId:        text("user_id").notNull(),
    month:         text("month").notNull(),               // "YYYY-MM"
    questionsUsed: integer("questions_used").notNull().default(0),
    createdAt:     timestamp("created_at").defaultNow(),
  },
  (table) => [unique().on(table.userId, table.month)]
);
```

### Migracja istniejących danych

```sql
ALTER TABLE documents ADD COLUMN track text;
ALTER TABLE documents ADD COLUMN level smallint;
ALTER TABLE documents ADD COLUMN topic text;

UPDATE documents SET track = 'general', level = 4;

ALTER TABLE documents ALTER COLUMN track SET NOT NULL;
ALTER TABLE documents ALTER COLUMN level SET NOT NULL;
```

Trzy warstwy obrony przed pominięciem `track`/`level` przy nowych uploadach: kompilator TypeScript (brak DEFAULT = pole wymagane w `InsertDocument`), constraint `NOT NULL` w bazie, walidacja w Server Action.

---

## Logika wyszukiwania

### Zaktualizowana sygnatura `searchDocuments`

```ts
// src/features/rag/lib/searchRAG.ts
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
    .select({ id: documents.id, content: documents.content,
               sourceFileName: documents.sourceFileName, similarity })
    .from(documents)
    .where(and(
      or(eq(documents.track, track), eq(documents.track, "general")),
      lte(documents.level, level),
      gt(similarity, threshold)
    ))
    .orderBy(desc(similarity))
    .limit(limit);
}
```

Zapytanie zawsze łączy wyniki ze ścieżki ucznia oraz ścieżki `general`. `lte` realizuje decyzję o `<=` — uczeń B2 dostaje materiały A2+B1+B2 z własnej ścieżki i wszystkie poziomy `general`.

### Tokeny fallbacku

| Token | Znaczenie | Zachowanie modelu |
|-------|-----------|-------------------|
| `"NO_COURSE_MATERIAL"` | Brak trafień w ścieżce/poziomie ucznia | Odpowiada z wiedzy ogólnej, zaczyna od: `"⚠️ Odpowiadam z ogólnej wiedzy — brak materiałów kursu na ten temat w Twojej ścieżce."` |
| `"SEARCH_ERROR"` | Błąd połączenia z bazą | Krótkie przeprosiny, odpowiedź z wiedzy ogólnej bez adnotacji |

Semantyka tokenów żyje w system prompcie — brak osobnej logiki w kodzie.

---

## Chat API (`/api/chat`)

Route obsługuje **wyłącznie zalogowanych użytkowników z RAG**. Niezalogowani i FAQ to osobny endpoint (poza zakresem tej specyfikacji, opisany w PRD jako `/api/faq`, zero tokenów AI).

### Funkcje danych

```ts
// src/features/account/data/userProfile.ts
export async function getUserProfile(userId: string) {
  return db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });
}

// src/features/account/data/usage.ts
export async function getOrCreateUsage(userId: string, month: string) {
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

export async function incrementUsage(userId: string, month: string) {
  await db
    .update(usageTracking)
    .set({ questionsUsed: sql`${usageTracking.questionsUsed} + 1` })
    .where(and(eq(usageTracking.userId, userId), eq(usageTracking.month, month)));
}
```

### Pełny route handler

```ts
// src/app/api/chat/route.ts
import { auth } from "@clerk/nextjs/server";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages, streamText, UIMessage,
  tool, InferUITools, UIDataTypes, stepCountIs,
} from "ai";
import { z } from "zod";
import { searchDocuments } from "@/features/rag/lib/searchRAG";
import { getUserProfile } from "@/features/account/data/userProfile";
import { getOrCreateUsage, incrementUsage } from "@/features/account/data/usage";
import {
  LEVEL_MAP, type CefrLevel, type Track, type CefrLevelValue,
} from "@/shared/lib/constants";

const MAX_HISTORY_MESSAGES = 20;
const MONTHLY_QUESTION_LIMIT = 20;

// Definicja schematu narzędzia na poziomie modułu — wyłącznie dla inferencji typów.
// Execute jest stubem; runtime-owa wersja powstaje w handlerze jako domknięcie nad profile.
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

    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
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

---

## Zmiany UI

### Formularz upload (`/uploads`)

Trzy nowe pola przy uploadzie PDF — dziedziczone przez wszystkie chunki z pliku:

| Pole | Typ | Wymagane | Uwagi |
|------|-----|----------|-------|
| `track` | select | **tak** | Matura / IT / Business / Ogólny — brak opcji domyślnej |
| `level` | select | **tak** | A2 / B1 / B2 / C1 — brak opcji domyślnej |
| `topic` | text input | nie | Wolny tekst, opisowy. Nie używany w filtrach RAG. Przyszłościowo: rozważyć predefiniowaną listę jeśli pojawi się filtrowanie po temacie |

Walidacja w Server Action przed `insertDocuments`. Nauczyciel nie może pominąć `track` ani `level`.

### Onboarding ucznia

- **Trigger:** layout `(account)` sprawdza obecność `user_profile`. Brak → redirect do `/account/onboarding`.
- **Strona `/account/onboarding`:** wybór ścieżki (3 kafelki: Matura / IT / Business — bez `general`) + wybór poziomu (4 przyciski: A2 / B1 / B2 / C1 z krótkim opisem każdego).
- **Efekt:** Server Action tworzy `user_profile`, redirect do `/account`.
- **Widget czatu bez profilu:** baner z linkiem do onboardingu, pole wpisywania zablokowane. UI przechwytuje kod `428` z `/api/chat` i wyświetla baner zamiast streamu.

### Panel admina — edycja profilu ucznia

Nowa sekcja w `/uploads` (zakładka lub osobna strona, dostępna tylko dla admina):
- Lista użytkowników z aktualnym `track` i `level`.
- Inline selecty per użytkownik + przycisk "Zapisz".
- Server Action: proste nadpisanie `user_profile` bez historii zmian.

---

## Znane ograniczenia i świadome trade-offy

### Race condition w usage tracking

**Stan:** dwa równoległe requesty mogą obydwa przejść check `questionsUsed >= 20` przed inkrementem, co skutkuje `questionsUsed = 21` zamiast 20 (jedno pytanie ponad limit).

**Dlaczego nie naprawiono:** atomowy upsert z przedwczesnym inkrementem (`onConflictDoUpdate`) eliminuje race condition, ale liczy pytanie przed dostarczeniem odpowiedzi — jeśli stream się posypie, pytanie jest skonsumowane bez wartości dla ucznia. Przy limicie 20 pytań/miesiąc jest to odczuwalne. Podejście z `onFinish` jest bardziej sprawiedliwe dla użytkownika.

**Akceptowalność:** przy tej skali (jeden uczeń, limit 20/miesiąc) race condition jest skrajnie rzadki i mało dotkliwy (najwyżej 21 zamiast 20 pytań).

**Przyszłość:** jeśli limit stanie się krytyczy biznesowo (płatne plany), rozwiązanie: `SELECT FOR UPDATE` w transakcji lub architektura z kolejką.

---

## Poza zakresem tej specyfikacji

- FAQ chatbot dla niezalogowanych (osobny endpoint `/api/faq`, zero AI tokenów)
- Corrector jako oddzielny tryb chatbota
- Strefa Nauki (quiz, Corrector w `/account`)
- Filtrowanie RAG po `topic`
- Historia zmian profilu ucznia
- Płatne plany i zwiększone limity
