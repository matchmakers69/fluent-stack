# Create Epic with Stories
Creates an Epic in Jira and immediately populates it 
with User Stories.

## Usage
/create-epic-with-stories "<epic-name>" "<epic-description>"

## What this command does
1. Creates an Epic in Jira project SCRUM
2. Calls Claude AI (claude-sonnet-4-6) to generate relevant stories
   dynamically based on the epic name and description
3. Creates 5-6 AI-generated User Stories linked to that Epic
4. Each story follows "As a [user], I want to [action] 
   so that [benefit]" format with Given/When/Then 
   acceptance criteria
5. Uses parent field (not customfield_10014) for epic linking
6. Prints summary table with Epic key and all Story keys

## Project context
- App: FluentStack — English tutoring platform
- Users: students (maturzyści, programmers, Business English)
- Project key: SCRUM
- Use scripts/create-jira-stories.mjs as reference 
  for correct Jira API usage

## Example
/create-epic-with-stories "Student Dashboard" 
"Protected area where students see their lessons and materials"
