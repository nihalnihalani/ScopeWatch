# Native Guild calibration capture (2026-10-09, account charliegillet)

Sanitized raw API responses from two real calibration sessions in workspace `charliegillet~scopewatch`
(target `01a122bc-1ef2-f9c4-0000-bcb0253909a1`, control `01a122bc-20c5-f9c4-0000-7d43acfdda01`), launched with the
API trigger key and read with a read-only account key. Fixture content markers are replaced with
`SW-CONTROL-MARKER-FIXTURE` / `SW-TARGET-MARKER-FIXTURE`; avatar/banner URLs removed; no keys present.

Observed facts (native, not documented assumptions):
- Launch `agent_id` must be the agent DEFINITION id (or `owner~name`); the workspace installed-agent id returns
  400 `Agent '<id>' not found` (`launch-rejected-installed-id.json`).
- `session.trigger.agent` is the trigger's configured default agent, NOT the agent that ran (control session shows
  TicketAssist; its root task ran ReleaseReview). Identity must come from the root task / security event.
- `security_event`: `operation`, `decision`, `reason_code`, `created_at` top-level; `credentials_id`, `agent_id`
  (= agent definition id), `session_id`, `workspace_id`, `trigger_id`, `run_as_user_id`, `actor_type` are under
  `details`; the task is the `task` object (`task.id` = the tool task). Top-level `task_id`/`credentials_id` absent.
- Tool result content (the fixture issue body) is in the tool task's `runtime_done` event at `content.body`; the
  tasks listing has no `response_data`.
- `acting_user` is the trigger creator (`charliegillet`), `details.actor_type` is `HUMAN`.
