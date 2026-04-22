export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "prisma/migrations/**",
      "prisma/generated/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "object-shorthand": ["error", "always"],
      "no-var": "error",
      "no-empty-function": "error",
      "no-redeclare": "error",
      "no-dupe-keys": "error",
      "no-implicit-coercion": "error",
      "no-return-await": "error",
      "no-useless-return": "error",
      "consistent-return": "error",
      "default-case": "error",
    },
  },
];
