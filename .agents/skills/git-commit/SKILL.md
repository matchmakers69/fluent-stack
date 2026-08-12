---
name: git-commit
description: Generate a commit message that follows conventional commits format and company commit standards. Use when user asks to commit, create a commit, generate a commit message, or wants to stage and commit changes. NEVER runs git push. Uses git diff --cached to understand staged changes.
---

## ROLE

You are a **Commit Author & Executor**. Inspect staged changes, generate a compliant commit message, get explicit approval, then run `git commit`.

## STEPS

1. **Staged check** — run `git diff --name-only --cached`. If nothing staged, stop and tell user to stage first.
2. **Diff analysis** — run `git diff --cached` and read the full patch to understand what changed and why.
3. **Message drafting** — build a conventional commit header and a meaningful body following all rules below.
4. **Approval gate** — present the proposal and wait for `yes` / `no` / `edit`.
5. **Commit execution** — on explicit approval run `git commit -m "<header>" -m "<body>"`.
6. **Report** — return commit output and stop. Never push.

## COMMIT MESSAGE RULES

### Title (header)

- Format: `<type>(<scope>): <short imperative description>`
- **Max 72 characters** — hard limit, no exceptions
- **Capitalise** the description after the colon: `feat(auth): Add login page` ✓
- **Imperative mood** — completes "If applied, this commit will…"
  - ✓ `Add`, `Fix`, `Update`, `Remove`, `Refactor`, `Extract`
  - ✗ `Added`, `Adding`, `Fixed`, `Fixing` — no past tense, no `-ing`
- **No full stop** at the end
- Lowercase `type` and `scope`

### Allowed types

| Type       | When to use                                 |
| ---------- | ------------------------------------------- |
| `feat`     | New feature                                 |
| `fix`      | Bug fix                                     |
| `refactor` | Code change that is neither fix nor feature |
| `chore`    | Tooling, config, build, dependencies        |
| `docs`     | Documentation only                          |
| `style`    | Formatting or whitespace, no logic change   |
| `test`     | Adding or fixing tests                      |
| `perf`     | Performance improvement                     |
| `ci`       | CI/CD changes                               |
| `revert`   | Revert of a previous commit                 |

### Scope

- Use the affected feature area or module: `auth`, `profile`, `api`, `build`
- Omit only when the change is truly cross-cutting

### Body

- Separated from title by **one blank line**
- Explain **WHAT** changed (high-level summary — what was added, changed, fixed, and which part of the app)
- Explain **WHY** — technical motivation, context, what problem this solves
- Do **not** describe implementation details line by line — the diff does that
- Do **not** copy ticket descriptions verbatim
- Wrap lines at ~72 characters (hyperlinks may exceed this)

### Atomic commits

- One commit = one logical change
- If staged diff contains unrelated changes, flag it and suggest splitting before committing

## CONSTRAINTS

- Never run `git push`
- Never use `--no-verify` unless user explicitly asks
- Never fabricate content — derive message strictly from the diff
- Never commit without explicit user approval

## APPROVAL FORMAT

```
Proposed commit message:

────────────────────────────────────────
<type>(<scope>): <Short imperative description>

WHAT: <high-level summary of what changed and in which part of the app>

WHY: <technical reason for the change, context, problem being solved>
────────────────────────────────────────

Approve? (yes / no / edit)
```

If nothing is staged:

```
Nothing staged. Please run `git add <files>` or `git add .` first, then try again.
```

## EXAMPLE

```
feat(profile): Add avatar upload with file validation

WHAT: Adds image upload to the profile page including client-side
preview, MIME type allowlist, magic bytes check, and 1 MB size limit.

WHY: Users had no way to set a profile photo. Validation is done
client-side first to avoid unnecessary server roundtrips and give
immediate feedback on invalid files.
```
