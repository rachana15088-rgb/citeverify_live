import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { console: 'readonly', process: 'readonly', Buffer: 'readonly', window: 'readonly', document: 'readonly', sessionStorage: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', File: 'readonly', FormData: 'readonly', Request: 'readonly', Response: 'readonly', fetch: 'readonly', AbortSignal: 'readonly', TextDecoder: 'readonly', URL: 'readonly', Blob: 'readonly', structuredClone: 'readonly' } },
    rules: { '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] },
  },
)
