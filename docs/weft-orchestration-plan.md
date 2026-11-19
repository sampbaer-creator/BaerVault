# Optional Weft orchestration plan

The live spending forecast runs deterministically inside the Next.js server.
It requires neither Weft nor a third-party model provider.
Weft is not integrated into production.
Use Weft Python steps on WSL with synthetic or offline fixtures for experiments.
Keep fixture generation, forecast comparison, and report validation as separate steps.
Compare experimental outputs against the tested TypeScript forecast contract.
Do not copy live household transactions into local orchestration experiments.
Production orchestration requires a hosted authenticated worker first.
That worker must verify household authorization and use scoped read-only access.
Bound input sizes, history ranges, timeouts, and output schemas.
Keep merchant and transaction data out of model services and execution logs.
Do not expose a developer machine or local runtime to production traffic.
Retain the server forecast when the optional worker is unavailable.
Require individual category approval before any planned-budget changes.
