# Security Policy

`agent-card-readme-generator` is a pure-transform library and CLI: it reads an AgentCard JSON file and emits Markdown. No network listener, no remote fetch, no execution of user-supplied code, no live agent invocation.

The input may include internal tool names, model identifiers, and refusal categories that are sensitive in your environment. The Markdown output includes those values verbatim — be deliberate about where you publish the rendered README.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/agent-card-readme-generator/security/advisories/new)

Do not file public issues for security reports.
