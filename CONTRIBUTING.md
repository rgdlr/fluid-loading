# Contributing to Fluid Loading

Thank you for your interest in contributing to **Fluid Loading**! This document provides guidelines and instructions for contributing to the project.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Monorepo Architecture

This project is a monorepo managed with **pnpm workspaces**:

- `packages/core`: Agnostic core engine (layout measurement, FLIP morph math, state machine, CSS tokens).
- `packages/react`: Official React adapter component (`<FluidLoading>`).
- `apps/landing`: Interactive documentation and benchmark site.

---

## Getting Started

### Prerequisites

- **Node.js**: `>= 22.13.0`
- **pnpm**: `>= 10.0.0` (Recommended: `11.x`)

### Installation

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/<your-username>/fluid-loading.git
   cd fluid-loading
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start development:
   - Run interactive landing playground: `pnpm dev`
   - Run package builds in watch mode: `pnpm --filter @fluid-loading/core dev` or `pnpm --filter @fluid-loading/react dev`

---

## Quality Checks & Commands

Before submitting code, ensure all automated checks pass locally:

| Command | Description |
| :--- | :--- |
| `pnpm -r run build` | Builds all packages via `tsup` |
| `pnpm run typecheck` | Validates TypeScript types across all packages |
| `pnpm test` | Runs unit test suites with Vitest |
| `pnpm run lint` | Runs Biome linter and format validation |
| `pnpm run lint:fix` | Automatically fixes Biome lint and format issues |
| `pnpm run lint:pub` | Audits npm package declarations via `publint` |
| `pnpm run prepublish:check` | Runs the full verification pipeline (build, typecheck, tests) |

Git hooks powered by **Husky** and **lint-staged** automatically run Biome checks on staged files before each commit.

---

## Conventional Commits

We follow the [Conventional Commits specification](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>
```

Common types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation updates
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process, tooling, or dependency updates

*Example:*
```bash
git commit -m "feat(react): add custom shimmer angle support"
```

---

## Changesets Workflow (Versioning)

If your pull request introduces changes to published packages (`@fluid-loading/core` or `@fluid-loading/react`), you must include a **changeset**:

1. Run:
   ```bash
   pnpm changeset
   ```
2. Follow the prompts:
   - Select the affected packages.
   - Choose semver bump type (`patch`, `minor`, `major`).
   - Write a concise summary of the change.
3. Commit the generated `.changeset/*.md` file with your PR.

---

## Pull Request Guidelines

1. Create a dedicated branch from `main`:
   ```bash
   git checkout -b feat/my-improvement
   ```
2. Make your changes and add tests where applicable.
3. Run `pnpm run prepublish:check` to ensure all checks pass.
4. Push your branch and open a Pull Request against `main`.
5. Fill out the Pull Request template.
