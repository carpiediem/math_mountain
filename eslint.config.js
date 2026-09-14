// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const a11yPlugin = require("eslint-plugin-react-native-a11y");
const globals = require("globals");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
  {
    // "all" covers both iOS- and Android-specific rules since the app ships
    // on both, plus web.
    plugins: { "react-native-a11y": a11yPlugin },
    rules: a11yPlugin.configs.all.rules,
  },
  {
    // Plain-JS test files (unlike .ts/.tsx ones - eslint-config-expo's
    // typescript-eslint setup defers undefined-name checking to tsc there,
    // which already knows about tsconfig.json's "types": ["jest"]) need
    // jest's globals declared explicitly or no-undef flags describe/it/
    // expect/etc.
    files: ["jest.setup.js", "**/*.test.js"],
    languageOptions: {
      globals: globals.jest,
    },
  },
]);
