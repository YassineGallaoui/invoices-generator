---
description: Run lint + production build to verify the project is in a shippable state. Surfaces any warnings or errors. Use before declaring a task complete.
allowed-tools: Bash(pnpm lint:*), Bash(pnpm build:*), Bash(pnpm typecheck)
---

Run the full verification flow and summarise the result.

1. Run `pnpm lint` and capture exit code + last 40 lines of output.
2. Run `pnpm build` and capture exit code + last 40 lines of output.

Report:

- ✅ / ❌ for each step.
- Any lint warnings (even on pass).
- Build bundle size summary (total + per-route).
- If anything failed, print the actionable error lines — do not fix them
  unless the user asks.

Finish with one line: `VERIFY: PASS` or `VERIFY: FAIL — <1-line reason>`.
