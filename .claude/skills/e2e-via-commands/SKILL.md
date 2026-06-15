---
name: e2e-via-commands
description: >
  Use when creating/extending e2e tests with Playwright,
  following shared command patterns and visible-behavior rules.
---

## FILE PLACEMENT

- All e2e test files live in `/e2e/` folder in project root
- File naming: `<feature>.spec.ts` (e.g. `contact.spec.ts`, `profile.spec.ts`)
- One spec file per feature/page
- Shared helpers and fixtures go in `/e2e/helpers/`
- Never create test files outside `/e2e/`

## Setup

Standard imports for every test file:

```ts
import { test, expect } from '@playwright/test'
```

Run tests with: `npm run test:e2e`

## Before Writing Tests

If the page structure is unclear, use Playwright MCP to visually inspect the page first — navigate to it and take a screenshot to understand the layout, selectors, and flow.

## Command Rules

- One command = one visible user/system behavior
- Use role/text/label selectors only — no internals, no CSS classes, no data-testid unless unavoidable
- No sleeps or explicit timeouts — await Playwright actions and use `waitFor` only when necessary
- Reuse command functions across tests; add new ones only for new behavior
- Test titles describe behavior, not implementation
- Assertions verify visible outcome (text, state, URL)

## Test Shape

```ts
import { test, expect } from '@playwright/test'

const commands = {
  'go to contact page': async (page) => {
    await page.goto('/contact')
  },
  'submit form with valid data': async (page) => {
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Send' }).click()
  },
}

test('shows success message after submit', async ({ page }) => {
  await commands['go to contact page'](page)
  await commands['submit form with valid data'](page)
  await expect(page.getByText('Message sent')).toBeVisible()
})
```

## Build Flow

1. Read spec/requirements
2. If page structure is unclear, inspect visually with Playwright MCP
3. Convert requirements into scenarios
4. Split into reusable commands
5. Compose each test as ordered command calls
6. Assert visible outcomes
7. Add edge cases (invalid input, back nav, empty state)

## Done Criteria

- Tests are deterministic on repeat runs
- Shared commands reused across tests — no copy-paste flow blocks
- Assertions cover user-visible text/state
- File stays compact: commands block + script-like tests
