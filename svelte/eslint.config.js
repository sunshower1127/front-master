// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	// FSD layer boundary rules
	{
		files: ['src/**/*.{ts,js,svelte}'],
		plugins: { boundaries },
		settings: {
			'boundaries/elements': [
				{ type: 'shared', pattern: ['src/lib/shared/*'], mode: 'folder' },
				{ type: 'entities', pattern: ['src/lib/entities/*'], mode: 'folder' },
				{ type: 'features', pattern: ['src/lib/features/*'], mode: 'folder' },
				{ type: 'widgets', pattern: ['src/lib/widgets/*'], mode: 'folder' },
				{ type: 'routes', pattern: ['src/routes/*'], mode: 'folder' }
			],
			'import/resolver': {
				typescript: { alwaysTryTypes: true }
			}
		},
		rules: {
			'boundaries/element-types': [
				'error',
				{
					default: 'disallow',
					rules: [
						{ from: 'shared', allow: ['shared'] },
						{ from: 'entities', allow: ['shared', 'entities'] },
						{ from: 'features', allow: ['shared', 'entities'] },
						{ from: 'widgets', allow: ['shared', 'entities', 'features', 'widgets'] },
						{ from: 'routes', allow: ['shared', 'entities', 'features', 'widgets'] }
					]
				}
			]
		}
	}
);
