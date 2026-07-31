# About Me Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a light About Me hero (title, intro, booking CTA) on `/o-mnie` via a dedicated `AboutHero` component.

**Architecture:** Follow `ContactHero` for page chrome and `not-found` for the CTA pattern. Strings live in the existing `about` next-intl namespace. The marketing page only mounts `<AboutHero />`; metadata stays as-is.

**Tech Stack:** Next.js App Router, React 19, next-intl, shadcn `Button`, Playwright e2e (`e2e/` + `runSteps`).

**Spec:** `.ai/specs/2026-07-29-about-me-hero-design.md`

## Global Constraints

- Specs/plans live under `.ai/` (not `docs/superpowers/`).
- Only shadcn/ui primitives; no custom UI components.
- No raw hex or Tailwind colour palette classes.
- All user-visible strings from `messages/pl.json` and `messages/en.json` via next-intl.
- `Link` / navigation only from `@/i18n/navigation`.
- CTA target pathname key: `/umow-konsultacje` (EN URL: `/en/book-a-consultation`).
- About EN URL: `/en/about-me` (PL: `/o-mnie`).
- No photo, slider, `SectionHeading`, or home Hero animations.
- No unit test runner — verify with Playwright e2e + `npm run lint`.

## File map

| File                                           | Responsibility                           |
| ---------------------------------------------- | ---------------------------------------- |
| `messages/pl.json`, `messages/en.json`         | Add `about.intro`, `about.cta`           |
| `src/components/marketing/AboutHero.tsx`       | Hero UI                                  |
| `src/components/marketing/index.ts`            | Re-export `AboutHero`                    |
| `src/app/[locale]/(marketing)/o-mnie/page.tsx` | Mount hero                               |
| `e2e/about.spec.ts`                            | Visible behaviour: hero + CTA navigation |

---

### Task 1: i18n strings for about hero

**Files:**

- Modify: `messages/pl.json` (`about` object)
- Modify: `messages/en.json` (`about` object)

**Interfaces:**

- Consumes: existing `about.title`
- Produces: `about.intro`, `about.cta` (string keys under namespace `about`)

- [ ] **Step 1: Update Polish messages**

Replace the `about` block in `messages/pl.json` with:

```json
"about": {
  "title": "O mnie",
  "intro": "Jestem lektorem angielskiego online. Pomagam maturzystom, programistom i osobom uczącym się Business English oraz przygotowującym się do egzaminów Cambridge.",
  "cta": "Umów konsultację"
},
```

- [ ] **Step 2: Update English messages**

Replace the `about` block in `messages/en.json` with:

```json
"about": {
  "title": "About me",
  "intro": "I'm an online English teacher. I help Matura students, developers, and learners focused on Business English or Cambridge exam prep.",
  "cta": "Book a consultation"
},
```

- [ ] **Step 3: Sanity-check JSON**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/pl.json','utf8')); JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add messages/pl.json messages/en.json
git commit -m "$(cat <<'EOF'
docs(i18n): Add about hero intro and CTA strings

EOF
)"
```

(Only commit if the user asked for commits in this session; otherwise stop and report ready to commit.)

---

### Task 2: Failing e2e for about hero

**Files:**

- Create: `e2e/about.spec.ts`
- Reuse: `e2e/helpers/run-steps.ts`

**Interfaces:**

- Consumes: `runSteps(page, commands, steps)`
- Produces: Playwright coverage for EN about page hero + CTA

- [ ] **Step 1: Create `e2e/about.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { runSteps } from "./helpers/run-steps";
import type { Page } from "@playwright/test";

const commands: Record<string, (page: Page) => Promise<void>> = {
  "visit about page": async (page) => {
    await page.goto("/en/about-me");
  },
  "expect hero visible": async (page) => {
    await expect(page.getByRole("heading", { level: 1, name: "About me" })).toBeVisible();
    await expect(
      page.getByText(
        "I'm an online English teacher. I help Matura students, developers, and learners focused on Business English or Cambridge exam prep."
      )
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Book a consultation" })).toBeVisible();
  },
  "click book consultation": async (page) => {
    await page.getByRole("link", { name: "Book a consultation" }).click();
  },
  "expect booking page": async (page) => {
    await expect(page).toHaveURL(/\/en\/book-a-consultation\/?$/);
  },
};

test("about hero shows title, intro, and CTA", async ({ page }) => {
  await runSteps(page, commands, ["visit about page", "expect hero visible"]);
});

test("about CTA navigates to booking", async ({ page }) => {
  await runSteps(page, commands, [
    "visit about page",
    "click book consultation",
    "expect booking page",
  ]);
});
```

- [ ] **Step 2: Run e2e and confirm failure**

Run:

```bash
npm run test:e2e -- e2e/about.spec.ts
```

Expected: FAIL (missing intro/CTA and/or still showing only bare heading / wrong content). Do not implement UI yet.

- [ ] **Step 3: Commit** (if user requested commits)

```bash
git add e2e/about.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): Add about hero visibility and CTA coverage

EOF
)"
```

---

### Task 3: `AboutHero` component + page wiring

**Files:**

- Create: `src/components/marketing/AboutHero.tsx`
- Modify: `src/components/marketing/index.ts`
- Modify: `src/app/[locale]/(marketing)/o-mnie/page.tsx`

**Interfaces:**

- Consumes: `useTranslations("about")` keys `title` | `intro` | `cta`; `Button`; `Link` with `href="/umow-konsultacje"`
- Produces: `export function AboutHero(): JSX.Element`

- [ ] **Step 1: Create `AboutHero.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function AboutHero() {
  const t = useTranslations("about");

  return (
    <section id="about-page">
      <div className="px-8 md:px-16 lg:px-20 pt-6 md:pt-8">
        <h1>{t("title")}</h1>
        <p className="text-muted-foreground mt-4 mb-8 max-w-md">{t("intro")}</p>
        <Button asChild variant="default" size="lg">
          <Link href="/umow-konsultacje">{t("cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Export from marketing barrel**

In `src/components/marketing/index.ts`, add:

```ts
export { AboutHero } from "./AboutHero";
```

Keep existing exports intact.

- [ ] **Step 3: Wire the page**

Update `src/app/[locale]/(marketing)/o-mnie/page.tsx` so the default export is:

```tsx
import { AboutHero } from "@/components/marketing";

// ... existing metadata imports and generateMetadata unchanged ...

export default function AboutMePage() {
  return <AboutHero />;
}
```

Add the `AboutHero` import next to other imports; remove the hardcoded `<h1>O mnie</h1>`.

- [ ] **Step 4: Lint**

Run:

```bash
npm run lint
```

Expected: no new errors in the touched files.

- [ ] **Step 5: Run e2e and confirm pass**

Run:

```bash
npm run test:e2e -- e2e/about.spec.ts
```

Expected: both tests PASS.

- [ ] **Step 6: Commit** (if user requested commits)

```bash
git add src/components/marketing/AboutHero.tsx src/components/marketing/index.ts src/app/[locale]/(marketing)/o-mnie/page.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): Add light About Me hero with booking CTA

EOF
)"
```

---

## Spec coverage check

| Spec requirement                             | Task        |
| -------------------------------------------- | ----------- |
| `AboutHero` component                        | Task 3      |
| Export from `index.ts`                       | Task 3      |
| Page mounts hero; metadata unchanged         | Task 3      |
| `h1` + intro + CTA to booking                | Task 3      |
| Contact-like padding / left align / no image | Task 3      |
| `about.intro` + `about.cta` PL/EN            | Task 1      |
| Lint + visible verification                  | Tasks 2–3   |
| Out of scope (bio, photo, home Hero, SEO)    | Not planned |

## Placeholder / consistency self-review

- No TBD/TODO left in steps.
- CTA href consistently `/umow-konsultacje`; e2e asserts `/en/book-a-consultation`.
- Copy matches the approved spec verbatim.
- Commits are gated on explicit user request (project commit rule).
