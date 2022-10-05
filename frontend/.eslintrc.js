module.exports = {
  extends: [
    "@antfu",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "@typescript-eslint/no-use-before-define": "off",
    "curly": "off",
    "arrow-parens": ["error", "as-needed"],
    "@typescript-eslint/consistent-type-definitions": "off",
  },
  ignorePatterns: [".*.js", "*.js", "dist/**/*", "wailsjs/**/*"]
};
