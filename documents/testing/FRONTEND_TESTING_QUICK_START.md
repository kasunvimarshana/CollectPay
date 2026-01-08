# Frontend Testing - Quick Start Guide

## Running Automated Tests

### Prerequisites
```bash
cd frontend
npm install  # Installs dependencies including Jest and testing libraries
```

### Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (for continuous integration)
npm run test:ci
```

### Viewing Coverage Reports
After running `npm run test:coverage`, open:
```
frontend/coverage/lcov-report/index.html
```

---

## What's Been Tested

### ✅ Core Services (39 tests)
- **AuthService** - Authentication, login, logout, token management
- **ConflictResolutionService** - Version conflicts, data validation, retry logic

### ✅ UI Components (41 tests)
- **Pagination** - Page navigation, button states, item ranges
- **SortButton** - Sort direction, indicators, accessibility
- **Loading** - Loading states, messages
- **ErrorMessage** - Error display, retry functionality
- **EmptyState** - Empty state display, custom icons

### ✅ State Management (4 tests)
- **AuthContext** - Authentication state, user management

---

## Test Structure

Tests are organized by module:
```
src/
├── application/services/__tests__/     # Service layer tests
├── presentation/components/__tests__/  # Component tests
└── presentation/contexts/__tests__/    # Context/state tests
```

---

## Writing New Tests

### Component Test Template
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should handle button press', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<MyComponent onPress={mockOnPress} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

### Service Test Template
```typescript
import MyService from '../MyService';

jest.mock('../../infrastructure/api/apiClient');

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockData,
    });

    const result = await MyService.getData();
    expect(result).toEqual(mockData);
  });
});
```

---

## Debugging Tests

### Running a Single Test File
```bash
npm test -- AuthService.test.ts
```

### Running Tests Matching a Pattern
```bash
npm test -- --testNamePattern="should login"
```

### Viewing Detailed Output
```bash
npm test -- --verbose
```

---

## CI/CD Integration

Tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    cd frontend
    npm ci
    npm run test:ci
```

---

## Known Limitations

1. **E2E Tests** - End-to-end tests not yet implemented (requires Detox/Maestro)
2. **Integration Tests** - Screen flow integration tests are planned
3. **Coverage Goal** - Currently covering core services and components, expanding to 80%+

---

## Next Steps

1. Add tests for remaining components (SearchableSelector, DateTimePicker, etc.)
2. Test custom hooks (useSupplier, useProduct, etc.)
3. Add integration tests for screen workflows
4. Set up E2E testing framework

---

## Getting Help

- **Test fails?** Check mock setup in `jest.setup.js`
- **Coverage issues?** Check `jest.config.js` for exclusions
- **Need examples?** Look at existing tests in `__tests__` directories

For detailed documentation, see:
- `TESTING_IMPLEMENTATION.md` - Complete testing report
- `TESTING.md` - Manual testing guide
