# Notes for AI Agents

## Branch naming

Use a `fix/` or `enh/` prefix depending on the kind of work:

- `fix/` — bug fixes
- `enh/` — enhancements / new functionality
- `inf/` - infrastructure changes to dependency versions or workflows

If the branch addresses a specific issue, include its number right after the
prefix: `fix/12-some-bug-fix`. If there's no issue, just describe the work:
`enh/short-description`.

## Targeting a PR's base branch

Before opening a non-release PR, check whether a `release/X.Y.Z` branch
currently exists (`git branch -r | grep release`). If one does, open the PR
against that branch instead of `main` — a release branch in flight means
`main` isn't the integration target right now, and a sub-PR merged straight
to `main` would skip the release branch entirely. This applies even when the
PR's own work has nothing to do with the release; the check is "does a
release branch exist," not "is this PR related to the release."

If a release branch appears _after_ a PR was already opened against `main`,
retarget it (`gh pr edit <PR> --base release/X.Y.Z`) rather than leaving it
pointed at `main` — then update the release PR's "Open PRs targeting
release/X.Y.Z" table (see below) to include it.

## Release PRs

A release PR merges a `release/X.Y.Z` branch into `main` once its sub-PRs are
individually reviewed, tested, and merged into the release branch. Use this
format:

- **Title**: `Release X.Y.Z`
- **`## Summary`** — one or two sentences: this rolls up everything merged
  into `release/X.Y.Z` since it branched from `main`; each sub-PR is
  separately reviewed/tested/merged already, so this is the final
  integration merge.
- **`## Merged into release/X.Y.Z`** — a table of every sub-PR already
  merged into the release branch:

  | PR  | Title | Issue(s) closed on this merge |
  | --- | ----- | ----------------------------- |

  Use `—` (with a short parenthetical) for a PR that doesn't close an issue
  outright — a partial fix, a follow-up, or infrastructure work.

- **A second table, `## Open PRs targeting release/X.Y.Z`** — every open or
  draft PR whose base branch is still `release/X.Y.Z` at the time the release
  PR is opened, so a reviewer can see at a glance what's still in flight and
  isn't in this release cut:

  | PR  | Title | Issue(s) Addressed |
  | --- | ----- | ------------------ |

  If nothing is still open against the release branch, keep the section
  header and state that explicitly (e.g. "None — every PR targeting this
  branch has been merged.") rather than omitting the section.

- **`## Test plan`** — a brief note that each sub-PR carries its own test
  plan (jest/tsc/eslint/prettier all green) and this release merge itself
  introduces no additional changes.

### Closing keyword syntax when one PR/commit fixes multiple issues

GitHub only reliably auto-closes the _first_ issue number after a closing
keyword (`Fixes`/`Closes`/`Resolves`) — a comma-separated list after a single
keyword (`Fixes #248, #249, #250.`) only closes the first one.
Repeat the keyword per issue instead — `Fixes #248, Fixes #249, Fixes #250.`
(or one `Fixes #N` per line) — any time a single PR or commit message closes
more than one issue, release-rollup PRs included.

## Formatting

Run `npx prettier --check <file>` (or `--write` to fix) on every changed file
immediately before committing — including Markdown and other non-code files,
not just source. CI's `format:check` step catches misses anyway, but it's
cheap to catch instantly with Prettier instead of needing a follow-up commit.

## Running rn-\* skill reviews

When any `rn-*` skill/agent (`rn-security`, `rn-permissions`, `rn-performance`,
`rn-code-quality`, `rn-ui-accessibility`, `rn-testing`, etc.) is run as a
full-repo review, always end the run by filing GitHub issues for the
findings — don't just report them in chat and stop.

- **Filing issues is not "modifying files."** If a review is dispatched
  (e.g. to a subagent) with a scope-limiting instruction like "review only,
  don't modify files," that instruction constrains changes to the repo's
  tracked files — it does not exempt filing GitHub issues, which still
  applies per this section regardless of how that instruction is worded.
  When delegating an rn-\* review, say so explicitly rather than relying on
  the delegate to infer it.
- **Scope to the whole repo on `main` or any `release/*` branch.** When one
  of these skills is invoked while on `main` or a `release/*` branch, run it
  against the entire repo rather than scoping to the current diff, even if
  no explicit target is given and there happens to be no diff against
  `origin/HEAD` to fall back on.
- **Check for duplicates first.** Run `gh issue list --state open` (searching
  by keyword or file path first) before creating anything — these reviews
  re-run periodically and will re-surface findings already tracked. Skip or
  update an existing issue rather than filing a near-duplicate. Also check
  this file's "Known, deliberately-decided findings" section below — those
  are settled, not gaps to re-file.
- **Group findings into issues as makes sense.** Don't file one issue per
  single-line suggestion, and don't dump every finding from a review into one
  giant issue either. A natural size is one issue per file/area, or per
  tightly-related cluster of findings — a handful of issues per full-repo
  review is typical.
- **Label every issue by priority** using this repo's `P0`–`P3` labels (`P0`
  = critical, `P1` = high, `P2` = medium, `P3` = low — matching the severity
  terms the rn-\* skills themselves already report). When an issue bundles
  findings of different severities, label it with the _highest_ severity
  present in the bundle.
- **Filing an issue is not permission to fix it.** Opening a PR against a
  finding still needs the user's go-ahead first, same as any other work.

## Known, deliberately-decided findings

A future audit (rn-payments, rn-security, or the general rn-audit pass) will likely
re-surface these. They've already been investigated and explicitly decided on —
either fixed, or accepted as a known risk — and are not oversights. Read this
before re-filing them.

### `package.json` version lagging the release branch name — not a gap to file or fix

On a `release/X.Y.Z` branch, `package.json`'s `version` field commonly still
reads the previous release (e.g. `0.2.4` on `release/0.2.5`) for most of the
branch's life. This is expected, not an oversight: the user bumps it manually,
by hand, only when actually ready to merge the release PR into `main` - not
as part of cutting the branch or any individual sub-PR.

Don't file a GitHub issue proposing a version guard or automated check for
this mismatch, and don't bump the version yourself unless the user explicitly
asks you to as a standalone task (as opposed to noticing it during a review).

## Sentry / Bugsink

Crash reporting is self-hosted against a Bugsink instance
(<https://bugsink.rslc.dev/>, Sentry-protocol-compatible) rather than
sentry.io. A Bugsink project exists for this app (`math-mountain`); its DSN
lives only in a local, gitignored `.env.local` (Expo CLI loads it
automatically into `process.env` for `app.config.js`) — never commit it.
`SENTRY_URL`, `SENTRY_ORG` (`bugsinkhasnoorgs` — Bugsink has no real concept
of orgs, this is a fixed placeholder its own docs specify), `SENTRY_PROJECT`,
`SENTRY_AUTH_TOKEN`, and `SENTRY_DSN` are all set as EAS environment
variables on the `production` environment (`eas env:list --environment
production`) — `development`/`preview` builds don't have them, so Sentry
stays a no-op there. `sentry-cli` refuses to combine an env-var-sourced auth
token with a file-sourced URL/org/project during a cloud build, even when
both are individually correct, which is why all of these need to be set
together rather than just `SENTRY_AUTH_TOKEN`.

## Building a local production-store Android bundle

`eas build --local --profile production-store --platform android` produces a
real, Play-Console-uploadable `.aab`. Two things about this project's setup
trip it up if run naively:

- **Release signing is a remote EAS credential, not a local keystore.** The
  checked-in `android/app/build.gradle` (regenerated by prebuild) only has a
  debug signing config. Running `gradlew bundleRelease` directly, without
  going through `eas-cli` at all, signs with the debug key - useless for Play
  Console. `eas build --local` fetches the real upload key from EAS's servers
  for the duration of the build; there's no way around invoking `eas-cli` for
  this project's key without first exporting the key material another way.
  `eas credentials:configure-build` alone does _not_ write a usable keystore
  file to disk - it only caches which remote credentials the next
  `eas build --local` run will use.
- **`SENTRY_AUTH_TOKEN` won't come from `.sentryclirc` automatically.**
  `eas build --local` packages the project from the git-tracked tree (like a
  cloud build), so the gitignored `./.sentryclirc` never reaches the build
  context - the `sentry-cli` invocation inside `gradlew` fails with "Auth
  token is required." Read the token out of `.sentryclirc`'s `[auth]` section
  and export it as `SENTRY_AUTH_TOKEN` in the _same_ shell invocation that
  runs the build (env vars don't persist across separate tool calls in this
  environment) - don't try to commit the token or work around it by editing
  gitignored files into the build context.

The build takes ~9-10 minutes end to end; run it with a longer timeout or in
the background rather than the default 2-minute command timeout.

## Triggering a cloud EAS build

Whenever an agent triggers a build via `eas-cli build` (any profile, cloud not
`--local`), report back three things once the build is dispatched:

- **The build's URL** (`https://expo.dev/accounts/.../builds/<id>`) - printed
  by the CLI on dispatch, also retrievable via `eas build:view <id>`.
- **The current free-tier queue wait estimate** - not accessible to the agent
  itself. `eas-cli` only prints this live, while polling interactively
  (`eas build` without `--no-wait`); passing `--no-wait` (the usual choice,
  so the agent can background the triggering command and poll separately)
  means that line is never captured, and `eas build:view`, even with
  `--json`, exposes no queue-position/ETA field for an already-queued build.
  The number does exist elsewhere, though: the build's page on the Expo
  dashboard (`https://expo.dev/accounts/.../projects/.../builds/<id>`) shows
  a live estimated-wait widget - but that page is authenticated, so an agent
  fetching it gets a generic "something went wrong" placeholder instead of
  real content. If this number matters, ask the user (who has a logged-in
  session) to read it off that page rather than treating it as unavailable.
- **How long the most recent build with similar characteristics took** - pull
  `buildQueueTime` and `buildDuration` (both milliseconds) from
  `eas build:view <previous-id> --json`'s `metrics` field for the last build
  on the same profile/platform, so the new build's expected total is a real
  data point, not a guess.

## A cloud `production-store` build needs SENTRY_URL/SENTRY_ORG/SENTRY_PROJECT as EAS environment variables, not just SENTRY_AUTH_TOKEN

A `production-store` cloud build (`eas build --profile production-store
--platform android --auto-submit-with-profile production`, no `--local`)
fails during the Android Gradle build's Sentry sourcemap-upload step with
`error: organization not found`, even though `SENTRY_AUTH_TOKEN` is already
configured as a secret EAS environment variable on the `production`
environment (confirmed via `eas env:list --environment production`).

The real cause is in the build log, not the generic error: `sentry-cli`
loads the generated `android/sentry.properties` (which carries
`defaults.url`/`defaults.org`/`defaults.project`, written by the Sentry
Expo config plugin from `app.config.js`), then logs `Ignoring a configured
URL because the selected auth token comes from a different configuration
source` and silently falls back to `sentry.io` - where the self-hosted
Bugsink org `bugsinkhasnoorgs` obviously doesn't exist. `sentry-cli`
refuses to combine an env-var-sourced auth token with a file-sourced
URL/org/project, even when both are individually correct.

**Fix**: set `SENTRY_URL`, `SENTRY_ORG`, and `SENTRY_PROJECT` as EAS
environment variables on the same `production` environment as
`SENTRY_AUTH_TOKEN` (visibility `plaintext` is fine - none of these three
are secret), matching the values already in `app.config.js`'s Sentry
plugin config:

```bash
eas env:create production --name SENTRY_URL --value "https://bugsink.rslc.dev/" --visibility plaintext
eas env:create production --name SENTRY_ORG --value "bugsinkhasnoorgs" --visibility plaintext
eas env:create production --name SENTRY_PROJECT --value "math-mountain" --visibility plaintext
```

(`eas env:create` prints a deprecation notice pointing at `eas env:set` -
still works as of eas-cli 23.2.0, that's just a forward-compat warning.)

This is a one-time, account-level fix - once set, every future cloud
`production`/`production-store` build picks it up automatically, nothing
to redo per build or per release. Confirmed fixed: a build dispatched
right after setting these logged `Environment variables with visibility
"Plain text" and "Sensitive" loaded from the "production" environment on
EAS: SENTRY_ORG, SENTRY_PROJECT, SENTRY_URL` and proceeded past the step
that previously failed.

Don't confuse this with the _local_-build `SENTRY_AUTH_TOKEN` gotcha above:
that one is about the token not reaching the build process at all (fixed
by exporting it in the invoking shell); this one is about `sentry-cli`'s
own auth-source/URL-source consistency check, which only bites once the
token _is_ present. A local build never hit this specific failure in
prior verification, but that likely means the local recipe's own Sentry
upload was never actually confirmed to succeed end-to-end (see the "EAS
Update's OTA channel" and rollback-rehearsal
entries elsewhere in this file for the general pattern of "the build
didn't hard-fail" not implying "the upload actually worked") - re-check
this if a local build's own sourcemap upload ever needs verifying.

Each build attempt against this - success or failure - burns a real,
one-way `versionCode` increment (`eas.json`'s `autoIncrement: true`) and
costs real free-tier build-queue time, so diagnose a build failure from
its actual log before retrying rather than treating "try again" as the
first move.
