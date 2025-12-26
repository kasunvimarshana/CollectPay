# Contributing to FieldLedger

Thank you for considering contributing to FieldLedger! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, device, versions)

### Suggesting Enhancements

Enhancement suggestions are welcome. Please include:

- Clear and descriptive title
- Detailed description of the enhancement
- Use cases and benefits
- Any implementation ideas

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development Setup

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Coding Standards

### Backend (PHP/Laravel)
- Follow PSR-12 coding standards
- Use Laravel Pint for code formatting
- Write meaningful variable and function names
- Add PHPDoc comments for public methods
- Follow SOLID principles

### Frontend (TypeScript/React Native)
- Follow TypeScript best practices
- Use ESLint configuration
- Use functional components with hooks
- Write meaningful component and variable names
- Add JSDoc comments for complex functions

## Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

Examples:
```
Add supplier balance calculation
Fix offline sync conflict resolution
Update README with deployment instructions
```

## Testing

### Backend
```bash
cd backend
php artisan test
```

### Frontend
```bash
cd frontend
npm test
```

## Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add inline comments for complex logic
- Update ARCHITECTURE.md for architectural changes

## Project Structure

### Backend
- `app/Models`: Eloquent models
- `app/Http/Controllers`: API controllers
- `app/Services`: Business logic
- `database/migrations`: Database schema
- `routes/api.php`: API routes

### Frontend
- `app`: Expo Router screens
- `src/api`: API client
- `src/database`: Local database
- `src/services`: Business logic
- `src/store`: State management
- `src/types`: TypeScript types

## Code Review Process

1. All submissions require review
2. Reviewers check for:
   - Code quality
   - Test coverage
   - Documentation
   - Security implications
   - Performance impact
3. Address review comments
4. Maintainer approval required for merge

## Security

- Do not commit secrets or credentials
- Report security vulnerabilities privately
- Follow security best practices
- Keep dependencies updated

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue with the "question" label or contact the maintainers.

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to FieldLedger!
