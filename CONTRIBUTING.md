# Contributing to TransacTrack

Thank you for your interest in contributing to TransacTrack! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Maintain professionalism

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### Suggesting Features

1. Check if feature has been requested
2. Use the feature request template
3. Explain the use case
4. Describe the proposed solution

### Code Contributions

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the coding standards
   - Write tests
   - Update documentation
   - Keep commits focused and clear

4. **Test your changes**
   ```bash
   # Backend
   cd backend
   php artisan test
   
   # Frontend
   cd mobile
   npm test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   
   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Test additions/changes
   - `chore:` Build process or auxiliary changes

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Submit a pull request**
   - Provide clear description
   - Link related issues
   - Request review

## Coding Standards

### PHP (Backend)

- Follow PSR-12 coding standard
- Use type hints
- Write PHPDoc comments
- Keep methods focused and small

Example:
```php
/**
 * Calculate total amount for collection
 *
 * @param float $quantity
 * @param float $rate
 * @return float
 */
public function calculateTotal(float $quantity, float $rate): float
{
    return round($quantity * $rate, 2);
}
```

### TypeScript (Frontend)

- Use TypeScript strict mode
- Define types for all props
- Use functional components
- Keep components focused

Example:
```typescript
interface SupplierCardProps {
  supplier: Supplier;
  onPress: (id: number) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ 
  supplier, 
  onPress 
}) => {
  // Component logic
};
```

## Testing Guidelines

### Backend Tests

```php
public function test_user_can_create_collection(): void
{
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create();
    $product = Product::factory()->create();
    
    $response = $this->actingAs($user)->postJson('/api/collections', [
        'supplier_id' => $supplier->id,
        'product_id' => $product->id,
        'quantity' => 100,
        'unit' => 'kg',
    ]);
    
    $response->assertStatus(201);
}
```

### Frontend Tests

```typescript
describe('SupplierCard', () => {
  it('renders supplier name', () => {
    const supplier = mockSupplier();
    const { getByText } = render(
      <SupplierCard supplier={supplier} onPress={jest.fn()} />
    );
    expect(getByText(supplier.name)).toBeTruthy();
  });
});
```

## Documentation

- Update README for major changes
- Add JSDoc/PHPDoc comments
- Update API documentation
- Include examples

## Pull Request Process

1. **PR Title**: Clear and descriptive
2. **Description**: What and why
3. **Testing**: How tested
4. **Screenshots**: For UI changes
5. **Breaking Changes**: Clearly marked

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Tests pass
- [ ] No new warnings
- [ ] Compatible with existing features

## Review Process

1. **Automated Checks**: Must pass
2. **Code Review**: At least one approval
3. **Testing**: Manual testing if needed
4. **Merge**: Squash and merge

## Getting Help

- GitHub Discussions
- Issue comments
- Email: dev@transactrack.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be acknowledged in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to TransacTrack!
