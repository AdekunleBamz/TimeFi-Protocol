# Contributing to TimeFi Protocol

Thank you for your interest in contributing to TimeFi Protocol!

## Development Setup

### Prerequisites
- Node.js 18+
- Clarinet CLI installed
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/TimeFi-Protocol.git
   cd TimeFi-Protocol
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run tests:
   ```bash
   npm test
   ```

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
3. Run tests locally
4. Push and create a PR
5. Wait for review

## Contract Development

### Running Clarinet
```bash
# Check contract syntax
clarinet check

# Run tests
clarinet test

# Start devnet
clarinet devnet start
```

### Testing Guidelines
- Write tests for all new functions
- Test both success and error cases
- Test boundary conditions

## Code Style
- Use clear, descriptive names
- Add comments for complex logic
- Keep functions focused and small

## Questions?
Open an issue for questions or discussion.
