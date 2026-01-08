# UI Theme System Documentation

## Overview

The application uses a comprehensive, centralized theme system to ensure visual consistency across all screens and components. All design tokens (colors, spacing, typography, shadows, etc.) are defined in a single source of truth and consumed throughout the application.

## Theme Location

The main theme file is located at:
```
frontend/src/core/constants/theme.ts
```

## Theme Structure

### 1. Colors

The theme includes a comprehensive color palette with semantic mappings:

#### Base Colors
- **Primary**: `#007bff` - Brand color, used for primary actions and headers
- **Primary Dark**: `#0056b3` - Darker variant for hover states
- **Primary Light**: `#4da3ff` - Lighter variant for backgrounds

#### Status Colors
- **Success**: `#4CAF50` - Success states, positive actions
- **Warning**: `#FF9500` - Warnings, pending states
- **Error**: `#dc3545` - Errors, destructive actions
- **Info**: `#17a2b8` - Informational messages

#### Neutral Colors
Full gray scale from `gray50` to `gray900` for backgrounds, borders, and text

#### Semantic Colors
- **background**: Application background color
- **surface**: Card and surface backgrounds
- **border**: Border colors
- **text**: Various text colors (primary, secondary, tertiary, light, disabled)

#### Payment Type Colors
Semantic mappings for payment types:
- **paymentAdvance**: Orange (`#FF9800`)
- **paymentPartial**: Blue (`#2196F3`)
- **paymentFull**: Green (`#4CAF50`)
- **paymentAdjustment**: Purple (`#9C27B0`)

#### Report Colors
Specific colors for PDF generation and reports:
- **reportPrimary**: `#007bff`
- **reportSuccess**: `#28a745`
- **reportDanger**: `#dc3545`
- **reportSecondary**: `#666666`
- **reportBackground**: `#f8f9fa`
- **reportBorder**: `#dddddd`

### 2. Spacing

Consistent spacing scale used throughout the application:

```typescript
xs: 4px    // Extra small spacing
sm: 8px    // Small spacing
md: 12px   // Medium spacing
base: 16px // Base spacing (most common)
lg: 20px   // Large spacing
xl: 24px   // Extra large spacing
xxl: 32px  // 2X large spacing
xxxl: 40px // 3X large spacing
```

### 3. Typography

#### Font Sizes
```typescript
xs: 10px    // Extra small text
sm: 12px    // Small text (captions, helper text)
base: 14px  // Base text size
md: 16px    // Medium text (inputs, body)
lg: 18px    // Large text (subheadings)
xl: 20px    // Extra large (section titles)
xxl: 24px   // 2X large (page titles)
xxxl: 28px  // 3X large (hero text)
huge: 32px  // Huge text (special emphasis)
```

#### Font Weights
- **normal**: `400` - Body text
- **medium**: `500` - Emphasized text
- **semibold**: `600` - Subheadings
- **bold**: `700` - Headings

#### Line Heights
- **tight**: `1.2` - Compact layouts
- **normal**: `1.5` - Standard text
- **relaxed**: `1.75` - Comfortable reading

### 4. Border Radius

Consistent rounding values:
```typescript
sm: 4px     // Small elements
base: 8px   // Standard elements (buttons, cards)
md: 12px    // Medium elements
lg: 16px    // Large elements
full: 9999px // Fully rounded (pills, avatars)
```

### 5. Shadows

Four levels of elevation:
- **sm**: Subtle elevation (1dp)
- **base**: Standard elevation (2dp)
- **md**: Medium elevation (4dp)
- **lg**: High elevation (8dp)

Each shadow includes:
- Shadow color, offset, opacity, radius
- Android elevation value

## Helper Functions

### getPaymentTypeColor(type: string)

Returns the appropriate color for a payment type:

```typescript
import { getPaymentTypeColor } from '@/core/constants/theme';

const color = getPaymentTypeColor('advance'); // Returns '#FF9800'
```

Supported types:
- `advance` → Orange
- `partial` → Blue
- `full` → Green
- `adjustment` → Purple
- Default → Gray

## Reusable Components

### Button Component

Standardized button with multiple variants:

```typescript
import { Button } from '@/presentation/components';

<Button
  title="Submit"
  onPress={handleSubmit}
  variant="primary"     // 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size="medium"         // 'small' | 'medium' | 'large'
  disabled={false}
  loading={isLoading}
  fullWidth={true}
/>
```

#### Variants
- **primary**: Blue background, white text
- **secondary**: Gray background, white text
- **danger**: Red background, white text
- **success**: Green background, white text
- **outline**: Transparent with border

### Input Component

Standardized text input with label and error support:

```typescript
import { Input } from '@/presentation/components';

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  placeholder="Enter email"
  keyboardType="email-address"
/>
```

## Usage Guidelines

### Importing the Theme

```typescript
import THEME from '@/core/constants/theme';
// or import specific parts
import { SPACING, TYPOGRAPHY, getPaymentTypeColor } from '@/core/constants/theme';
```

### Using in StyleSheet

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.base,
  },
  title: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.md,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    ...THEME.shadows.base,
  },
});
```

### Calculating Line Heights

For proper line height calculation:

```typescript
lineHeight: THEME.typography.lineHeight.normal * THEME.typography.fontSize.base
// Results in: 1.5 * 14 = 21
```

## Best Practices

### DO ✅

- Always use theme constants instead of hardcoded values
- Use semantic color names (e.g., `textPrimary`, `success`) over specific colors
- Use spacing scale consistently (avoid arbitrary values like `15px`)
- Use helper functions for complex color logic
- Calculate line heights from theme values

### DON'T ❌

- Don't hardcode colors (e.g., `#007bff`, `rgb(0, 123, 255)`)
- Don't use arbitrary spacing values (e.g., `10`, `25`, `17`)
- Don't use arbitrary font sizes (e.g., `13`, `19`, `15`)
- Don't duplicate color definitions across files
- Don't create inline styles with hardcoded values

## Examples

### Bad ❌
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  text: {
    fontSize: 17,
    color: '#333',
    marginTop: 10,
  },
});
```

### Good ✅
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.base,
  },
  text: {
    fontSize: THEME.typography.fontSize.lg,
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.sm,
  },
});
```

## Accessibility Considerations

- Minimum touch target size: 44x44 (iOS guideline) enforced in Button component
- Color contrast ratios meet WCAG AA standards
- Text sizes are readable and scalable
- Spacing provides adequate visual separation

## PDF Generation

For consistent PDF styling, use the report-specific colors:

```typescript
const styles = `
  color: ${THEME.colors.reportPrimary};
  background-color: ${THEME.colors.reportBackground};
  border: 1px solid ${THEME.colors.reportBorder};
`;
```

This ensures consistency between on-screen and printed/exported content.

## Migration Guide

If you find hardcoded values in existing code:

1. Identify the type of value (color, spacing, typography)
2. Find the appropriate theme constant
3. Replace the hardcoded value with `THEME.property.value`
4. Test visually to ensure consistency

## Maintenance

When adding new theme values:

1. Add to the appropriate section in `theme.ts`
2. Follow the naming convention (descriptive, semantic names)
3. Update this documentation
4. Consider if a helper function would be useful
5. Communicate changes to the team

## Summary

By using this centralized theme system:
- ✅ Ensures visual consistency across the entire application
- ✅ Makes global style changes simple (change in one place)
- ✅ Improves maintainability and reduces technical debt
- ✅ Provides better developer experience with autocomplete
- ✅ Enables easier rebranding or white-labeling
- ✅ Ensures accessibility standards are met consistently
