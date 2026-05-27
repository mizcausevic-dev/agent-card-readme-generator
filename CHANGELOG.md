# Changelog

## v0.1.0 — 2026-05-26

- Initial release: `generateReadme(card, opts?)` → Markdown for an A2A AgentCard.
- Renders title + description + identity-badge line (autonomy / memory / context tokens / IRU flag).
- Tools table with side-effect-class badges (🟢 read / 🟡 mutating / 🟠 external / 🔴 destructive) and per-tool MCP Tool Card link.
- Refusal-taxonomy section with category → behavior + example prompts.
- Evaluations table with ✅/❌ pass marker and result URI.
- Deployment + safety-posture key/value blocks.
- CLI: `agent-card-readme-generator <agent-card.json> [--out FILE] [--hide-badges]`.
- Two fixtures: `Research Assistant` (supervised, session memory, IRU present) and `Reckless Agent` (autonomous, persistent memory, no IRU — surfaces the ⚠ warning badge).
- Sibling of `mcp-server-readme-generator` for the A2A side.
- Node 20/22 CI (lint, typecheck, coverage, build, demo, `npm audit`), AGPL-3.0-or-later, Dependabot.
