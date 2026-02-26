# Contributing to vue-superselect

Thanks for your interest in contributing! This guide covers how to set up the project, report issues, and submit pull requests.

## Development Setup

```bash
# Clone and install
git clone https://github.com/nemanjamalesija/vue-superselect.git
cd vue-superselect
npm install

# Run tests
npm test

# Build the library
npm run build

# Start the playground
npm run playground

# Run the full validation suite
npm run release:check
```

## Reporting Issues

Open a [GitHub issue](https://github.com/nemanjamalesija/vue-superselect/issues) with:

- **Bug reports**: steps to reproduce, expected vs actual behavior, browser/Vue version
- **Feature requests**: describe the use case and proposed API

## Submitting Pull Requests

1. Fork the repository and create a feature branch from `main`
2. Make your changes and add tests for new behavior
3. Run `npm run release:check` to verify everything passes (lint, types, tests, build, validation)
4. Open a pull request against `main` with a clear description of the change

## Code Style

The project uses ESLint and Prettier for code formatting. Run `npm run lint` and `npm run format` before committing. TypeScript strict mode is enforced -- avoid `any` types.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
