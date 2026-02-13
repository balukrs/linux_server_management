import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import perfectionist from 'eslint-plugin-perfectionist'
import jest from 'eslint-plugin-jest'

export default tseslint.config(
  {
    ignores: ['*.config.js', '*.config.mjs', '*.config.ts', 'src/lib/prisma.ts'],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  perfectionist.configs['recommended-natural'],
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    ...jest.configs['flat/recommended'],
    ...jest.configs['flat/style'],
    languageOptions: {
      ...jest.configs['flat/recommended'].languageOptions,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
)
