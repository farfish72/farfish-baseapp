import js from "@eslint/js";

const eslintConfig = [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  {
    ignores: [".next/*", "node_modules/*", "out/*", "dist/*"],
  },
];

export default eslintConfig;
