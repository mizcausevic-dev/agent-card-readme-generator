import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { generateReadme } from "../src/generate.js";
import type { AgentCard } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));

function loadFixture(name: string): AgentCard {
  return JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as AgentCard;
}

describe("generateReadme", () => {
  it("emits the title and description from the agent block", () => {
    const md = generateReadme(loadFixture("agent-card.json"));
    expect(md).toContain("# Research Assistant");
    expect(md).toContain("Answers procurement questions over uploaded PDFs");
    expect(md).toContain("**Agent id:** `research-assistant`");
    expect(md).toContain("**Version:** `1.1.0`");
    expect(md).toContain("**Provider:** kineticgain");
  });

  it("renders autonomy + memory + context badges by default", () => {
    const md = generateReadme(loadFixture("agent-card.json"));
    expect(md).toContain("🟡 supervised");
    expect(md).toContain("🟡 session memory");
    expect(md).toContain("**128,000** context tokens");
    expect(md).toContain("✅ incident response URI");
  });

  it("hides badges when --hide-badges is set", () => {
    const md = generateReadme(loadFixture("agent-card.json"), { hideBadges: true });
    expect(md).not.toContain("🟡 supervised");
    expect(md).not.toContain("context tokens");
    expect(md).toContain("# Research Assistant");
  });

  it("warns when an autonomous agent has no incident response URI", () => {
    const md = generateReadme(loadFixture("autonomous-without-iru.json"));
    expect(md).toContain("🔴 autonomous");
    expect(md).toContain("🔴 persistent memory");
    expect(md).toContain("⚠ no incident response URI");
  });

  it("renders the homepage link when present", () => {
    const md = generateReadme(loadFixture("agent-card.json"));
    expect(md).toContain("**Homepage:** https://example.com/research-assistant");
  });

  it("emits a Models table with role column", () => {
    const md = generateReadme(loadFixture("agent-card.json"));
    expect(md).toContain("## Models");
    expect(md).toContain("| `gpt-4o-mini` | qa |");
    expect(md).toContain("| `text-embedding-3-small` | retrieval |");
  });

  it("renders models with no role as em-dash", () => {
    const md = generateReadme({
      agent_card_version: "0.1",
      agent: { id: "a", name: "A", version: "0.0.1", provider: "x", description: "y" },
      capabilities: {
        primary_purpose: "p",
        models_used: [{ model: "gpt-4o" }],
        tools: [],
        max_context_tokens: 1000,
        memory_persistence: "none",
        autonomy_level: "assistive"
      },
      deployment: {},
      safety_posture: {}
    });
    expect(md).toContain("| `gpt-4o` | — |");
  });

  it("emits Tools section with side-effect badges and tool-card links", () => {
    const md = generateReadme(loadFixture("agent-card.json"));
    expect(md).toContain("## Tools (2)");
    expect(md).toContain("🟢 read");
    expect(md).toContain("[search-vectorstore](https://example.com/cards/search.json)");
    expect(md).toContain(`<a id="section-tool-search-vectorstore"></a>`);
  });

  it("renders external + destructive side-effect badges", () => {
    const md = generateReadme({
      agent_card_version: "0.1",
      agent: { id: "a", name: "A", version: "0.0.1", provider: "x", description: "y" },
      capabilities: {
        primary_purpose: "p",
        models_used: [],
        tools: [
          { name: "send-email", side_effects: "external" },
          { name: "drop-db", side_effects: "destructive" },
          { name: "patch", side_effects: "mutating" }
        ],
        max_context_tokens: 1000,
        memory_persistence: "none",
        autonomy_level: "assistive"
      },
      deployment: {},
      safety_posture: {}
    });
    expect(md).toContain("🟠 external");
    expect(md).toContain("🔴 destructive");
    expect(md).toContain("🟡 mutating");
  });

  it("emits placeholder when no tools / models / evals", () => {
    const md = generateReadme({
      agent_card_version: "0.1",
      agent: { id: "a", name: "A", version: "0.0.1", provider: "x", description: "y" },
      capabilities: {
        primary_purpose: "p",
        models_used: [],
        tools: [],
        max_context_tokens: 1000,
        memory_persistence: "none",
        autonomy_level: "assistive"
      },
      deployment: {},
      safety_posture: {}
    });
    expect(md).toContain("_No models declared._");
    expect(md).toContain("## Tools (0)");
    expect(md).toContain("_No tools declared._");
    expect(md).toContain("_No refusal categories declared._");
    expect(md).toContain("_No evaluations recorded._");
    expect(md).toContain("_No deployment metadata._");
    expect(md).toContain("_No safety posture metadata._");
  });

  it("renders refusal categories with example prompts", () => {
    const md = generateReadme(loadFixture("agent-card.json"));
    expect(md).toContain("## Refusal taxonomy (2)");
    expect(md).toContain("### `legal-advice` → refuse_and_explain");
    expect(md).toContain(`- "Draft me a binding contract"`);
    expect(md).toContain("### `out-of-scope` → refuse_and_explain");
  });

  it("renders evaluations table with pass marker and date", () => {
    const md = generateReadme(loadFixture("agent-card.json"));
    expect(md).toContain("## Evaluations (1)");
    expect(md).toContain("| ragas-faithfulness | ✅ | 2026-05-20 |");
    expect(md).toContain("[link](https://example.com/evals/r1.json)");
  });

  it("renders failed and unknown evaluation results", () => {
    const md = generateReadme({
      agent_card_version: "0.1",
      agent: { id: "a", name: "A", version: "0.0.1", provider: "x", description: "y" },
      capabilities: {
        primary_purpose: "p",
        models_used: [],
        tools: [],
        max_context_tokens: 1000,
        memory_persistence: "none",
        autonomy_level: "assistive"
      },
      evaluations: [
        { suite: "broken", result_uri: "https://x/", ran_at: "2026-01-01T00:00:00Z", passed: false },
        { suite: "unknown", result_uri: "https://x/", ran_at: "2026-01-02T00:00:00Z" }
      ],
      deployment: {},
      safety_posture: {}
    });
    expect(md).toContain("| broken | ❌ | 2026-01-01 |");
    expect(md).toContain("| unknown | — | 2026-01-02 |");
  });

  it("emits Deployment + Safety posture key/value lines", () => {
    const md = generateReadme(loadFixture("agent-card.json"));
    expect(md).toContain("## Deployment");
    expect(md).toContain(`- **environment:** \`"production"\``);
    expect(md).toContain(`- **status:** \`"active"\``);
    expect(md).toContain(`- **region:** \`"us-east-1"\``);
    expect(md).toContain("## Safety posture");
    expect(md).toContain(`- **incident_response_uri:** \`"https://example.com/incidents"\``);
    expect(md).toContain(`- **sla_minutes:** \`30\``);
  });

  it("uses custom anchorPrefix", () => {
    const md = generateReadme(loadFixture("agent-card.json"), { anchorPrefix: "x-" });
    expect(md).toContain(`<a id="x-tool-search-vectorstore"></a>`);
  });

  it("throws on malformed input", () => {
    expect(() => generateReadme(null as unknown as AgentCard)).toThrow();
    expect(() => generateReadme({} as AgentCard)).toThrow();
    expect(() => generateReadme({ agent: {} } as unknown as AgentCard)).toThrow();
  });

  it("falls through unknown autonomy / memory enums to raw label", () => {
    const md = generateReadme({
      agent_card_version: "0.1",
      agent: { id: "a", name: "A", version: "0.0.1", provider: "x", description: "y" },
      capabilities: {
        primary_purpose: "p",
        models_used: [],
        tools: [],
        max_context_tokens: 0,
        memory_persistence: "weird-future" as unknown as "none",
        autonomy_level: "swarm" as unknown as "assistive"
      },
      deployment: {},
      safety_posture: {}
    });
    expect(md).toContain("swarm");
    expect(md).toContain("weird-future");
  });
});
