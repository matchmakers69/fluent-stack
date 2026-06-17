import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { z } from "zod"
import { jiraFetch, jiraConfig } from "@/lib/jira"

function createServer() {
  const server = new McpServer({
    name: "fluent-stack-jira",
    version: "1.0.0",
  })

  server.tool(
    "create_jira_epic",
    "Creates a new Epic in Jira. Use this for large features like 'Authentication', 'Student Dashboard', 'Booking & Calendar'.",
    {
      name: z.string().describe("Epic name, e.g. 'Authentication'"),
      summary: z.string().describe("Short description of the epic"),
      description: z
        .string()
        .optional()
        .describe("Detailed description of the epic"),
    },
    async ({ name, summary, description }) => {
      const data = await jiraFetch("/issue", {
        method: "POST",
        body: JSON.stringify({
          fields: {
            project: { key: jiraConfig.projectKey },
            summary,
            description: description
              ? {
                  type: "doc",
                  version: 1,
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: description }],
                    },
                  ],
                }
              : undefined,
            issuetype: { name: "Epic" },
            customfield_10011: name,
          },
        }),
      })
      return {
        content: [
          {
            type: "text" as const,
            text: `Epic created: ${data.key} — ${summary}\nURL: ${jiraConfig.baseUrl}/browse/${data.key}`,
          },
        ],
      }
    }
  )

  server.tool(
    "create_jira_story",
    "Creates a User Story in Jira. Always write in format: 'As a [user], I want to [action] so that [benefit]'.",
    {
      summary: z
        .string()
        .describe(
          "Story title in format: As a [user], I want to [action] so that [benefit]"
        ),
      description: z
        .string()
        .optional()
        .describe("Acceptance criteria and additional details"),
      epicKey: z
        .string()
        .optional()
        .describe("Epic key to link this story to, e.g. SCRUM-1"),
      storyPoints: z
        .number()
        .optional()
        .describe("Story points estimate (1, 2, 3, 5, 8, 13)"),
    },
    async ({ summary, description, epicKey, storyPoints }) => {
      const data = await jiraFetch("/issue", {
        method: "POST",
        body: JSON.stringify({
          fields: {
            project: { key: jiraConfig.projectKey },
            summary,
            description: description
              ? {
                  type: "doc",
                  version: 1,
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: description }],
                    },
                  ],
                }
              : undefined,
            issuetype: { name: "Story" },
            ...(epicKey && { customfield_10014: epicKey }),
            ...(storyPoints && { story_points: storyPoints }),
          },
        }),
      })
      return {
        content: [
          {
            type: "text" as const,
            text: `Story created: ${data.key} — ${summary}\nURL: ${jiraConfig.baseUrl}/browse/${data.key}`,
          },
        ],
      }
    }
  )

  server.tool(
    "create_jira_task",
    "Creates a Task in Jira. Use for technical tasks that support a story.",
    {
      summary: z.string().describe("Task title"),
      description: z
        .string()
        .optional()
        .describe("Technical details of what needs to be done"),
      storyKey: z
        .string()
        .optional()
        .describe("Parent story key to link this task to, e.g. SCRUM-2"),
    },
    async ({ summary, description, storyKey }) => {
      const data = await jiraFetch("/issue", {
        method: "POST",
        body: JSON.stringify({
          fields: {
            project: { key: jiraConfig.projectKey },
            summary,
            description: description
              ? {
                  type: "doc",
                  version: 1,
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: description }],
                    },
                  ],
                }
              : undefined,
            issuetype: { name: "Task" },
            ...(storyKey && { parent: { key: storyKey } }),
          },
        }),
      })
      return {
        content: [
          {
            type: "text" as const,
            text: `Task created: ${data.key} — ${summary}\nURL: ${jiraConfig.baseUrl}/browse/${data.key}`,
          },
        ],
      }
    }
  )

  server.tool(
    "get_jira_issues",
    "Fetches issues from Jira project. Can filter by status or issue type.",
    {
      status: z
        .enum(["To Do", "In Progress", "In Review", "Done"])
        .optional()
        .describe("Filter by status"),
      issueType: z
        .enum(["Epic", "Story", "Task", "Bug"])
        .optional()
        .describe("Filter by issue type"),
      maxResults: z
        .number()
        .optional()
        .default(20)
        .describe("Maximum number of results to return"),
    },
    async ({ status, issueType, maxResults }) => {
      let jql = `project = ${jiraConfig.projectKey}`
      if (status) jql += ` AND status = "${status}"`
      if (issueType) jql += ` AND issuetype = "${issueType}"`
      jql += ` ORDER BY created DESC`

      const data = await jiraFetch(
        `/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=summary,status,issuetype,assignee`
      )

      const issues = data.issues.map(
        (issue: {
          key: string
          fields: {
            summary: string
            status: { name: string }
            issuetype: { name: string }
          }
        }) => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          type: issue.fields.issuetype.name,
          url: `${jiraConfig.baseUrl}/browse/${issue.key}`,
        })
      )

      return {
        content: [
          {
            type: "text" as const,
            text:
              issues.length > 0
                ? JSON.stringify(issues, null, 2)
                : "No issues found matching the criteria.",
          },
        ],
      }
    }
  )

  server.tool(
    "update_jira_status",
    "Updates the status of a Jira issue. Use this when starting or finishing work on a story or task.",
    {
      issueKey: z.string().describe("The Jira issue key, e.g. SCRUM-3"),
      status: z
        .enum(["To Do", "In Progress", "In Review", "Done"])
        .describe("The new status to set"),
    },
    async ({ issueKey, status }) => {
      const transitions = await jiraFetch(`/issue/${issueKey}/transitions`)
      const transition = transitions.transitions.find(
        (t: { name: string }) => t.name === status
      )
      if (!transition) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Transition "${status}" not found for ${issueKey}. Available: ${transitions.transitions.map((t: { name: string }) => t.name).join(", ")}`,
            },
          ],
        }
      }
      await jiraFetch(`/issue/${issueKey}/transitions`, {
        method: "POST",
        body: JSON.stringify({ transition: { id: transition.id } }),
      })
      return {
        content: [
          {
            type: "text" as const,
            text: `${issueKey} moved to "${status}" ✓`,
          },
        ],
      }
    }
  )

  server.tool(
    "get_jira_issue",
    "Fetches details of a single Jira issue by key.",
    {
      issueKey: z.string().describe("The Jira issue key, e.g. SCRUM-3"),
    },
    async ({ issueKey }) => {
      const data = await jiraFetch(
        `/issue/${issueKey}?fields=summary,status,issuetype,description,assignee`
      )
      const issue = {
        key: data.key,
        summary: data.fields.summary,
        status: data.fields.status.name,
        type: data.fields.issuetype.name,
        url: `${jiraConfig.baseUrl}/browse/${data.key}`,
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(issue, null, 2),
          },
        ],
      }
    }
  )

  return server
}

async function handleRequest(req: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })
  const server = createServer()
  await server.connect(transport)
  return transport.handleRequest(req)
}

export const GET = handleRequest
export const POST = handleRequest
