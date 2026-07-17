import { readFileSync } from "fs"
import { resolve } from "path"

const envPath = resolve(process.cwd(), ".env")
const envContent = readFileSync(envPath, "utf-8")
const env = {}
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const idx = trimmed.indexOf("=")
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "")
  env[key] = val
}

const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY, ANTHROPIC_API_KEY } = env

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
  console.error("Missing Jira env vars. Check your .env file.")
  process.exit(1)
}

if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY. Check your .env file.")
  process.exit(1)
}

const epicName = process.argv[2]
const epicDescription = process.argv[3]

if (!epicName || !epicDescription) {
  console.error("Usage: node scripts/create-epic-with-stories.mjs <epic-name> <epic-description>")
  process.exit(1)
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")

async function jiraFetch(path, options = {}) {
  const url = `${JIRA_BASE_URL}/rest/api/3${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
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

function makeDoc(text) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  }
}

function makeDescription(criteria) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Acceptance Criteria:", marks: [{ type: "strong" }] }],
      },
      {
        type: "bulletList",
        content: criteria.map((c) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: c }] }],
        })),
      },
    ],
  }
}

async function generateStories(epicName, epicDescription) {
  console.log("Generating stories with Claude AI...\n")
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are a product manager creating Jira User Stories for an English tutoring app called FluentStack.

Project context:
- App: FluentStack — English tutoring platform for Polish students
- Users: maturzyści (students preparing for Polish high school English exam), programmers learning Business English
- The app includes a marketing website, booking system, student dashboard, and AI-powered chatbot exercises

Epic name: "${epicName}"
Epic description: "${epicDescription}"

Generate 5-6 User Stories for this epic. Each story must follow the format:
"As a [user], I want to [action] so that [benefit]"

Each story must have exactly 3 acceptance criteria in Given/When/Then format.

Return ONLY a valid JSON array with no markdown, no explanation, no code blocks:
[
  {
    "summary": "As a ...",
    "criteria": ["Given ...", "When ...", "Then ..."]
  }
]`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${error}`)
  }

  const data = await res.json()
  const text = data.content[0].text.trim()
  return JSON.parse(text)
}

// Create Epic
console.log(`Creating Epic: "${epicName}"...`)
const epicBody = {
  fields: {
    project: { key: JIRA_PROJECT_KEY },
    issuetype: { name: "Epic" },
    summary: epicName,
    description: makeDoc(epicDescription),
  },
}

let epicKey
try {
  const created = await jiraFetch("/issue", {
    method: "POST",
    body: JSON.stringify(epicBody),
  })
  epicKey = created.key
  console.log(`✓ Epic created: ${epicKey}\n`)
} catch (err) {
  console.error(`✗ Failed to create epic: ${err.message}`)
  process.exit(1)
}

const stories = await generateStories(epicName, epicDescription)

console.log(`Creating ${stories.length} stories for epic ${epicKey}...\n`)

const results = []

for (const story of stories) {
  const body = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      issuetype: { name: "Story" },
      summary: story.summary,
      description: makeDescription(story.criteria),
      parent: { key: epicKey },
    },
  }

  try {
    const created = await jiraFetch("/issue", {
      method: "POST",
      body: JSON.stringify(body),
    })
    results.push({ key: created.key, summary: story.summary })
    console.log(`✓ ${created.key}`)
  } catch (err) {
    console.error(`✗ Failed: ${story.summary.slice(0, 60)}...`)
    console.error(`  ${err.message}`)
  }
}

console.log("\n--- Summary ---")
console.log(`${"Key".padEnd(12)} ${"Title"}`)
console.log("-".repeat(90))
console.log(`${epicKey.padEnd(12)} ${epicName}`)
for (const r of results) {
  console.log(`${r.key.padEnd(12)} ${r.summary.slice(0, 76)}`)
}
