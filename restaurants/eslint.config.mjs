import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Themes get plain props only, so swapping a theme can never touch data or admin code.
    files: ["themes/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/supabase", "@/lib/supabase/*"], message: "Themes may not import from lib/supabase." },
            { group: ["@/lib/data", "@/lib/data/*"], message: "Themes may not import from lib/data." },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "clients/*/assets/**"]),
]);

export default eslintConfig;
