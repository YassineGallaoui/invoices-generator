# `.claude/` — Claude Code configuration

This directory configures [Claude Code](https://docs.claude.com/en/docs/claude-code)
for this repo. Everything here is **committed and team-wide**, except
`settings.local.json` (your personal permissions, ignored by git).

## Files

| File | Purpose |
| --- | --- |
| [`settings.json`](./settings.json) | Team permissions + status line. Shared by every contributor. |
| `settings.local.json` | Your personal permission grants (auto-managed by Claude Code). **Not committed.** |
| [`agents/`](./agents) | Project-scoped subagents (see below). |
| [`commands/`](./commands) | Slash commands (see below). |

The root [`CLAUDE.md`](../CLAUDE.md) is the main instruction file — Claude
Code loads it automatically on every session.

## Subagents (in `agents/`)

Invoke via the Agent tool (`subagent_type: <name>`). Use **proactively** on
user-facing changes.

| Agent | Use when |
| --- | --- |
| `accessibility-auditor` | Touched Vue/HTML, forms, ARIA, keyboard handling, motion. WCAG 2.2 AA check. |
| `performance-auditor` | Added components, deps, images, fonts, or network calls. Core Web Vitals / SSR / bundle check. |
| `design-critic` | Shipped a page or major component. Typography, rhythm, density, polish. |
| `security-auditor` | Touched user input, server routes, env vars, third-party scripts, uploads, or dependencies. |
| `motion-reviewer` | Added or changed `motion-v` usage, CSS transitions, or keyframe animations. Reduced-motion compliance. |

## Slash commands (in `commands/`)

Invoke with `/<name> [args]`.

| Command | Description |
| --- | --- |
| `/verify` | Run `pnpm lint` + `pnpm build` and report status. |
| `/new-component <PascalName>` | Scaffold a new component folder following repo conventions. |
| `/new-page <kebab-name>` | Scaffold a new page with a11y + SEO defaults. |
| `/audit [path]` | Run all five auditors in parallel on the given path (default `app/`). |

## Standards baked in

Every auditor and every slash command aligns with the five dimensions from
`CLAUDE.md`:

- 🔒 **Security** — XSS, validation, secrets, CSP, deps.
- ♿ **Accessibility** — WCAG 2.2 AA, keyboard, semantic HTML, focus.
- ⚡ **Performance** — Core Web Vitals, SSR-first, image/font/bundle hygiene.
- 🎨 **Design** — editorial-grade typography, rhythm, restraint.
- ✨ **Motion** — purposeful, fast, reduced-motion respecting.

If you add a new agent or command, keep these dimensions in mind — a
low-quality "lint fixer" agent that ignores accessibility is a regression,
not an addition.
