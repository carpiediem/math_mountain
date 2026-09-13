const { version } = require("./package.json");

const IS_DEV = process.env.APP_VARIANT === "development";

// Self-hosted, Sentry-protocol crash reporting against bugsink.rslc.dev (see
// README). This project doesn't have a Bugsink project/DSN provisioned yet -
// leave empty until one exists so @sentry/react-native simply no-ops instead
// of failing to init against a bogus endpoint (see utils/sentry.ts).
const SENTRY_DSN = process.env.SENTRY_DSN ?? "";

module.exports = {
  expo: {
    name: IS_DEV ? "Math Mountain (Dev)" : "Math Mountain",
    slug: "math-mountain",
    version,
    scheme: IS_DEV
      ? ["math-mountain-dev", "us.rslc.mathmountain.dev"]
      : ["math-mountain", "us.rslc.mathmountain"],
    orientation: "default",
    userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-splash-screen",
      ...(SENTRY_DSN
        ? [
            [
              "@sentry/react-native",
              {
                url: `${new URL(SENTRY_DSN).origin}/`,
                organization: "bugsinkhasnoorgs",
                project: "math-mountain",
              },
            ],
          ]
        : []),
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID ?? "",
      },
      sentryDsn: SENTRY_DSN,
    },
    android: {
      package: IS_DEV ? "us.rslc.mathmountain.dev" : "us.rslc.mathmountain",
      adaptiveIcon: {
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundColor: "#3f6b4f",
      },
    },
    ios: {
      bundleIdentifier: IS_DEV
        ? "us.rslc.mathmountain.dev"
        : "us.rslc.mathmountain",
      supportsTablet: true,
    },
  },
};
