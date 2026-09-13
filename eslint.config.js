// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const a11yPlugin = require("eslint-plugin-react-native-a11y");

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
    files: ["jest.setup.js"],
    languageOptions: {
      globals: {
        jest: "readonly",
      },
    },
  },
]);
