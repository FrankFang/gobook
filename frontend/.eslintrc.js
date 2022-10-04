module.exports = {
  extends: [
    "@antfu",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "@typescript-eslint/no-use-before-define": "off",
    "arrow-parens": ["error", "as-needed"]
  },
  ignorePatterns: [".*.js", "*.js", "dist/**/*", "wailsjs/**/*"]
};
