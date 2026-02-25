# Strategic Planning Heartbeat

This heartbeat runs every 2 days (adjust as needed) and prompts the user to update the progress of their strategic plan.

## Actions
1. Read the latest plan file (e.g., `strategic-plan.md` in the workspace).
2. Summarize completed milestones and any blockers.
3. Ask the user:
   - Which milestones have you completed?
   - Are there new risks or scope changes?
   - Do you need to adjust timelines or owners?
4. If the user provides updates, edit `strategic-plan.md` accordingly.
5. Optionally, schedule the next heartbeat (default 2 days).

## Implementation Hint
You can implement this heartbeat by creating a cron job via `openclaw cron add` that runs a small script invoking this file's instructions.
