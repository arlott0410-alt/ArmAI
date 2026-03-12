import { defineWorkspace } from 'vitest/config'

/**
 * Monorepo workspace: run tests from root with `vitest` / `vitest --ui` / `vitest run --coverage`.
 * - apps/web: jsdom + React Testing Library (setup in apps/web/vitest.config.ts)
 * - apps/api: node
 * - packages/shared: node
 */
export default defineWorkspace(['apps/web', 'apps/api', 'packages/shared'])
