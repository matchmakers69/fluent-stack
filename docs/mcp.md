# MCP Server

This project exposes an MCP server at `/api/mcp/[transport]` via `@vercel/mcp-adapter`.

## Tools

| Tool               | Description                              |
|--------------------|------------------------------------------|
| create_jira_epic   | Creates Epic in Jira                     |
| create_jira_story  | Creates User Story in Jira               |
| create_jira_task   | Creates Task linked to a story           |
| get_jira_issues    | Lists issues filtered by status/type     |
| update_jira_status | Moves issue to new status                |
| get_jira_issue     | Gets single issue details                |

## Jira Integration

Credentials stored in `.env`:
  JIRA_BASE_URL, JIRA_EMAIL,
  JIRA_API_TOKEN, JIRA_PROJECT_KEY

Jira helper lives in `src/lib/jira.ts`.
Never hardcode credentials anywhere.
