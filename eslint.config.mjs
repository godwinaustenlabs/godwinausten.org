import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * ESLint flat config.
 *
 * eslint-config-next 16 ships native flat configs, so no FlatCompat shim.
 */
const config = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "node_modules/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
    ],
  },

  ...coreWebVitals,
  ...nextTypescript,

  {
    rules: {
      // A module must never reach across into another module's internals.
      // Blocks are composed through src/modules/registry.ts only.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/blocks/*/*"],
              message:
                "Import a block through its own index (`@/modules/blocks/<name>`) or the registry. Reaching into a block's internals breaks the lego-block contract — see docs/modules.md.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },

  {
    // Node scripts and config files are not part of the app bundle.
    files: ["scripts/**/*.mjs", "*.config.{ts,mjs}", "tests/**/*.{ts,tsx}"],
    rules: {
      "no-console": "off",
    },
  },
];

export default config;
