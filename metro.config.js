const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// Wraps expo/metro-config's getDefaultConfig() with the Sentry Metro plugin
// so compiled bundles carry a debug ID Bugsink can match against uploaded
// source maps (see the Sentry plugin config in app.config.js).
module.exports = getSentryExpoConfig(__dirname);
