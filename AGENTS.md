# Notes for AI Agents

## Branch naming

Use a `fix/` or `enh/` prefix depending on the kind of work:

- `fix/` — bug fixes
- `enh/` — enhancements / new functionality
- `inf/` - infrastructure changes to dependency versions or workflows

If the branch addresses a specific issue, include its number right after the
prefix: `fix/12-some-bug-fix`. If there's no issue, just describe the work:
`enh/short-description`.

## Formatting

Run `npx prettier --check <file>` (or `--write` to fix) on every changed file
immediately before committing — including Markdown and other non-code files,
not just source. CI's `format:check` step catches misses anyway, but it's
cheap to catch instantly with Prettier instead of needing a follow-up commit.

## Closing keyword syntax when one PR/commit fixes multiple issues

GitHub only reliably auto-closes the _first_ issue number after a closing
keyword (`Fixes`/`Closes`/`Resolves`) — a comma-separated list after a single
keyword (`Fixes #248, #249, #250.`) only closes the first one. Repeat the
keyword per issue instead — `Fixes #248, Fixes #249, Fixes #250.` (or one
`Fixes #N` per line) — any time a single PR or commit message closes more
than one issue.

## Sentry / Bugsink

Crash reporting is self-hosted against a Bugsink instance
(<https://bugsink.rslc.dev/>, Sentry-protocol-compatible) rather than
sentry.io. This project doesn't have a Bugsink project/DSN provisioned yet —
`app.config.js`'s `SENTRY_DSN` is empty until one exists, which makes
`utils/sentry.ts`'s `initSentry()` a no-op. Once a DSN is provisioned, also
set `SENTRY_URL`, `SENTRY_ORG` (`bugsinkhasnoorgs` — Bugsink has no real
concept of orgs, this is a fixed placeholder its own docs specify), and
`SENTRY_PROJECT` as EAS environment variables alongside `SENTRY_AUTH_TOKEN` —
`sentry-cli` refuses to combine an env-var-sourced auth token with a
file-sourced URL/org/project during a cloud build, even when both are
individually correct.
