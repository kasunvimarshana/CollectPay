# Contributing to TrackVault

Thank you for your interest in contributing to TrackVault! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Architecture](#architecture)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Backend**: PHP 8.2+, Composer, MySQL/PostgreSQL
- **Frontend**: Node.js 18+, npm/yarn, Expo CLI
- **Git**: Version control
- **Code Editor**: VS Code, PHPStorm, or similar

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/TrackVault.git
   cd TrackVault
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/kasunvimarshana/TrackVault.git
   ```

## Development Setup

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
# Configure .env with your settings
# Create database and run migrations
php -S localhost:8000 -t public
```

### Frontend Setup

```bash
cd frontend
npm install
echo "API_BASE_URL=http://localhost:8000/api" > .env
npm start
```

## Architecture

TrackVault follows **Clean Architecture** principles:

### Backend Layers

1. **Domain Layer**: Pure business logic
   - Entities
   - Value Objects
   - Repository Interfaces
   - Domain Services

2. **Application Layer**: Use cases
   - Use Cases
   - DTOs
   - Application Services

3. **Infrastructure Layer**: External concerns
   - Database implementations
   - Security (JWT, encryption)
   - Logging
   - External APIs

4. **Presentation Layer**: API interface
   - Controllers
   - Routes
   - Middleware

### Frontend Layers

1. **Domain Layer**: Business entities
2. **Application Layer**: Use cases and state
3. **Infrastructure Layer**: API client, storage
4. **Presentation Layer**: UI components

## Coding Standards

### PHP (Backend)

**Follow PSR-12 Coding Standard**:

```php
<?php

declare(strict_types=1);

namespace TrackVault\Domain\Entities;

/**
 * Entity description
 */
final class MyEntity
{
    private string $property;

    public function __construct(string $property)
    {
        $this->property = $property;
    }

    public function getProperty(): string
    {
        return $this->property;
    }
}
```

**Best Practices**:
- Use type hints for all parameters and return types
- Use final classes when inheritance is not needed
- Use strict types: `declare(strict_types=1);`
- Write docblocks for classes and public methods
- Follow SOLID principles
- Keep methods small and focused

### TypeScript (Frontend)

**Follow TypeScript Best Practices**:

```typescript
// Use interfaces for type definitions
interface User {
  id: string;
  name: string;
  email: string;
}

// Use const for immutable values
const API_BASE_URL = process.env.API_BASE_URL;

// Use arrow functions
const getUserName = (user: User): string => user.name;

// Use async/await instead of promises
const fetchUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};
```

**Best Practices**:
- Use TypeScript strict mode
- Define types for all function parameters
- Use interfaces for object shapes
- Avoid `any` type
- Use meaningful variable names
- Keep components small and focused

### General Guidelines

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **Single Responsibility**: One class/function, one responsibility
- **Meaningful Names**: Use descriptive names for variables, functions, and classes

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-supplier-search` - New feature
- `fix/payment-calculation-bug` - Bug fix
- `refactor/repository-pattern` - Code refactoring
- `docs/api-documentation` - Documentation
- `test/collection-service` - Tests

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(suppliers): add search functionality

Implement search by name, email, and phone for suppliers.
Includes pagination and sorting.

Closes #123
```

```
fix(payment): correct calculation for partial payments

Fixed issue where partial payments were not deducted correctly
from the total balance.

Fixes #456
```

### Code Quality Checks

Before committing:

1. **Format Code**:
   ```bash
   # PHP
   composer format
   
   # TypeScript
   npm run lint
   ```

2. **Run Tests**:
   ```bash
   # Backend
   composer test
   
   # Frontend
   npm test
   ```

3. **Check Type Safety**:
   ```bash
   # TypeScript
   npm run type-check
   ```

## Testing

### Required Tests

All contributions must include tests:

1. **Unit Tests**: For business logic
2. **Integration Tests**: For database operations
3. **API Tests**: For endpoints

### Writing Tests

**Backend Example**:
```php
<?php

namespace Tests\Unit\Domain\Entities;

use PHPUnit\Framework\TestCase;
use TrackVault\Domain\Entities\Supplier;

class SupplierTest extends TestCase
{
    public function testSupplierCreation(): void
    {
        $supplier = new Supplier(
            SupplierId::generate(),
            'ABC Suppliers',
            'John Doe',
            '+1234567890',
            'john@abc.com',
            '123 Main St'
        );

        $this->assertEquals('ABC Suppliers', $supplier->getName());
    }
}
```

**Frontend Example**:
```typescript
describe('UserService', () => {
  it('should fetch user by id', async () => {
    const user = await userService.findById('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });
});
```

### Test Coverage

Maintain minimum 80% code coverage:

```bash
# Backend
composer test:coverage

# Frontend
npm test -- --coverage
```

## Documentation

### Code Documentation

**PHP Docblocks**:
```php
/**
 * Calculate total payment owed to a supplier
 *
 * @param Collection[] $collections Array of collection entities
 * @return Money Total amount owed
 * @throws \InvalidArgumentException If collections array is invalid
 */
public function calculateTotalOwed(array $collections): Money
{
    // Implementation
}
```

**TypeScript JSDoc**:
```typescript
/**
 * Fetch user by ID from the API
 * @param id - User ID
 * @returns Promise resolving to User object
 * @throws {ApiError} If user not found or API error
 */
async function fetchUser(id: string): Promise<User> {
  // Implementation
}
```

### Updating Documentation

When making changes, update relevant documentation:

- `README.md`: For major features
- `API.md`: For API changes
- `IMPLEMENTATION.md`: For architectural changes
- `DEPLOYMENT.md`: For deployment changes
- Inline comments: For complex logic

## Submitting Changes

### Pull Request Process

1. **Update Your Branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature
   ```

3. **Create Pull Request**:
   - Go to GitHub and create a PR
   - Fill in the PR template
   - Link related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings generated
```

## Review Process

### What Reviewers Look For

1. **Code Quality**:
   - Follows coding standards
   - Well-structured and readable
   - Properly documented

2. **Functionality**:
   - Solves the stated problem
   - No regressions
   - Edge cases handled

3. **Tests**:
   - Adequate test coverage
   - Tests are meaningful
   - Tests pass

4. **Security**:
   - No security vulnerabilities
   - Input validation
   - Proper authentication/authorization

5. **Performance**:
   - No performance regressions
   - Efficient algorithms
   - Proper database queries

### Addressing Feedback

- Be receptive to feedback
- Discuss disagreements respectfully
- Make requested changes promptly
- Re-request review after changes

## Issue Reporting

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details

### Feature Requests

Include:
- Problem description
- Proposed solution
- Alternatives considered
- Additional context

## Questions?

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Email**: Contact maintainers

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md`
- Release notes
- Documentation

Thank you for contributing to TrackVault! 🎉
