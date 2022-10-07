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
    "@typescript-eslint/brace-style": "off",
    "@typescript-eslint/no-unnecessary-type-constraint": "off",
    "@typescript-eslint/comma-dangle": ["error", {
      "arrays": "only-multiline",
      "objects": "only-multiline",
      "imports": "only-multiline",
      "exports": "only-multiline",
      "functions": "never"
    }],
  },
  ignorePatterns: [".*.js", "*.js", "dist/**/*", "wailsjs/**/*"]
};
