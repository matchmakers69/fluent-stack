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

const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = env

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
  console.error("Missing Jira env vars. Check your .env file.")
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

const stories = [
  {
    summary: "As a student, I want to see clue buttons during a chatbot conversation so that I can get contextual hints when I'm stuck",
    criteria: [
      "Given I'm in a chatbot conversation, when I struggle to respond, then I see one or more clue buttons below the chat input",
      "When I click a clue button, then a relevant hint appears without revealing the full answer",
      "When I view the chat on mobile, then the clue buttons are accessible and don't obstruct the input field",
    ],
  },
  {
    summary: "As a student, I want to request a grammar clue so that I can correct my sentence structure without being given the full answer",
    criteria: [
      "Given I'm composing a response, when I click the grammar clue button, then I receive a tip about the relevant grammar rule",
      "When the grammar clue appears, then it highlights the specific part of speech or tense I should focus on",
      "When I've already used the grammar clue once, then the button indicates it has been used",
    ],
  },
  {
    summary: "As a student, I want to request a vocabulary clue so that I can find the right word without giving up on the exercise",
    criteria: [
      "Given I'm unsure of a word, when I click the vocabulary clue button, then I receive a synonym, definition, or word fragment as a hint",
      "When the vocabulary clue is shown, then it does not directly give away the target word but nudges me toward it",
      "When I click the clue, then the hint appears inline in the chat without interrupting the conversation flow",
    ],
  },
  {
    summary: "As a student, I want to see how many clues I've used per exercise so that I can track my reliance on hints over time",
    criteria: [
      "Given I'm in an exercise session, when I use a clue, then a visible counter increments showing clues used",
      "When the session ends, then a summary shows total clues used alongside my score or feedback",
      "When I review past sessions, then clue usage is included in the session history",
    ],
  },
  {
    summary: "As a student, I want clues to be progressively revealed so that I'm encouraged to think before getting the full hint",
    criteria: [
      "Given I click a clue button, when it's my first click, then I receive a vague hint that prompts thinking",
      "When I click the same clue button again, then I receive a more specific hint",
      "When I click a third time, then I receive the most direct hint available for that item",
    ],
  },
  {
    summary: "As a teacher, I want to configure whether clue buttons are available for a given exercise so that I can control the level of support students receive",
    criteria: [
      "Given I'm editing an exercise in the admin panel, when I toggle clue availability, then students either see or don't see clue buttons for that exercise",
      "When clues are disabled for an exercise, then no clue buttons appear in the student's chatbot view",
      "When I save the exercise configuration, then the clue setting is persisted and applied immediately on next student load",
    ],
  },
]

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
