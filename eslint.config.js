import js from "@eslint/js";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // On applique la base recommandée partout
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node, // On ajoute node pour la polyvalence
        ...globals.es2021,
      },
    },
    rules: {
      // --- ERREURS POTENTIELLES ---
      "no-console": "error", // Interdit console.log (utilise un logger en prod)
      "no-debugger": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-duplicate-imports": "error",
      "no-unreachable": "error",

      // --- BONNES PRATIQUES (STRICTES) ---
      "eqeqeq": ["error", "always"], // Interdit == et != (force === et !==)
      "curly": ["error", "all"], // Force les accolades pour TOUS les blocs (if, while, etc.)
      "no-var": "error", // Interdit var (force let/const)
      "prefer-const": "error", // Force const si la variable n"est pas réassignée
      "no-multi-spaces": "error",
      "no-eval": "error", // La sécurité avant tout
      "no-implied-eval": "error",
      "no-return-assign": "error", // Interdit les assignations dans un return

      // --- STYLE & LISIBILITÉ ---
      "indent": ["error", 2], // Force 2 espaces (ou 4 selon ta préférence)
      "quotes": ["error", "double", { "avoidEscape": true }], // Force les doubles quotes
      "semi": ["error", "always"], // Force le point-virgule (sujet sensible, mais strict)
      "comma-dangle": ["error", "always-multiline"], // Virgule traînante obligatoire pour le diff git propre
      "arrow-spacing": ["error", { "before": true, "after": true }],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"], // Oblige une ligne vide à la fin du fichier

      // --- COMPLEXITÉ ---
      "complexity": ["error", 10], // Alerte si une fonction est trop complexe (cerveau humain friendly)
      "max-depth": ["error", 4], // Interdit d"imbriquer plus de 4 niveaux de if/loops
    },
  },
];
