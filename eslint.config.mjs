// @ts-check
import expo from 'eslint-config-expo/flat.js'

export default [...expo, { ignores: ['dist/**', '.expo/**', 'node_modules/**', 'docs/**', '*.md', 'assets/**'] }]
