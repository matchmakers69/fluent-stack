# Create Epic with Stories
Creates an Epic in Jira and immediately populates it 
with User Stories.

## Usage
/create-epic-with-stories "<epic-name>" "<epic-description>"

## What this command does
1. Creates an Epic in Jira project SCRUM
2. Immediately creates 4-6 User Stories linked to that Epic
3. Each story follows "As a [user], I want to [action] 
   so that [benefit]" format with Given/When/Then 
   acceptance criteria
4. Uses parent field (not customfield_10014) for epic linking
5. Prints summary table with Epic key and all Story keys

## Project context
- App: FluentStack — English tutoring platform
- Users: students (maturzyści, programmers, Business English)
- Project key: SCRUM
- Use scripts/create-jira-stories.mjs as reference 
  for correct Jira API usage

## Example
/create-epic-with-stories "Student Dashboard" 
"Protected area where students see their lessons and materials"
