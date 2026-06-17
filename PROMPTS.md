# Fluent Stack — Prompt Library

A reference guide for common AI-assisted workflows in this project.

## Jira — Project Management

### When to use which command

**Starting a brand new feature area:**
Use /create-epic-with-stories — creates Epic + Stories in one step.

**Adding stories to an existing Epic:**
Use /create-stories — only adds Stories to an Epic that already exists.

**Typical workflow for a new sprint:**

Step 1 — Plan Epics (big areas of work):
/create-epic-with-stories "Authentication" "User login and registration"
/create-epic-with-stories "Student Dashboard" "Protected student area"

Step 2 — Refine existing Epics (add more Stories during Refinement):
/create-stories SCRUM-5 "Marketing & Landing Page"

Step 3 — Move Stories to Sprint in Jira UI (drag from Backlog)

Step 4 — Start coding, update status via Claude Code:
"Update SCRUM-10 status to In Progress"

Step 5 — After finishing a story:
"Update SCRUM-10 status to Done"

### Current Epics in project
| Key     | Epic                        | Status  |
|---------|-----------------------------|---------|
| SCRUM-5 | Marketing & Landing Page    | To Do   |
| SCRUM-6 | Booking & Calendar          | To Do   |
| SCRUM-7 | About me page               | To Do   |
| SCRUM-8 | My offer section            | To Do   |
| SCRUM-9 | Materials for students      | To Do   |

### Create Epic + Stories in one command
/create-epic-with-stories "<epic-name>" "<epic-description>"

Example:
/create-epic-with-stories "Student Dashboard" "Protected area where students see their lessons and materials"

### Create Stories for existing Epic
/create-stories <epic-key> "<epic-name>"

Example:
/create-stories SCRUM-5 "Marketing & Landing Page"

### Create Epics only (via Claude Code)
"Create epics in Jira for project SCRUM using credentials 
from .env. Epics: [list them]"

---

## Architecture

### Add new page
"Create a new page at /[route] inside src/app/[locale]/(marketing)/
Read /docs/architecture.md and /docs/i18n.md first.
Add translations to both pl.json and en.json."

### Add new component
"Create a new component in src/components/[feature]/
Read /docs/ui.md first.
Export it from the barrel file index.ts."

---

## Design System

### Add new button variant
"Add a new button variant called [name] to 
src/components/ui/button.tsx.
Read /docs/ui.md first for colour tokens."

### Update colours
"Update colour tokens in src/app/globals.css.
Only modify :root and .dark blocks."

---

## i18n — Translations

### Add new translation key
"Add translation key [namespace].[key] to 
messages/pl.json and messages/en.json.
Read /docs/i18n.md first."

### Add new locale
"Add new locale [code] to the project.
Read /docs/i18n.md — follow the Adding a new locale section."

---

## MCP Server

### Add new Jira tool
"Add a new tool called [name] to 
src/app/api/mcp/[transport]/route.ts.
Read /docs/mcp.md first.
Update the tools table in /docs/mcp.md after."

### Test MCP server locally
curl -X POST http://localhost:3000/api/mcp/streamable-http \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"id":1}'

---

## Auth — Clerk

### Protect a new route
"Add auth protection to src/app/[locale]/([group])/layout.tsx.
Read /docs/auth.md first — use auth() from @clerk/nextjs/server."

### Add admin-only route
"Create a new admin page at /[route] under 
src/app/[locale]/(admin)/.
Read /docs/auth.md — admin check uses 
sessionClaims?.metadata?.role === 'admin'."

---

## Claude Code Tips

### Start new session (avoid context limit)
Always start with:
"Read /docs/ui.md, /docs/architecture.md, /docs/i18n.md, 
/docs/auth.md, /docs/mcp.md before starting."

### If Claude Code hits context limit
Create .claudeignore in root:
  node_modules/
  .next/
  .git/
  *.lock
  *.log
  public/
  messages/

### Split long prompts
Break into parts and send one at a time.
Wait for confirmation before sending next part.

---

## ngrok — Local MCP Testing

### Start local MCP server
Terminal 1: npm run dev
Terminal 2: ngrok http 3000

### Update Claude.ai connector after ngrok restart
1. Copy new ngrok URL from terminal
2. Update NEXT_PUBLIC_APP_URL in .env
3. Go to claude.ai → Connectors → jira-fluent-stack → edit URL
   New URL: https://[ngrok-url]/api/mcp/streamable-http
4. Restart npm run dev

Note: ngrok URL changes on every restart (free plan).
Buy ngrok paid plan (~$8/mo) for a permanent URL.
On Vercel deployment, use your domain instead of ngrok.
