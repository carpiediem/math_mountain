# Math Mountain

An arithmetic game built with my daughter — answer questions correctly to
climb the mountain.

Built with [Expo](https://expo.dev).

[![CI](https://github.com/carpiediem/math_mountain/actions/workflows/ci.yml/badge.svg)](https://github.com/carpiediem/math_mountain/actions/workflows/ci.yml)

## Features

- Single screen with a `QuestionPanel` and a `MountainProgress` view,
  laid out side by side on large screens and stacked on small ones
- Runs on iOS, Android, and web from a single codebase

### Future Work

This is an early skeleton — the actual arithmetic gameplay (question
generation, scoring, and mountain-climbing progress) isn't built yet.

## Tech stack

- [Expo](https://expo.dev) / [React Native](https://reactnative.dev)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) for unit/component testing
- [Maestro](https://maestro.mobile.dev/) for on-device E2E testing
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) for linting/formatting
- [Bugsink](https://bugsink.rslc.dev) (self-hosted, Sentry-protocol) for crash reporting, via `@sentry/react-native` — see [Sentry / Bugsink](AGENTS.md#sentry--bugsink) in `AGENTS.md` for setup status

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm
- For native builds: [Expo Go](https://expo.dev/go) on a physical device, or
  an iOS Simulator / Android Emulator set up locally

### Installation

```sh
npm install
```

### Running the app

```sh
npm start         # start the dev server (scan the QR code with Expo Go)
npm run android   # run on a connected Android device/emulator
npm run ios       # run on a connected iOS device/simulator
npm run web       # run in a web browser
```

## Available scripts

| Script                   | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `npm start`              | Start the Expo dev server                        |
| `npm run android`        | Run on a connected Android device/emulator       |
| `npm run ios`            | Run on a connected iOS device/simulator          |
| `npm run web`            | Start the dev server and open in a browser       |
| `npm run prebuild`       | Regenerate the `ios`/`android` native projects   |
| `npm run prebuild:clean` | Same, but wipe `ios`/`android` first (`--clean`) |
| `npm test`               | Run the unit test suite (Jest)                   |
| `npm run e2e`            | Run all Maestro E2E flows                        |
| `npm run lint`           | Run ESLint                                       |
| `npm run format:check`   | Check formatting with Prettier                   |
| `npm run format`         | Fix formatting with Prettier                     |

## Project structure

```text
components/   Reusable UI components (QuestionPanel, MountainProgress)
utils/        Non-React helpers (Sentry init)
.maestro/     Maestro E2E flows
AGENTS.md     Conventions and notes for AI coding agents
```

## Testing

### Checks

```bash
npm run lint
npm run format:check
npx tsc --noEmit
npm test         # Jest unit tests
npm run e2e      # Maestro flows, requires a running simulator/emulator + dev build
```

### E2E testing (Maestro)

[Maestro](https://maestro.mobile.dev/) flows live in `.maestro/flows/` and
drive a real installed build end-to-end.

Install the CLI once:

```sh
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Then build and install a development client (see
[Building and releasing](#building-and-releasing)), start it, and run:

```sh
npm run e2e
```

## Building and releasing

Remote builds run on [EAS](https://docs.expo.dev/eas/) — see `eas.json` for
build profiles:

```sh
npm run build:dev          # development client, internal distribution
npm run build:preview      # internal distribution, production-shaped
npm run build:production   # internal distribution
```

For a local, Play-Console-uploadable `.aab`, see
[`.claude/skills/build-production-store/SKILL.md`](.claude/skills/build-production-store/SKILL.md).

Building for real devices/stores requires an EAS project (`eas init`) and,
for crash reporting, a Bugsink project at <https://bugsink.rslc.dev/> —
neither is provisioned yet for this project. See `AGENTS.md` for what's
needed once they exist.

## Credits

The `Hiker` sprite (`assets/images/hiker-sprites.png`) is cropped from
["Pokemon Sword Gloria (Female Player) Gen 4 OW V2"](https://www.deviantart.com/boonzeet/art/Pokemon-Sword-Gloria-Female-Player-Gen-4-OW-V2-842639028)
by [Boonzeet](https://www.deviantart.com/boonzeet).

The `Goat` sprite (`assets/images/goat-sprites.png`) is cropped from
["Pilgor - Goat Simulator sprites"](https://www.deviantart.com/xxultra2006xx/art/Pilgor-Goat-Simulator-sprites-890748891)
by [xxultra2006xx](https://www.deviantart.com/xxultra2006xx).
