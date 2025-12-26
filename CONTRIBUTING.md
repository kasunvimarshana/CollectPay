# Contributing to PayCore

Thank you for your interest in contributing to PayCore! This document provides guidelines and best practices for contributing to this project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize code quality and maintainability
- Follow established patterns and conventions

## Getting Started

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL or PostgreSQL
- Git

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/kasunvimarshana/PayCore.git
   cd PayCore
   ```

2. **Backend Setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Write tests
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to remote**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

### Commit Message Format

Follow Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(collections): add multi-unit support for collections
fix(payments): correct balance calculation formula
docs(readme): update installation instructions
```

## Coding Standards

### PHP (Backend)

Follow **PSR-12** coding standards:

```php
<?php

namespace App\Http\Controllers\API;

use App\Models\Collection;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    /**
     * Display a listing of collections.
     */
    public function index(Request $request)
    {
        $collections = Collection::with(['supplier', 'product'])
            ->paginate(15);
            
        return response()->json($collections);
    }
}
```

**Key Points:**
- Use type declarations
- Add PHPDoc comments
- Follow PSR-12 formatting
- Use Eloquent ORM, not raw queries
- Validate all input
- Handle exceptions properly

### TypeScript (Frontend)

Follow **ESLint** configuration:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ApiService } from '../services/api';

interface Collection {
  id: number;
  supplier_name: string;
  product_name: string;
  quantity: number;
  total_amount: number;
}

const CollectionsScreen: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  
  useEffect(() => {
    fetchCollections();
  }, []);
  
  const fetchCollections = async () => {
    try {
      const response = await ApiService.getCollections();
      setCollections(response.data);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default CollectionsScreen;
```

**Key Points:**
- Use TypeScript for type safety
- Define interfaces for data structures
- Use functional components with hooks
- Handle errors appropriately
- Follow React Native best practices
- Use StyleSheet for styling

## Architecture Principles

### Clean Architecture
- **Separation of Concerns**: Keep layers independent
- **Dependency Rule**: Dependencies point inward
- **Testability**: Business logic should be testable

### SOLID Principles
- **Single Responsibility**: One class, one responsibility
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable
- **Interface Segregation**: Small, specific interfaces
- **Dependency Inversion**: Depend on abstractions

### DRY (Don't Repeat Yourself)
- Extract common logic into reusable functions
- Create shared components
- Avoid code duplication

### KISS (Keep It Simple, Stupid)
- Prefer simple solutions
- Avoid over-engineering
- Write clear, readable code

## Testing

### Backend Tests

```bash
cd backend
php artisan test
```

**Write tests for:**
- Model methods and relationships
- Controller endpoints
- Business logic
- Calculations and formulas

**Example:**
```php
public function test_collection_calculates_total_correctly()
{
    $collection = Collection::factory()->create([
        'quantity' => 10,
        'rate_applied' => 150,
    ]);
    
    $this->assertEquals(1500, $collection->total_amount);
}
```

### Frontend Tests

```bash
cd frontend
npm test
```

**Write tests for:**
- Component rendering
- User interactions
- API integration
- State management

## Documentation

### Code Comments
- Add PHPDoc comments to all public methods
- Document complex logic
- Explain "why" not "what"

### API Documentation
- Document all endpoints in `backend/API_DOCUMENTATION.md`
- Include request/response examples
- Document error codes

### User Documentation
- Update `USER_GUIDE.md` for user-facing changes
- Include screenshots for UI changes
- Provide examples

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or dd() statements
- [ ] Commits are clean and descriptive

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
- [ ] Tested locally
- [ ] Tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Tests pass
```

### Review Process
1. Submit PR with clear description
2. Wait for code review
3. Address feedback
4. Get approval from maintainer
5. PR will be merged

## Questions?

If you have questions or need help:
- Check existing documentation
- Review closed issues/PRs
- Contact the development team

---

Thank you for contributing to PayCore! Your efforts help make this project better for everyone.
