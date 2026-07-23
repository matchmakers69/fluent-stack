import { env } from "@/env"

export const jiraConfig = {
  baseUrl: env.JIRA_BASE_URL,
  email: env.JIRA_EMAIL,
  token: env.JIRA_API_TOKEN,
  projectKey: env.JIRA_PROJECT_KEY,
}

export function jiraAuthHeader() {
  const credentials = Buffer.from(
    `${jiraConfig.email}:${jiraConfig.token}`
  ).toString("base64")
  return `Basic ${credentials}`
}

export async function jiraFetch(
  path: string,
  options: RequestInit = {}
) {
  const url = `${jiraConfig.baseUrl}/rest/api/3${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: jiraAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Jira API error ${res.status}: ${error}`)
  }
  return res.json()
}
