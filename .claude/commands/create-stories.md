# Create Jira Stories for Epic

Creates User Stories in Jira for a given Epic following 
our project conventions.

## Usage
/create-stories <epic-key> "<epic-name>"

## What this command does
1. Reads Jira and Anthropic credentials from .env file
2. Calls Claude AI (claude-sonnet-4-6) to generate relevant stories
   based on the epic name and project context
3. Creates User Stories linked to the given Epic
4. Each story follows format: 
   "As a [user], I want to [action] so that [benefit]"
5. Adds acceptance criteria to each story description

## Project context
- App: FluentStack — English tutoring platform
- Users: students (maturzyści, programmers learning Business English)
- Project key: SCRUM
- Story types: visitor stories, student stories, admin stories

## Instructions
When this command is run with an epic key and name:

1. Run: node scripts/create-jira-stories.mjs <epic-key> "<epic-name>"
2. Stories are generated dynamically by Claude AI based on
   the epic name and FluentStack project context
3. No hardcoded story content — AI produces unique, relevant
   stories for each epic on every run
4. Print a summary table with created story keys and titles

## Story format
Summary: "As a [visitor/student/admin], I want to [action] 
so that [benefit]"

Description (acceptance criteria):
- Given [context]
- When [action]  
- Then [expected result]

## Example
/create-stories SCRUM-5 "Marketing & Landing Page"

Should create stories like:
- As a visitor, I want to see a compelling hero section 
  so that I understand the value of the tutoring service
- As a visitor, I want to read about the teacher's background 
  so that I can decide if they are the right fit for me
- As a visitor, I want to fill out a contact form 
  so that I can ask questions before booking a lesson
