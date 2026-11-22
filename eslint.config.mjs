// @ts-check
import expo from 'eslint-config-expo/flat.js'

// e2e-boot*.mjs = gitignored sandbox-only E2E tooling (node Buffer APIs;
// never shipped) — same treatment the .sh tooling got by extension.
export default [...expo, { ignores: ['dist/**', '.expo/**', 'node_modules/**', 'docs/**', '*.md', 'assets/**', 'e2e-boot*.mjs'] }]
