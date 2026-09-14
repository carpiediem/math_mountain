---
name: build-production-store
description: Build a local, Play-Console-uploadable production-store Android .aab for Math Mountain using eas build --local. Use when asked to produce a production/release/store build, a build for Play Store, or a production-store .aab, especially when the request says to do it locally rather than on EAS's cloud builders.
---

# Build a local production-store Android bundle

Produces a real, signed, Play-Console-uploadable `.aab` via
`eas build --local --profile production-store --platform android`, without
consuming EAS's cloud build queue/quota.

## Before starting

Confirm you're on the branch/commit the user wants shipped (usually `main`)
and that the working tree is clean — this build packages whatever is on
disk, not just committed changes.

## Steps

1. **Get the Sentry auth token.** `eas build --local` packages the project
   from the git-tracked tree, so the gitignored `./.sentryclirc` never
   reaches the build context and `sentry-cli` fails with "Auth token is
   required" unless the token is exported into the _same_ shell invocation
   that runs the build:

   ```
   SENTRY_AUTH_TOKEN=$(awk -F= '/^token=/{print $2}' .sentryclirc) \
   ```

2. **Run the build in the background**, with a long timeout — this class of
   build takes ~9–10 minutes end to end, well past the default 2-minute
   command timeout. This is not optional: a foreground call gets killed by
   the default timeout before the build finishes, and re-running after a
   kill still burns a versionCode increment for nothing if
   `appVersionSource: "remote"` with `autoIncrement: true` is set (see
   `eas.json`) — don't run it "just to check" and don't retry casually.

   Write the `.aab` straight into the repo root as `math-mountain-build.aab`
   (gitignore `*.aab` if not already — confirm with `git check-ignore` if in
   doubt rather than assuming) — a placeholder name, since the real
   versionCode isn't known until the build log reports it in step 3:

   ```
   SENTRY_AUTH_TOKEN=$(awk -F= '/^token=/{print $2}' .sentryclirc) \
   npx eas-cli build --local --profile production-store --platform android --non-interactive \
     --output math-mountain-build.aab \
     > math-mountain-build.log 2>&1
   ```

   Pass this to the Bash tool with `run_in_background: true` and a timeout
   of at least 600000ms (10 min).

3. **On completion**, read the actual versionCode this build shipped with
   out of the log — don't trust a versionCode checked/predicted beforehand,
   since every build attempt (including ones that got killed before
   finishing) increments the remote counter, so the "next" number drifts
   across retries:

   ```
   grep -m1 '"versionCode"' math-mountain-build.log
   ```

   Then rename using the current `package.json` version and that
   versionCode:

   ```
   mv math-mountain-build.aab "math-mountain-<version>-<versionCode>.aab"
   ```

## Known gotchas

- Release signing is a **remote EAS credential**, not a local keystore —
  `eas build --local` fetches it from EAS's servers for the build's
  duration. There's no way to build a real store-signed `.aab` without
  invoking `eas-cli`.
- Don't run `gradlew bundleRelease` directly — a checked-in debug signing
  config produces a bundle Play Console will reject.
- Don't commit the Sentry token or work around a missing env var by editing
  gitignored files into the build context.
