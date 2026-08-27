import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This app fetches data on mount inside useEffect (the standard,
      // long-established React data-fetching pattern) throughout the
      // dashboard. The "set-state-in-effect" rule is a new, compiler-focused
      // rule that flags that entire pattern as an error; downgraded to a
      // warning here so real bugs still surface without blocking on this.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
