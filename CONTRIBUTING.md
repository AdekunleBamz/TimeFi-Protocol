# Contributing to TimeFi Protocol

Thank you for your interest in contributing to TimeFi Protocol! All contributions, large or small, are welcome.

## Development Setup

### Prerequisites

- Node.js 18+
- npm 8+ (included with Node.js 18)
- Clarinet CLI installed
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/AdekunleBamz/TimeFi-Protocol.git
   cd TimeFi-Protocol
   ```

3. Install dependencies:
   ```bash
   npm ci
   ```

4. Install frontend dependencies:
   ```bash
   npm --prefix frontend ci
   ```

### Sub-project Development

The project consists of multiple components. Please refer to their respective READMEs for specific development instructions:

- **Frontend**: [frontend/README.md](frontend/README.md)
- **SDK**: [sdk/README.md](sdk/README.md)
- **Contracts**: [contracts/README.md](contracts/README.md)

## Making Changes

### Branch Naming

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Test additions
- `chore/` - Maintenance

### Commit Messages

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run frontend lint and tests locally (`npm run frontend:test && npm run test`)
4. Run `npm run verify:local` from repository root
5. Push and create a PR
6. Wait for review

## Contract Development

### Running Clarinet

```bash
# Check contract syntax
npm run contracts:check

# Run protocol tests
npm run test

# Start devnet
clarinet devnet start
```

### Testing Guidelines

- Write tests for all new functions.
- Cover both success and error paths.
- Test boundary conditions.

## Code Style

- Use clear, descriptive variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Prefer explicit over implicit

## Questions?

Open an issue (or discussion thread) for questions and design feedback.

## Contact

For direct questions, reach out to **adekunlebamz** on GitHub.
