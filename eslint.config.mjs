import eslint from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  { ignores: ["dist-bundle/*", "dist/*"] },
  {
    name: "base",
    settings: {
      react: {
        version: "19.0",
      },
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // - eslint rules
      // Possible Problems
      "array-callback-return": "error",
      "no-duplicate-imports": "warn",
      "no-self-compare": "error",
      "no-unmodified-loop-condition": "error",
      "no-unneeded-ternary": ["warn", { defaultAssignment: false }],
      "valid-typeof": ["error", { requireStringLiterals: true }],

      // Suggestions
      "accessor-pairs": "warn",
      "block-scoped-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "warn",
      "no-implicit-coercion": "error",
      "no-label-var": "error",
      "no-lone-blocks": "warn",
      "no-lonely-if": "warn",
      "no-multi-assign": "error",
      "no-new": "warn",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-throw-literal": "error",
      "no-undef-init": "error",
      "no-useless-call": "warn",
      "no-useless-computed-key": "warn",
      "no-useless-concat": "warn",
      "no-useless-rename": "warn",
      "no-useless-return": "warn",
      radix: "error",
      "object-shorthand": "warn",
      "operator-assignment": "warn",
      "prefer-regex-literals": "warn",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "prefer-template": "warn",
      "sort-imports": ["warn", { ignoreDeclarationSort: true }],
      "symbol-description": "error",
      yoda: ["warn", "never", { exceptRange: true }],

      // - typescript-eslint rules
      "no-unused-vars": "off",
      "@typescript-eslint/array-type": ["warn", { default: "array-simple" }],
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/dot-notation": ["warn", { allowKeywords: true }],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": ["warn", { accessibility: "explicit" }],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "default",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
          filter: {
            regex: "^[a-zA-Z_$][a-zA-Z0-9_$]*$",
            match: true,
          },
        },
      ],
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-confusing-void-expression": ["warn", { ignoreArrowShorthand: true }],
      "@typescript-eslint/no-floating-promises": ["error", { ignoreIIFE: true }],
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "@typescript-eslint/no-unnecessary-condition": [
        "warn",
        { allowConstantLoopConditions: false },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "all",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-use-before-define": [
        "error",
        {
          functions: false,
          classes: false,
          variables: true,
          allowNamedExports: true,
        },
      ],
      "@typescript-eslint/no-useless-constructor": "warn",
      "@typescript-eslint/prefer-destructuring": [
        "warn",
        {
          VariableDeclarator: { array: false, object: true },
          AssignmentExpression: { array: false, object: false },
        },
        { enforceForRenamedProperties: false },
      ],

      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/restrict-template-expressions": "off",

      // - eslint-plugin-react rules
      "react/display-name": "off",
      "react/prop-types": "off",
    },
  },
  {
    name: "renderer",
    files: ["src/renderer/**/*.{ts,tsx,mts,cts}"],
    rules: {
      // Use Logger instead of console
      "no-console": "error",
    },
  },
  {
    name: "renderer-modules",
    files: ["src/renderer/modules/{common,components}/*.{ts,tsx,mts,cts}"],
    rules: {
      // These files sometimes have checks that are technically unnecessary according to the typedefs,
      // but should help prevent a crash in the case of an unexpected Discord change
      // So we will allow them
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
);
