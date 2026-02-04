# vue-superselect

Headless Vue 3 select/combobox component library. Replaces the abandoned vue-select with a TypeScript-first, accessible, zero-style alternative.

## Project Context

- **Architecture:** Dual API — compound components (primary, provide/inject) + composable `useSelect<T>()` with prop getters
- **Stack:** Vue 3.5+, TypeScript strict, Vite library mode, Vitest + Vue Testing Library
- **Dependencies:** Zero runtime deps. `@floating-ui/vue` as optional peer dep.
- **Planning docs:** `.planning/` directory contains PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md

## Commit Messages

- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`, `perf:`, `build:`
- Keep subject line under 72 characters
- Use imperative mood ("add filter logic" not "added filter logic")
- Never include "Co-Authored-By" lines referencing Claude, AI, or any AI tool
- Reference requirement IDs when relevant (e.g., "feat: add multi-select mode (MULTI-01)")

## Pull Requests

- Never include references to Claude Code, AI tools, or auto-generation disclaimers in PR title or body
- No emoji badges or "Generated with" footers
- Write PR descriptions as if authored by a human contributor

## Code Style

- TypeScript strict mode — zero `any`, full generic inference
- Composition API for all internal implementation
- All components must work when consumed from Options API
- No inline styles — headless means zero shipped CSS
- Dev-only warnings wrapped in `__DEV__` checks for tree-shaking
- Follow Vue 3 naming conventions: `useX` for composables, `SelectX` for components

## Documentation

- Do not add comments or annotations mentioning AI assistance in code or docs
- JSDoc on all public API exports
- Keep comments minimal — code should be self-explanatory
