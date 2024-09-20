import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    files: ["**/*.js"],
    languageOptions: {sourceType: "commonjs"},
    rules: {
      quotes: ["error", "single"],
      semi: ["error", "always"],
    }
  },
  {
    languageOptions: { globals: globals.node }
  },
  pluginJs.configs.recommended,
];