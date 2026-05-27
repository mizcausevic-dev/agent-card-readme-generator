# agent-card-readme-generator

[![CI](https://github.com/mizcausevic-dev/agent-card-readme-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/agent-card-readme-generator/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)

Generate a human-readable Markdown README from an A2A **AgentCard** JSON document.

Sibling of [`mcp-server-readme-generator`](https://github.com/mizcausevic-dev/mcp-server-readme-generator) for the A2A side — same shape, same vibe, same governance surface: take a machine-readable spec doc, emit something a human reviewer can scan in 30 seconds.

Part of the [Kinetic Gain Suite](https://suite.kineticgain.com/).

---

## What it renders

Given a card conforming to the [agent-cards-spec](https://github.com/mizcausevic-dev/agent-cards-spec), the generator emits:

- **Title + description** — `agent.name`, `agent.description`
- **Identity badges** — autonomy level (`⚪ assistive` / `🟡 supervised` / `🔴 autonomous`), memory persistence (`⚪ none` / `🟡 session` / `🔴 persistent`), context-window size, and a `✅` / `⚠` flag on `safety_posture.incident_response_uri`
- **Purpose** — `capabilities.primary_purpose`
- **Models** — table of `models_used` with role
- **Tools** — table of `tools[]` with **side-effect-class badge** (`🟢 read` / `🟡 mutating` / `🟠 external` / `🔴 destructive`) and a link to each tool's optional `mcp_tool_card_uri`
- **Refusal taxonomy** — every `category → behavior` plus example prompts
- **Evaluations** — suite, `✅` / `❌` pass marker, ran-at date, link to `result_uri`
- **Deployment** — every key from `deployment{}`
- **Safety posture** — every key from `safety_posture{}` (incident response URI, SLA, etc.)

---

## CLI

```bash
npx agent-card-readme-generator path/to/agent-card.json > README.md
```

### Options

| flag             | meaning |
|---|---|
| `--out FILE`     | Write to `FILE` instead of stdout |
| `--hide-badges`  | Suppress the identity-badge line under the title |
| `-h`, `--help`   | Print help and exit |

Exit codes:

- `0` — README emitted
- `2` — usage / I/O error or malformed AgentCard

---

## Library API

```ts
import { generateReadme } from "agent-card-readme-generator";
import type { AgentCard } from "agent-card-readme-generator";

const card: AgentCard = JSON.parse(readFileSync("agent-card.json", "utf8"));
const md = generateReadme(card, { hideBadges: false, anchorPrefix: "section-" });
```

`generateReadme(card, opts?)` returns the rendered Markdown string. Options:

- `hideBadges?: boolean` — suppress the identity-badge line
- `anchorPrefix?: string` — anchor-id prefix for tool section IDs (default `"section-"`)

Throws on missing `agent` or `capabilities` blocks.

---

## Why

AgentCards are great as machine-readable artifacts, but humans need a glanceable surface — the same way a `package.json` needs a `README.md` next to it. This generator gives every agent in your fleet a consistent, badge-coded human view, generated from the spec doc rather than hand-maintained alongside it.

The **side-effect-class badges** in particular are the point: at-a-glance you can see whether an agent's tool surface is read-only or includes destructive operations, and reviewers can drill into each tool's MCP Tool Card from the same table.

---

## License

[AGPL-3.0-or-later](LICENSE)
