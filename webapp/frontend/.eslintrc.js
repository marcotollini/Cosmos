module.exports = {
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    '@vue/typescript/recommended',
    'eslint:recommended',
    "prettier"
  ],
  plugins: [
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": "off",
    "block-scoped-var": "error",
    "eqeqeq": "error",
    "no-var": "error",
    "prefer-const": "error",
    "eol-last": "error",
    "prefer-arrow-callback": "error",
    "no-trailing-spaces": "error",
    "quotes": ["warn", "single", { "avoidEscape": true }],
    "no-restricted-properties": [
      "error",
      {
        "object": "describe",
        "property": "only"
      },
      {
        "object": "it",
        "property": "only"
      }
    ]
  },
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "parser": "@typescript-eslint/parser",
      "extends": [
        "plugin:@typescript-eslint/recommended"
      ],
      "rules": {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-warning-comments": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/camelcase": "off",
        "node/no-missing-import": "off",
        "node/no-empty-function": "off",
        "node/no-unsupported-features/es-syntax": "off",
        "node/no-missing-require": "off",
        "node/shebang": "off",
        "no-dupe-class-members": "off",
        "require-atomic-updates": "off"
      },
      "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
      }
    }
  ]
}
