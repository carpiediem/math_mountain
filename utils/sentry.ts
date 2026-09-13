import Constants from "expo-constants";
import * as Sentry from "@sentry/react-native";

// No-ops (init() is simply never called) until this project has a real
// Bugsink project and DSN - see the SENTRY_DSN comment in app.config.js.
export function initSentry() {
  const dsn = Constants.expoConfig?.extra?.sentryDsn;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0,
  });
}
