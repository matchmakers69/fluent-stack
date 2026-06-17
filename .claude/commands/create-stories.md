# Create Jira Stories for Epic

Creates User Stories in Jira for a given Epic following 
our project conventions.

## Usage
/create-stories <epic-key> "<epic-name>"

## What this command does
1. Reads Jira credentials from .env file
2. Creates User Stories linked to the given Epic
3. Each story follows format: 
   "As a [user], I want to [action] so that [benefit]"
4. Adds acceptance criteria to each story description

## Project context
- App: FluentStack — English tutoring platform
- Users: students (maturzyści, programmers learning Business English)
- Project key: SCRUM
- Story types: visitor stories, student stories, admin stories

## Instructions
When this command is run with an epic key and name:

1. Think about what stories make sense for this epic
   in the context of an English tutoring app
2. Generate 4-6 relevant User Stories for the epic
3. Use the Jira API via src/lib/jira.ts helper to create them
4. Link each story to the provided epic key using 
   customfield_10014
5. Add acceptance criteria in the description field
6. Print a summary table with created story keys and titles

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
