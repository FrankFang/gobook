module.exports = {
  extends: [
    "@antfu",
    "plugin:@typescript-eslint/recommended"
  ],
  // root: true,
  // parser: "@typescript-eslint/parser",
  // parserOptions: {
  //   tsconfigRootDir: __dirname
  // },
  // plugins: [
  //   "@typescript-eslint"
  // ],
  rules: {
    "@typescript-eslint/no-use-before-define": "off",
    // "@typescript-eslint/no-unnecessary-type-constraint": 'off',
    // "@typescript-eslint/no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": true }],
    // "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": true }],
  },
  ignorePatterns: [".*.js", "*.js", "dist/**/*", "wailsjs/**/*"]
};
