# Refactor fluent-stack: monolith → feature-driven architecture

## Context

**Goal:** Move from a layer-by-type layout (`components/`, `lib/`, `hooks/`, `data/`, `db/`) to a feature-driven layout (`features/<feature>/` + `shared/`) with zero logic changes.

**Current file counts per layer dir (movable files only):**
| Dir | Files |
|-----|-------|
| `src/components/auth/` | 7 components + 1 barrel |
| `src/components/marketing/` | 8 components + 1 barrel |
| `src/components/account/` | 3 components + 1 barrel |
| `src/components/shared/` | 9 layout components + 1 barrel |
| `src/components/ui/` | 12 shadcn primitives |
| `src/components/booking/` | empty barrel only |
| `src/components/dashboard/` | empty barrel only |
| `src/components/chat/` | 1 file |
| `src/lib/` | 9 files + 2 validations |
| `src/hooks/` | 1 file + empty barrel |
| `src/data/` | 1 file |
| `src/db/` | 2 files |
| `src/types/` | empty |

**Total movable files: ~60**

**Locked decisions:**
1. Strategy: **big-bang** (one branch, all steps in sequence)
2. Barrel files: **remove** (direct full-path imports via `@/` alias everywhere)
3. i18n placement: **keep at `src/i18n/`** (next.config.ts references it directly)
4. Contact scope: **merged into `marketing`** feature

---

## Verified facts

- **Alias**: `@/*` → `./src/*` (single glob). Moving to `src/features/` and `src/shared/` requires **zero alias changes**.
- **Tailwind v4**: uses `@import "tailwindcss"` with automatic content detection — **no content glob to update**.
- **next.config.ts** hardcodes `./src/i18n/request.ts` — `i18n/` stays in place.
- **No Jest/Vitest** — TypeScript (`npx tsc --noEmit`) is the sole verification gate.
- **No platform-suffix file pairs** — no `.web.ts`/`.ios.tsx` risks.
- **`src/components/shared` barrel** is currently imported by ~6 files using named re-exports. These need manual conversion to direct-path imports (sed cannot split one barrel import into many individual imports).
- **`src/db`** is currently imported by `src/data/documents.ts` and `src/lib/searchRAG.ts`.

**Source dir for greps:** `$SRC_DIRS = src`

---

## Target structure

```
src/
├── app/                                  # UNCHANGED — Next.js routing, DO NOT MOVE
│   ├── [locale]/
│   │   ├── (marketing)/                  # thin wrappers, imports rewritten only
│   │   ├── (auth)/
│   │   ├── (account)/
│   │   ├── (admin)/
│   │   ├── (booking)/
│   │   └── layout.tsx
│   ├── api/
│   ├── oauth/
│   └── .well-known/
│
├── shared/                               # cross-cutting; NEVER imports from features/
│   ├── components/
│   │   ├── ui/                          # shadcn/ui primitives (was components/ui/)
│   │   └── layout/                      # Navbar, Footer, Logo, etc. (was components/shared/)
│   ├── lib/
│   │   ├── utils.ts                     # cn() (was lib/utils.ts)
│   │   ├── fonts.ts                     # (was lib/fonts.ts)
│   │   ├── seo.ts                       # (was lib/seo.ts)
│   │   └── structured-data.ts           # (was lib/structured-data.ts)
│   └── db/
│       ├── index.ts                     # Drizzle client (was db/index.ts)
│       └── schema.ts                    # Drizzle schema + pgvector (was db/schema.ts)
│
├── features/
│   ├── auth/
│   │   └── components/                  # SignInForm, SignUpForm, ForgotPasswordForm,
│   │                                     # GoogleSignInButton, CredentialColumn,
│   │                                     # HeroAuthColumn, HeroContent
│   ├── marketing/
│   │   ├── components/                  # Hero, HeroHeading, HeroSlider, ContactForm,
│   │   │                                 # ContactHero, ContactSocialLinks, PdfUpload,
│   │   │                                 # TypewritingSlogan
│   │   └── lib/
│   │       ├── submitContactForm.ts     # (was lib/submitContactForm.ts)
│   │       └── validations/
│   │           └── contact.ts           # (was lib/validations/contact.ts)
│   ├── account/
│   │   ├── components/                  # ProfileCard, ProfileForm, ProfileAvatarUpload
│   │   └── lib/
│   │       └── validations/
│   │           └── profile.ts           # (was lib/validations/profile.ts)
│   ├── chat/
│   │   └── components/
│   │       └── chat-widget.tsx          # (was components/chat/chat-widget.tsx)
│   ├── rag/
│   │   ├── lib/
│   │   │   ├── embeddings.ts            # (was lib/embeddings.ts)
│   │   │   ├── searchRAG.ts             # (was lib/searchRAG.ts)
│   │   │   └── chunking.ts              # (was lib/chunking.ts)
│   │   └── data/
│   │       └── documents.ts             # (was data/documents.ts)
│   └── admin/
│       ├── hooks/
│       │   └── usePdfUpload.ts          # (was hooks/usePdfUpload.ts)
│       └── lib/
│           └── jira.ts                  # (was lib/jira.ts)
│
├── i18n/                                # UNCHANGED — referenced by next.config.ts
├── env.ts                               # UNCHANGED
└── proxy.ts                             # UNCHANGED (Clerk + next-intl middleware)
```

**Inviolable rule:** `shared/` code must NEVER import from `features/`. Verify with grep before each commit.

---

## Feature inventory

### Does NOT move
| File/Dir | Reason |
|----------|--------|
| `src/app/**` | Next.js framework routing |
| `src/i18n/` | Hardcoded in `next.config.ts` |
| `src/env.ts` | Project-root environment singleton |
| `src/proxy.ts` | Middleware-equivalent, framework entrypoint |

### shared/db (Step 1)
| From | To |
|------|----|
| `src/db/index.ts` | `src/shared/db/index.ts` |
| `src/db/schema.ts` | `src/shared/db/schema.ts` |

### shared/lib (Step 2)
| From | To |
|------|----|
| `src/lib/utils.ts` | `src/shared/lib/utils.ts` |
| `src/lib/fonts.ts` | `src/shared/lib/fonts.ts` |
| `src/lib/seo.ts` | `src/shared/lib/seo.ts` |
| `src/lib/structured-data.ts` | `src/shared/lib/structured-data.ts` |

### shared/components (Step 3)
| From | To |
|------|----|
| `src/components/ui/` (whole dir, 12 files) | `src/shared/components/ui/` |
| `src/components/shared/AuthNavbar.tsx` | `src/shared/components/layout/AuthNavbar.tsx` |
| `src/components/shared/Footer.tsx` | `src/shared/components/layout/Footer.tsx` |
| `src/components/shared/HamburgerButton.tsx` | `src/shared/components/layout/HamburgerButton.tsx` |
| `src/components/shared/LanguageSwitcher.tsx` | `src/shared/components/layout/LanguageSwitcher.tsx` |
| `src/components/shared/Logo.tsx` | `src/shared/components/layout/Logo.tsx` |
| `src/components/shared/Navbar.tsx` | `src/shared/components/layout/Navbar.tsx` |
| `src/components/shared/SectionHeading.tsx` | `src/shared/components/layout/SectionHeading.tsx` |
| `src/components/shared/TextReveal.tsx` | `src/shared/components/layout/TextReveal.tsx` |
| `src/components/shared/UserMenu.tsx` | `src/shared/components/layout/UserMenu.tsx` |
| `src/components/shared/index.ts` | **DELETE** (removing barrel) |

### features/auth (Step 4)
| From | To |
|------|----|
| `src/components/auth/CredentialColumn.tsx` | `src/features/auth/components/CredentialColumn.tsx` |
| `src/components/auth/ForgotPasswordForm.tsx` | `src/features/auth/components/ForgotPasswordForm.tsx` |
| `src/components/auth/GoogleSignInButton.tsx` | `src/features/auth/components/GoogleSignInButton.tsx` |
| `src/components/auth/HeroAuthColumn.tsx` | `src/features/auth/components/HeroAuthColumn.tsx` |
| `src/components/auth/HeroContent.tsx` | `src/features/auth/components/HeroContent.tsx` |
| `src/components/auth/SignInForm.tsx` | `src/features/auth/components/SignInForm.tsx` |
| `src/components/auth/SignUpForm.tsx` | `src/features/auth/components/SignUpForm.tsx` |
| `src/components/auth/index.ts` | **DELETE** (removing barrel) |

### features/marketing (Step 5)
| From | To |
|------|----|
| `src/components/marketing/ContactForm.tsx` | `src/features/marketing/components/ContactForm.tsx` |
| `src/components/marketing/ContactHero.tsx` | `src/features/marketing/components/ContactHero.tsx` |
| `src/components/marketing/ContactSocialLinks.tsx` | `src/features/marketing/components/ContactSocialLinks.tsx` |
| `src/components/marketing/Hero.tsx` | `src/features/marketing/components/Hero.tsx` |
| `src/components/marketing/HeroHeading.tsx` | `src/features/marketing/components/HeroHeading.tsx` |
| `src/components/marketing/HeroSlider.tsx` | `src/features/marketing/components/HeroSlider.tsx` |
| `src/components/marketing/PdfUpload.tsx` | `src/features/marketing/components/PdfUpload.tsx` |
| `src/components/marketing/TypewritingSlogan.tsx` | `src/features/marketing/components/TypewritingSlogan.tsx` |
| `src/components/marketing/index.ts` | **DELETE** (removing barrel) |
| `src/lib/submitContactForm.ts` | `src/features/marketing/lib/submitContactForm.ts` |
| `src/lib/validations/contact.ts` | `src/features/marketing/lib/validations/contact.ts` |

### features/account (Step 6)
| From | To |
|------|----|
| `src/components/account/ProfileAvatarUpload.tsx` | `src/features/account/components/ProfileAvatarUpload.tsx` |
| `src/components/account/ProfileCard.tsx` | `src/features/account/components/ProfileCard.tsx` |
| `src/components/account/ProfileForm.tsx` | `src/features/account/components/ProfileForm.tsx` |
| `src/components/account/index.ts` | **DELETE** (removing barrel) |
| `src/lib/validations/profile.ts` | `src/features/account/lib/validations/profile.ts` |

### features/rag (Step 7)
| From | To |
|------|----|
| `src/lib/embeddings.ts` | `src/features/rag/lib/embeddings.ts` |
| `src/lib/searchRAG.ts` | `src/features/rag/lib/searchRAG.ts` |
| `src/lib/chunking.ts` | `src/features/rag/lib/chunking.ts` |
| `src/data/documents.ts` | `src/features/rag/data/documents.ts` |

### features/chat (Step 8)
| From | To |
|------|----|
| `src/components/chat/chat-widget.tsx` | `src/features/chat/components/chat-widget.tsx` |

### features/admin (Step 9)
| From | To |
|------|----|
| `src/hooks/usePdfUpload.ts` | `src/features/admin/hooks/usePdfUpload.ts` |
| `src/lib/jira.ts` | `src/features/admin/lib/jira.ts` |

### Empty files to delete (Step 10)
- `src/components/booking/index.ts`
- `src/components/dashboard/index.ts`
- `src/hooks/index.ts`
- `src/types/index.ts`

### Empty dirs to delete (Step 10)
After all moves: `src/components/`, `src/lib/`, `src/data/`, `src/hooks/`, `src/db/`, `src/types/`

---

## Migration order

| Step | Scope | Rationale |
|------|-------|-----------|
| 0 | Baseline | Capture current tsc error state |
| 1 | `shared/db/` | Infrastructure first; establishes the `shared/` → no-features-import rule |
| 2 | `shared/lib/` | Heaviest step (touches nearly every file); doing it early prevents double-rewriting later |
| 3 | `shared/components/ui/` + `layout/` | Primitives used everywhere; must move before features reference new paths |
| 4 | `features/auth/` | Small, self-contained feature; no inter-feature dependencies |
| 5 | `features/marketing/` | Includes contact logic (merged); also self-contained |
| 6 | `features/account/` | Self-contained; depends only on shared |
| 7 | `features/rag/` | Depends on `shared/db`; must come after Step 1 |
| 8 | `features/chat/` | Depends on rag (api/chat/route.ts imports searchRAG); rag moves in Step 7 |
| 9 | `features/admin/` | Smallest; depends on rag (chunking, embeddings) which moved in Step 7 |
| 10 | Cleanup | Delete empty barrel files, empty dirs, update CLAUDE.md |

---

## Step mechanics

### Baseline (before Step 1)

```bash
git checkout -b refactor/feature-driven
npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort > /tmp/tsc-baseline.txt
cat /tmp/tsc-baseline.txt   # inspect — record any pre-existing errors
```

**After each step**, verify no new errors:
```bash
npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
```
If the diff shows only lines where the error message quotes a moved module path (legitimately changed), refresh the baseline.

---

### Step 1 — shared/db

```bash
mkdir -p src/shared/db
git mv src/db/index.ts src/shared/db/index.ts
git mv src/db/schema.ts src/shared/db/schema.ts

# Rewrite imports
grep -rl '@/db"' src | xargs sed -i '' 's|@/db"|@/shared/db"|g'
grep -rl "@/db'" src | xargs sed -i '' "s|@/db'|@/shared/db'|g"
grep -rl '@/db/schema"' src | xargs sed -i '' 's|@/db/schema"|@/shared/db/schema"|g'
grep -rl "@/db/schema'" src | xargs sed -i '' "s|@/db/schema'|@/shared/db/schema'|g"

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(infra): move db to shared/db"
```

---

### Step 2 — shared/lib

```bash
mkdir -p src/shared/lib

git mv src/lib/utils.ts src/shared/lib/utils.ts
git mv src/lib/fonts.ts src/shared/lib/fonts.ts
git mv src/lib/seo.ts src/shared/lib/seo.ts
git mv src/lib/structured-data.ts src/shared/lib/structured-data.ts

# Rewrite imports (anchored to avoid hitting lib/embeddings etc.)
grep -rl '@/lib/utils"' src | xargs sed -i '' 's|@/lib/utils"|@/shared/lib/utils"|g'
grep -rl "@/lib/utils'" src | xargs sed -i '' "s|@/lib/utils'|@/shared/lib/utils'|g"
grep -rl '@/lib/fonts"' src | xargs sed -i '' 's|@/lib/fonts"|@/shared/lib/fonts"|g'
grep -rl "@/lib/fonts'" src | xargs sed -i '' "s|@/lib/fonts'|@/shared/lib/fonts'|g"
grep -rl '@/lib/seo"' src | xargs sed -i '' 's|@/lib/seo"|@/shared/lib/seo"|g'
grep -rl "@/lib/seo'" src | xargs sed -i '' "s|@/lib/seo'|@/shared/lib/seo'|g"
grep -rl '@/lib/structured-data"' src | xargs sed -i '' 's|@/lib/structured-data"|@/shared/lib/structured-data"|g'
grep -rl "@/lib/structured-data'" src | xargs sed -i '' "s|@/lib/structured-data'|@/shared/lib/structured-data'|g"

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(shared): move lib utilities to shared/lib"
```

---

### Step 3 — shared/components/ui + layout

```bash
mkdir -p src/shared/components/ui
mkdir -p src/shared/components/layout

# ui/ — wholesale dir move
git mv src/components/ui src/shared/components/ui
# (git mv on a dir moves its contents; if it fails, move files individually)

# layout/ — move each file from components/shared/
git mv src/components/shared/AuthNavbar.tsx src/shared/components/layout/AuthNavbar.tsx
git mv src/components/shared/Footer.tsx src/shared/components/layout/Footer.tsx
git mv src/components/shared/HamburgerButton.tsx src/shared/components/layout/HamburgerButton.tsx
git mv src/components/shared/LanguageSwitcher.tsx src/shared/components/layout/LanguageSwitcher.tsx
git mv src/components/shared/Logo.tsx src/shared/components/layout/Logo.tsx
git mv src/components/shared/Navbar.tsx src/shared/components/layout/Navbar.tsx
git mv src/components/shared/SectionHeading.tsx src/shared/components/layout/SectionHeading.tsx
git mv src/components/shared/TextReveal.tsx src/shared/components/layout/TextReveal.tsx
git mv src/components/shared/UserMenu.tsx src/shared/components/layout/UserMenu.tsx
rm src/components/shared/index.ts   # delete barrel

# Rewrite ui/ imports (directory-wide, trailing slash)
grep -rl '@/components/ui/' src | xargs sed -i '' 's|@/components/ui/|@/shared/components/ui/|g'

# Rewrite direct-path imports from components/shared/ (slash imports)
grep -rl '@/components/shared/' src | xargs sed -i '' 's|@/components/shared/|@/shared/components/layout/|g'

# MANUAL STEP: barrel imports from @/components/shared (without trailing slash)
# Find all files that import from the barrel:
grep -rn "from '@/components/shared'" src
grep -rn 'from "@/components/shared"' src
# For each file found, replace the barrel import with individual direct-path imports.
# Example: `import { Navbar, Footer } from "@/components/shared"`
# becomes:  `import Navbar from "@/shared/components/layout/Navbar"`
#           `import Footer from "@/shared/components/layout/Footer"`

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(shared): move ui and layout components to shared/components"
```

---

### Step 4 — features/auth

```bash
mkdir -p src/features/auth/components

git mv src/components/auth/CredentialColumn.tsx src/features/auth/components/CredentialColumn.tsx
git mv src/components/auth/ForgotPasswordForm.tsx src/features/auth/components/ForgotPasswordForm.tsx
git mv src/components/auth/GoogleSignInButton.tsx src/features/auth/components/GoogleSignInButton.tsx
git mv src/components/auth/HeroAuthColumn.tsx src/features/auth/components/HeroAuthColumn.tsx
git mv src/components/auth/HeroContent.tsx src/features/auth/components/HeroContent.tsx
git mv src/components/auth/SignInForm.tsx src/features/auth/components/SignInForm.tsx
git mv src/components/auth/SignUpForm.tsx src/features/auth/components/SignUpForm.tsx
rm src/components/auth/index.ts   # delete barrel

# Rewrite slash imports
grep -rl '@/components/auth/' src | xargs sed -i '' 's|@/components/auth/|@/features/auth/components/|g'

# MANUAL STEP: barrel imports from @/components/auth
grep -rn "from '@/components/auth'" src
grep -rn 'from "@/components/auth"' src
# Replace with individual direct-path imports.

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(auth): move auth components to features/auth"
```

---

### Step 5 — features/marketing

```bash
mkdir -p src/features/marketing/components
mkdir -p src/features/marketing/lib/validations

git mv src/components/marketing/ContactForm.tsx src/features/marketing/components/ContactForm.tsx
git mv src/components/marketing/ContactHero.tsx src/features/marketing/components/ContactHero.tsx
git mv src/components/marketing/ContactSocialLinks.tsx src/features/marketing/components/ContactSocialLinks.tsx
git mv src/components/marketing/Hero.tsx src/features/marketing/components/Hero.tsx
git mv src/components/marketing/HeroHeading.tsx src/features/marketing/components/HeroHeading.tsx
git mv src/components/marketing/HeroSlider.tsx src/features/marketing/components/HeroSlider.tsx
git mv src/components/marketing/PdfUpload.tsx src/features/marketing/components/PdfUpload.tsx
git mv src/components/marketing/TypewritingSlogan.tsx src/features/marketing/components/TypewritingSlogan.tsx
rm src/components/marketing/index.ts   # delete barrel

git mv src/lib/submitContactForm.ts src/features/marketing/lib/submitContactForm.ts
git mv src/lib/validations/contact.ts src/features/marketing/lib/validations/contact.ts

# Rewrite slash imports
grep -rl '@/components/marketing/' src | xargs sed -i '' 's|@/components/marketing/|@/features/marketing/components/|g'
grep -rl '@/lib/submitContactForm"' src | xargs sed -i '' 's|@/lib/submitContactForm"|@/features/marketing/lib/submitContactForm"|g'
grep -rl "@/lib/submitContactForm'" src | xargs sed -i '' "s|@/lib/submitContactForm'|@/features/marketing/lib/submitContactForm'|g"
grep -rl '@/lib/validations/contact"' src | xargs sed -i '' 's|@/lib/validations/contact"|@/features/marketing/lib/validations/contact"|g'
grep -rl "@/lib/validations/contact'" src | xargs sed -i '' "s|@/lib/validations/contact'|@/features/marketing/lib/validations/contact'|g"

# MANUAL STEP: barrel imports from @/components/marketing
grep -rn "from '@/components/marketing'" src
grep -rn 'from "@/components/marketing"' src

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(marketing): move marketing components and contact lib to features/marketing"
```

---

### Step 6 — features/account

```bash
mkdir -p src/features/account/components
mkdir -p src/features/account/lib/validations

git mv src/components/account/ProfileAvatarUpload.tsx src/features/account/components/ProfileAvatarUpload.tsx
git mv src/components/account/ProfileCard.tsx src/features/account/components/ProfileCard.tsx
git mv src/components/account/ProfileForm.tsx src/features/account/components/ProfileForm.tsx
rm src/components/account/index.ts   # delete barrel

git mv src/lib/validations/profile.ts src/features/account/lib/validations/profile.ts

# Rewrite slash imports
grep -rl '@/components/account/' src | xargs sed -i '' 's|@/components/account/|@/features/account/components/|g'
grep -rl '@/lib/validations/profile"' src | xargs sed -i '' 's|@/lib/validations/profile"|@/features/account/lib/validations/profile"|g'
grep -rl "@/lib/validations/profile'" src | xargs sed -i '' "s|@/lib/validations/profile'|@/features/account/lib/validations/profile'|g"

# MANUAL STEP: barrel imports from @/components/account
grep -rn "from '@/components/account'" src
grep -rn 'from "@/components/account"' src

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(account): move account components and profile validation to features/account"
```

---

### Step 7 — features/rag

```bash
mkdir -p src/features/rag/lib
mkdir -p src/features/rag/data

git mv src/lib/embeddings.ts src/features/rag/lib/embeddings.ts
git mv src/lib/searchRAG.ts src/features/rag/lib/searchRAG.ts
git mv src/lib/chunking.ts src/features/rag/lib/chunking.ts
git mv src/data/documents.ts src/features/rag/data/documents.ts

# Rewrite imports (anchored)
grep -rl '@/lib/embeddings"' src | xargs sed -i '' 's|@/lib/embeddings"|@/features/rag/lib/embeddings"|g'
grep -rl "@/lib/embeddings'" src | xargs sed -i '' "s|@/lib/embeddings'|@/features/rag/lib/embeddings'|g"
grep -rl '@/lib/searchRAG"' src | xargs sed -i '' 's|@/lib/searchRAG"|@/features/rag/lib/searchRAG"|g'
grep -rl "@/lib/searchRAG'" src | xargs sed -i '' "s|@/lib/searchRAG'|@/features/rag/lib/searchRAG'|g"
grep -rl '@/lib/chunking"' src | xargs sed -i '' 's|@/lib/chunking"|@/features/rag/lib/chunking"|g'
grep -rl "@/lib/chunking'" src | xargs sed -i '' "s|@/lib/chunking'|@/features/rag/lib/chunking'|g"
grep -rl '@/data/documents"' src | xargs sed -i '' 's|@/data/documents"|@/features/rag/data/documents"|g'
grep -rl "@/data/documents'" src | xargs sed -i '' "s|@/data/documents'|@/features/rag/data/documents'|g"

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(rag): move RAG utilities and documents to features/rag"
```

---

### Step 8 — features/chat

```bash
mkdir -p src/features/chat/components
git mv src/components/chat/chat-widget.tsx src/features/chat/components/chat-widget.tsx

grep -rl '@/components/chat/' src | xargs sed -i '' 's|@/components/chat/|@/features/chat/components/|g'

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(chat): move chat widget to features/chat"
```

---

### Step 9 — features/admin

```bash
mkdir -p src/features/admin/hooks
mkdir -p src/features/admin/lib

git mv src/hooks/usePdfUpload.ts src/features/admin/hooks/usePdfUpload.ts
git mv src/lib/jira.ts src/features/admin/lib/jira.ts

grep -rl '@/hooks/usePdfUpload"' src | xargs sed -i '' 's|@/hooks/usePdfUpload"|@/features/admin/hooks/usePdfUpload"|g'
grep -rl "@/hooks/usePdfUpload'" src | xargs sed -i '' "s|@/hooks/usePdfUpload'|@/features/admin/hooks/usePdfUpload'|g"
grep -rl '@/lib/jira"' src | xargs sed -i '' 's|@/lib/jira"|@/features/admin/lib/jira"|g'
grep -rl "@/lib/jira'" src | xargs sed -i '' "s|@/lib/jira'|@/features/admin/lib/jira'|g"

npx tsc --noEmit --pretty false 2>&1 | sed 's|^[^(]*/\([^/(]*(\)|\1|' | sort | diff /tmp/tsc-baseline.txt -
git add -A && git commit -m "refactor(admin): move admin hooks and jira lib to features/admin"
```

---

### Step 10 — Cleanup

```bash
# Delete remaining empty barrel/placeholder files
rm src/components/booking/index.ts
rm src/components/dashboard/index.ts
rm src/hooks/index.ts
rm src/types/index.ts

# Delete now-empty legacy dirs
rmdir src/components/booking src/components/dashboard
rmdir src/components/auth src/components/account src/components/marketing
rmdir src/components/chat src/components/shared
rmdir src/components/ui  # should already be gone after Step 3
rmdir src/components
rmdir src/lib/validations src/lib
rmdir src/data
rmdir src/hooks
rmdir src/db
rmdir src/types

# Final: verify no legacy-path imports remain
grep -rn '@/components/' src && echo "FAIL: legacy components/ imports remain"
grep -rn '@/lib/' src && echo "FAIL: legacy lib/ imports remain"
grep -rn '@/data/' src && echo "FAIL: legacy data/ imports remain"
grep -rn '@/hooks/' src && echo "FAIL: legacy hooks/ imports remain"
grep -rn '@/db"' src && echo "FAIL: legacy db imports remain"

git add -A && git commit -m "refactor(cleanup): delete empty legacy dirs and barrel files"
```

---

## Risks

| Risk | Mitigation |
|------|-----------|
| **Barrel → direct import conversion** | Step 3–6 each have a MANUAL STEP section. Grep for barrel imports before sed-rewriting; fix them file-by-file. |
| **`rmdir` fails on non-empty dirs** | A file was missed in the inventory. Investigate with `ls` before force-deleting. |
| **git mv on dir fails** | Some `git mv` calls move entire directories; if it fails, move files individually and remove the source dir manually. |
| **`searchRAG.ts` internal relative imports** | It imports from `@/db` (already rewritten in Step 1). No relative-path risk. |
| **`documents.ts` imports from `@/shared/db`** | Already handled by Step 1 rewrite before Step 7 moves documents.ts. |
| **pre-commit hooks** | The project uses Prettier + ESLint. Path rewrites via sed are formatting-neutral. Let hooks run; don't skip them. |
| **`lib/validations/` dir becomes empty** | After Steps 5 and 6, the dir is empty. `rmdir src/lib/validations` in Step 10. |

---

## Docs update (Step 10)

Update `CLAUDE.md` architecture section to reflect:
- New layer dirs: `src/shared/`, `src/features/`
- Import rule: `shared/` never imports from `features/`
- Where each feature lives (feature list from inventory above)
- Remove references to `src/components/`, `src/lib/`, `src/hooks/`, `src/data/`, `src/db/`

---

## Final verification

```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. No legacy-path imports
grep -rn '@/components/\|@/lib/\|@/data/\|@/hooks/\|@/db"' src
# Expected: zero hits

# 4. shared/ never imports features/
grep -rn "from '@/features/" src/shared
grep -rn 'from "@/features/' src/shared
# Expected: zero hits

# 5. Build
npm run build

# 6. Manual smoke test
# Run npm run dev and verify: home page, sign-in, contact form, account profile, chat widget, admin uploads
```
