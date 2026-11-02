import js from '@eslint/js'
import tsLint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importEslint from 'eslint-plugin-import'
import pluginNode from 'eslint-plugin-n'
import pluginPromise from 'eslint-plugin-promise'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import {
	default as pluginReactRefresh,
	default as reactRefresh,
} from 'eslint-plugin-react-refresh'
import simpleShortImport from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
	// Ignore specific files and folders
	{
		ignores: ['./dist', 'node_modules', 'vite.config.ts', 'vitest.config.ts'],
	},
	// General config for TypeScript files
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parser: tsParser,
			globals: { ...globals.browser, __APP_VERSION__: 'readonly' },
		},
		plugins: {
			'@typescript-eslint': tsLint,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			import: importEslint,
			'simple-import-sort': simpleShortImport,
			react: pluginReact,
			promise: pluginPromise,
			node: pluginNode,
			'react-refresh': pluginReactRefresh,
		},
		rules: {
			...js.configs.recommended.rules,
			...tsLint.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						// Packages `react` related packages come first.
						['^react', '^@?\\w'],
						// Internal packages.
						['^(@|components)(/.*|$)'],
						// Side effect imports.
						['^\\u0000'],
						// Parent imports. Put `..` last.
						['^\\.\\.(?!/?$)', '^\\./?$'],
						// Other relative imports. Put same-folder imports and `.` last.
						['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
						// Style imports.
						['^.+\\.?(css)$'],
					],
				},
			],
		},
	},
]
