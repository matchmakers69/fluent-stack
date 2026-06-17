import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env manually
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

const epicKey = process.argv[2]
if (!epicKey) {
  console.error("Usage: node scripts/create-jira-stories.mjs <epic-key>")
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

const stories = [
  {
    summary: "As a visitor, I want to see a compelling hero section so that I immediately understand the value of the tutoring service",
    criteria: [
      "Given I land on the homepage, when I view the hero section, then I see a clear headline communicating the service value",
      "When I view the hero, then I see a prominent call-to-action button to book or contact",
      "When I view the hero on mobile, then the layout is readable and the CTA is accessible",
    ],
  },
  {
    summary: "As a visitor, I want to read about the teacher's background and credentials so that I can decide if they are the right fit for me",
    criteria: [
      "Given I scroll the landing page, when I reach the About section, then I see the teacher's photo, bio, and qualifications",
      "When I read the bio, then I can see relevant experience (years teaching, student types, certifications)",
      "When I view on mobile, then the layout stacks cleanly without overflowing",
    ],
  },
  {
    summary: "As a visitor, I want to see pricing information so that I can evaluate if the service fits my budget",
    criteria: [
      "Given I browse the landing page, when I reach the pricing section, then I see at least one clearly labeled price or package",
      "When I view pricing, then I understand what is included in each option",
      "When pricing is displayed, then there is a CTA button linking to booking or contact",
    ],
  },
  {
    summary: "As a visitor, I want to fill out a contact form so that I can ask questions before booking a lesson",
    criteria: [
      "Given I want to inquire, when I fill in name, email, and message and submit, then I receive a confirmation that my message was sent",
      "When I submit with missing required fields, then I see inline validation errors",
      "When the form is submitted successfully, then the admin receives the inquiry via email or notification",
    ],
  },
  {
    summary: "As a visitor, I want to read testimonials from past students so that I can trust the quality of the tutoring",
    criteria: [
      "Given I browse the landing page, when I reach the testimonials section, then I see at least 3 student reviews",
      "When I read a testimonial, then I see the student's name and optionally their role or context (e.g. 'maturzysta', 'software developer')",
      "When I view on mobile, then testimonials are legible without horizontal scrolling",
    ],
  },
  {
    summary: "As a visitor, I want to see what topics and lesson formats are offered so that I know what to expect before signing up",
    criteria: [
      "Given I browse the landing page, when I reach the offerings section, then I see a list of lesson types or topics covered",
      "When I read the offerings, then I can distinguish between lesson types (e.g. matura prep vs. Business English)",
      "When I view on mobile, then the offering cards or list items are clearly separated and readable",
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
for (const r of results) {
  console.log(`${r.key.padEnd(12)} ${r.summary.slice(0, 76)}`)
}
