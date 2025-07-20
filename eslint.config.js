import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['./src/**/*.ts'],
    ignores: [
      './dist/**',
      './lib/**',
      './test/**',
      './*.js',
      './*.ts',
      './*.d.ts',
      './src/**/*.d.ts'
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        Element: 'readonly',
        Document: 'readonly',
        SVGElement: 'readonly',
        HTMLElement: 'readonly',
        Node: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        TouchEvent: 'readonly',
        Range: 'readonly',
        DOMRect: 'readonly',
        DOMRectList: 'readonly',
        HTMLIFrameElement: 'readonly',
        attr: 'readonly',
        contains: 'readonly',
        Object: 'readonly',
        hasOwnProperty: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-var': 'error',
      'quotes': ['error', 'single']
    }
  }
];
