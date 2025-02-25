import pluginJs from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
	{ languageOptions: { globals: { ...globals.browser, process: "readonly" } } },
	{
		rules: {
			"no-console": "error",
			"no-var": "error",
			"no-unused-vars": ["error", { argsIgnorePattern: "next" }],
			"no-unused-expressions": "error",
			"no-unused-labels": "error",
			"no-empty": "error",
			"no-empty-function": "error",
			"no-const-assign": "error",
			"no-unreachable": "error",
			"default-case": "error",
			eqeqeq: "error",
			"space-before-blocks": "error",
		},
	},
	pluginJs.configs.recommended,
];
