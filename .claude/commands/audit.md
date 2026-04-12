---
description: Run the five auditor subagents (accessibility, performance, design, security, motion) in parallel over the given path(s). Usage: /audit [path or glob, default = app/]
argument-hint: [path or glob]
---

Run a full standards audit on `$ARGUMENTS` (default `app/`).

Steps:

1. Resolve the target: if `$ARGUMENTS` is empty, use `app/`. Otherwise use the
   passed path or glob.
2. Launch the following five agents **in parallel** (single message, five
   Agent tool calls) with the target and the goal:
   - `accessibility-auditor`
   - `performance-auditor`
   - `design-critic`
   - `security-auditor`
   - `motion-reviewer`
3. Each agent returns a short markdown report. Do NOT re-synthesise their
   findings into a new narrative — just present the five reports under
   H2 headings in this order:
   - `## ♿ Accessibility`
   - `## ⚡ Performance`
   - `## 🎨 Design`
   - `## 🔒 Security`
   - `## ✨ Motion`
4. Below the reports, add a **Top 3 fixes** section listing only the three
   highest-severity findings across all reports — file + line + one-line fix.
   Skip if everything passes.
5. End with a single verdict line in the format:
   `AUDIT: A11y <v> | Perf <v> | Design <v> | Sec <v> | Motion <v>`
   where `<v>` is each agent's final verdict token.

Do not write any code during this audit. This command is read-only —
implementation of fixes is a separate, explicit request.
