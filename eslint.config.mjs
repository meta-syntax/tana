// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default withNuxt(
  js.configs.recommended,
  {
    ignores: ['app/types/database.types.ts']
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    extends: [...tseslint.configs.recommended]
  },
  {
    rules: {
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.vue'],
    rules: {
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
)
