// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default withNuxt(
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    extends: [...tseslint.configs.recommended]
  },
  {
    rules: {
      'no-undef': 'off'
    }
  }
)
