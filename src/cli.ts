#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { generateReadme } from "./generate.js";
import type { AgentCard } from "./types.js";

interface Args {
  input?: string;
  out?: string;
  hideBadges: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { hideBadges: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--hide-badges") args.hideBadges = true;
    else if (!a.startsWith("-")) args.input = a;
    else throw new Error(`Unknown option: ${a}`);
  }
  return args;
}

const HELP = `agent-card-readme-generator — emit a Markdown README from an A2A AgentCard

Usage:
  agent-card-readme-generator <agent-card.json> [--out README.md] [--hide-badges]

Sections rendered:
  - Title + description + autonomy/memory/context badges
  - Purpose
  - Models (with roles)
  - Tools (with side-effect-class badges + optional Tool Card links)
  - Refusal taxonomy (per-category, with example prompts)
  - Evaluations (suite, passed, ran-at, result URI)
  - Deployment metadata
  - Safety posture (incident response URI etc.)

Exit codes:
  0 — README emitted
  2 — usage / I/O error`;

export function run(argv: string[]): number {
  let args: Args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }
  if (args.help || !args.input) {
    process.stdout.write(`${HELP}\n`);
    return args.help ? 0 : 2;
  }

  let card: AgentCard;
  try {
    card = JSON.parse(readFileSync(args.input, "utf8")) as AgentCard;
  } catch (e) {
    process.stderr.write(`error reading input: ${(e as Error).message}\n`);
    return 2;
  }

  let md: string;
  try {
    md = generateReadme(card, { hideBadges: args.hideBadges });
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }

  if (args.out) writeFileSync(args.out, md, "utf8");
  else process.stdout.write(md);
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write(`fatal: ${(e as Error).message}\n`);
    process.exit(2);
  }
}
