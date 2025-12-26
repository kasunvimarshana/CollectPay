# Contributing to Paywise

First off, thank you for considering contributing to Paywise! It's people like you that make Paywise such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment of any kind
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could be considered inappropriate

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting a bug, include:**
- Clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, PHP version, Node version)
- Relevant logs or error messages

**Bug Report Template:**
```markdown
**Bug Description:**
A clear description of what the bug is.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What you expected to happen.

**Actual Behavior:**
What actually happened.

**Environment:**
- OS: [e.g., macOS 12.0]
- PHP: [e.g., 8.2]
- Node: [e.g., 18.0]
- Browser: [e.g., Chrome 120]

**Additional Context:**
Any other information about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When suggesting an enhancement, include:**
- Clear and descriptive title
- Detailed description of the proposed feature
- Explain why this enhancement would be useful
- Provide examples of how it would work
- Consider alternative solutions

**Enhancement Template:**
```markdown
**Feature Description:**
A clear description of the feature you'd like to see.

**Use Case:**
Explain why this would be useful.

**Proposed Solution:**
Describe how you think this should work.

**Alternatives Considered:**
Other approaches you've thought about.

**Additional Context:**
Screenshots, mockups, or examples.
```

### Pull Requests

We actively welcome your pull requests!

**Good first issues:**
- Look for issues labeled `good first issue`
- Documentation improvements
- Test coverage improvements
- Bug fixes
- Code refactoring

---

## Development Setup

### Prerequisites

- PHP 8.2+
- Composer 2.x
- Node.js 18+
- npm 9+
- MySQL 8.0+ or PostgreSQL 13+ (or SQLite for development)

### Setup Instructions

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Paywise.git
   cd Paywise
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/kasunvimarshana/Paywise.git
   ```

3. **Backend setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan serve
   ```

4. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Run tests**
   ```bash
   cd backend
   php artisan test
   ```

---

## Coding Standards

### PHP (Backend)

Follow **PSR-12** coding standards.

**Key points:**
- 4 spaces for indentation (no tabs)
- Opening braces on same line for classes/methods
- Use type hints and return types
- Document complex logic with comments
- Keep methods small and focused

**Example:**
```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        $suppliers = Supplier::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate(15);

        return response()->json($suppliers);
    }
}
```

**Code formatting:**
```bash
# Use Laravel Pint for formatting
./vendor/bin/pint
```

### JavaScript (Frontend)

Follow **Airbnb JavaScript Style Guide**.

**Key points:**
- 2 spaces for indentation
- Use arrow functions
- Use const/let (no var)
- Semicolons required
- Single quotes for strings

**Example:**
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getSuppliers } from '../api/client';

export default function SuppliersScreen({ navigation }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Component JSX */}
    </View>
  );
}
```

### Database

**Migrations:**
- Create descriptive migration names
- Include both up() and down() methods
- Add foreign key constraints
- Add indexes for frequently queried columns

**Example:**
```php
public function up(): void
{
    Schema::create('suppliers', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('code')->unique();
        $table->boolean('is_active')->default(true);
        $table->unsignedBigInteger('version')->default(1);
        $table->timestamps();
        $table->softDeletes();

        $table->index('code');
        $table->index('is_active');
    });
}
```

---

## Commit Messages

Follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Good commit messages
feat(api): add supplier search endpoint
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
test(supplier): add optimistic locking tests
refactor(collection): simplify rate application logic

# Bad commit messages
update stuff
fix bug
changes
wip
```

### Detailed Example

```
feat(payments): add reference number tracking

- Add reference_number field to payments table
- Update PaymentController to validate reference
- Add tests for reference number validation
- Update API documentation

Closes #123
```

---

## Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow coding standards
   - Add tests for new features
   - Update documentation

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   php artisan test

   # Code formatting
   ./vendor/bin/pint
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

---

## Testing Guidelines

### Writing Tests

**Every new feature should include tests:**

```php
// Feature test example
public function test_can_create_supplier()
{
    $admin = User::factory()->create(['role' => 'admin']);
    
    $response = $this->actingAs($admin)
        ->postJson('/api/suppliers', [
            'name' => 'Test Supplier',
            'code' => 'SUP001',
            'is_active' => true
        ]);
    
    $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Test Supplier');
    
    $this->assertDatabaseHas('suppliers', [
        'name' => 'Test Supplier',
        'code' => 'SUP001'
    ]);
}
```

### Test Coverage

- Aim for 80%+ coverage on new code
- Test happy paths and edge cases
- Test error conditions
- Test authorization checks

### Running Tests

```bash
# All tests
php artisan test

# Specific test file
php artisan test tests/Feature/SupplierApiTest.php

# With coverage
php artisan test --coverage

# Parallel execution
php artisan test --parallel
```

---

## Documentation

### Code Documentation

**PHP DocBlocks:**
```php
/**
 * Create a new supplier.
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\JsonResponse
 */
public function store(Request $request): JsonResponse
{
    // Method implementation
}
```

**JavaScript Comments:**
```javascript
/**
 * Fetch suppliers from the API
 * @returns {Promise<Array>} Array of supplier objects
 */
const fetchSuppliers = async () => {
  // Function implementation
};
```

### Documentation Files

When adding features, update:
- README.md (if it affects setup)
- API_DOCUMENTATION.md (for API changes)
- ARCHITECTURE.md (for architectural changes)
- Inline code comments (for complex logic)

---

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for each release
- Contributors section in README.md
- GitHub contributors page

Thank you for contributing to Paywise! 🎉

---

## Questions?

Feel free to:
- Open an issue for questions
- Contact the maintainers
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Last Updated:** December 25, 2025
