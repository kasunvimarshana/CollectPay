# FieldSyncLedger - Contributing Guide

Thank you for your interest in contributing to FieldSyncLedger! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, versions, etc.)
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- Clear description of the feature
- Use case and benefits
- Potential implementation approach
- Any mockups or examples

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the code style** of the project
3. **Write tests** for new features
4. **Update documentation** as needed
5. **Ensure all tests pass**
6. **Create a pull request** with a clear description

## Development Setup

See [Developer Setup Guide](./docs/DEVELOPER_SETUP.md) for detailed instructions.

## Code Style

### Backend (PHP/Laravel)
- Follow PSR-12 coding standard
- Use type hints for function parameters and return types
- Add PHPDoc comments for public methods
- Keep methods focused and small

### Frontend (TypeScript/React Native)
- Follow TypeScript best practices
- Use functional components with hooks
- Add JSDoc comments for complex functions
- Follow ESLint rules

## Testing

- Write unit tests for business logic
- Write integration tests for API endpoints
- Test offline functionality thoroughly
- Ensure sync operations work correctly

## Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(sync): add conflict resolution UI
fix(api): handle network timeout errors
docs(readme): update installation instructions
```

## Code Review Process

1. All contributions require code review
2. At least one approval from maintainers
3. All CI checks must pass
4. No merge conflicts with main branch

## Architecture Guidelines

### Clean Architecture
- Keep domain logic independent of frameworks
- Use dependency injection
- Follow SOLID principles
- Maintain clear separation of concerns

### Naming Conventions
- Use descriptive names for variables and functions
- Follow language-specific naming conventions
- Be consistent across the codebase

## Questions?

If you have questions:
- Check existing documentation
- Look at existing issues
- Create a new issue for discussion
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

Thank you for contributing to FieldSyncLedger!
