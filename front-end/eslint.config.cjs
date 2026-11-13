const {FlatCompat} = require("@eslint/eslintrc");
const compat = new FlatCompat({baseDirectory:__dirname});
module.exports = [
  ...compat.extends("next/core-web-vitals","next/typescript"),
  {
    ignores: [".next/**","node_modules/**","playwright-report/**","test-results/**","e2e/**","public/**"]
  },
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];
