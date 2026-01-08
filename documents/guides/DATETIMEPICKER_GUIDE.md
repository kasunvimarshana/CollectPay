# DateTimePicker Component Guide

## Overview

The `DateTimePicker` component is a reusable, cross-platform date and time picker for React Native (Expo) applications. It provides a consistent user experience across iOS and Android platforms with native picker support.

## Features

- ✅ **Native Date Picker**: Uses platform-specific native date pickers
- ✅ **Cross-Platform**: Works seamlessly on iOS and Android
- ✅ **Multiple Modes**: Supports `date`, `time`, and `datetime` modes
- ✅ **Validation**: Built-in error handling and validation display
- ✅ **Accessibility**: Includes accessibility labels for screen readers
- ✅ **Customizable**: Supports custom styling and constraints
- ✅ **Consistent Format**: Uses YYYY-MM-DD format for date values
- ✅ **TypeScript**: Full TypeScript support with proper types

## Installation

The component uses `@react-native-community/datetimepicker`:

```bash
npx expo install @react-native-community/datetimepicker
```

## Usage

### Basic Date Picker

```tsx
import { DateTimePicker } from '../components';

function MyForm() {
  const [date, setDate] = useState('2025-01-06');

  return (
    <DateTimePicker
      label="Select Date"
      value={date}
      onChange={setDate}
      mode="date"
    />
  );
}
```

### With Validation Error

```tsx
<DateTimePicker
  label="Collection Date *"
  value={formData.collection_date}
  onChange={(value) => updateField('collection_date', value)}
  mode="date"
  placeholder="Select collection date"
  error={errors.collection_date}
/>
```

### With Date Constraints

```tsx
const today = new Date();
const minDate = new Date(today.getFullYear(), 0, 1); // Jan 1 this year
const maxDate = today; // Today

<DateTimePicker
  label="Date"
  value={date}
  onChange={setDate}
  mode="date"
  minimumDate={minDate}
  maximumDate={maxDate}
/>
```

### Disabled State

```tsx
<DateTimePicker
  label="Date"
  value={date}
  onChange={setDate}
  mode="date"
  disabled={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed above the picker |
| `value` | `string` | - | Current date value (YYYY-MM-DD format) |
| `onChange` | `(date: string) => void` | - | Callback when date changes |
| `mode` | `'date' \| 'time' \| 'datetime'` | `'date'` | Picker mode |
| `placeholder` | `string` | `'Select date'` | Placeholder text when no date selected |
| `error` | `string` | - | Error message to display |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `containerStyle` | `ViewStyle` | - | Custom styles for container |
| `inputStyle` | `ViewStyle` | - | Custom styles for input field |
| `labelStyle` | `TextStyle` | - | Custom styles for label |
| `minimumDate` | `Date` | - | Minimum selectable date |
| `maximumDate` | `Date` | - | Maximum selectable date |

## Date Format

The component uses **YYYY-MM-DD** format for date values to ensure:
- Consistency with backend APIs
- ISO 8601 standard compliance
- Easy parsing and validation
- Database compatibility

### Format Examples

```tsx
// Date mode
value: "2025-01-06"  // YYYY-MM-DD

// Time mode
value: "14:30"       // HH:MM (24-hour format)

// DateTime mode
value: "2025-01-06 14:30"  // YYYY-MM-DD HH:MM
```

## Platform Differences

### iOS
- Uses native spinner-style picker
- Displays inline below the input field
- Has a "Done" button to close the picker
- Auto-closes after selection for date/time modes
- Stays open for datetime mode to allow both selections

### Android
- Uses native dialog-style picker
- Opens as a modal dialog
- Auto-closes after date/time selection
- Native "OK" and "Cancel" buttons

## Styling

The component matches the existing application theme with:
- White background
- Border radius of 8px
- Grey borders (#ddd)
- Error state with red border (#f44336)
- Calendar emoji icon (📅)

### Custom Styling Example

```tsx
<DateTimePicker
  label="Date"
  value={date}
  onChange={setDate}
  mode="date"
  containerStyle={{ marginBottom: 20 }}
  inputStyle={{ backgroundColor: '#f0f0f0' }}
  labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
/>
```

## Accessibility

The component includes accessibility features:
- Proper accessibility labels
- Screen reader support
- Keyboard navigation support (where applicable)
- High contrast error states

```tsx
// Calendar icon has accessibility props
<Text 
  style={styles.icon} 
  accessibilityLabel="Calendar icon" 
  accessibilityRole="image"
>
  📅
</Text>
```

## Integration Examples

### In Form Screens

The DateTimePicker is used in these screens:

1. **CollectionFormScreen** (line 326-333)
```tsx
<DateTimePicker
  label="Collection Date *"
  value={formData.collection_date}
  onChange={(value) => updateField('collection_date', value)}
  mode="date"
  placeholder="Select collection date"
  error={errors.collection_date}
/>
```

2. **PaymentFormScreen** (line 256-263)
```tsx
<DateTimePicker
  label="Payment Date *"
  value={formData.payment_date}
  onChange={(value) => updateField('payment_date', value)}
  mode="date"
  placeholder="Select payment date"
  error={errors.payment_date}
/>
```

3. **ReportsScreen** (lines 683-697)
```tsx
<DateTimePicker
  label="Start Date"
  value={dateFilter.startDate}
  onChange={(date) => setDateFilter({...dateFilter, startDate: date})}
  mode="date"
  placeholder="Select start date"
  containerStyle={styles.datePickerContainer}
/>
```

## Troubleshooting

### Date Not Displaying

**Problem**: Date value is not showing in the picker.

**Solution**: Ensure the date is in YYYY-MM-DD format:
```tsx
// ❌ Wrong
value: "01/06/2025"

// ✅ Correct
value: "2025-01-06"
```

### Picker Not Opening on iOS

**Problem**: Tapping the input doesn't open the picker on iOS.

**Solution**: Ensure you're not setting `disabled={true}` and that the component is properly mounted.

### Styling Issues

**Problem**: Custom styles not applying.

**Solution**: Use the correct style props:
```tsx
// For container (outer wrapper)
containerStyle={{ marginBottom: 20 }}

// For input field
inputStyle={{ backgroundColor: '#f0f0f0' }}

// For label
labelStyle={{ fontSize: 18 }}
```

## Best Practices

1. **Always provide a label** for better UX
2. **Use validation** with error prop to show validation messages
3. **Set constraints** with minimumDate/maximumDate when applicable
4. **Handle empty values** gracefully in your form logic
5. **Keep date format consistent** (YYYY-MM-DD) throughout your app
6. **Test on both platforms** to ensure consistent behavior

## Migration from TextInput

If you're replacing a TextInput with DateTimePicker:

**Before:**
```tsx
<View style={styles.formGroup}>
  <Text style={styles.label}>Date *</Text>
  <TextInput
    style={[styles.input, errors.date && styles.inputError]}
    placeholder="YYYY-MM-DD"
    value={formData.date}
    onChangeText={(value) => updateField('date', value)}
  />
  {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
</View>
```

**After:**
```tsx
<DateTimePicker
  label="Date *"
  value={formData.date}
  onChange={(value) => updateField('date', value)}
  mode="date"
  placeholder="Select date"
  error={errors.date}
/>
```

Benefits:
- Native date picker (better UX)
- No manual date format validation needed
- Consistent behavior across platforms
- Built-in error handling

## Performance

The component is optimized for performance:
- Uses `useState` for local picker state
- Minimal re-renders
- Efficient date parsing and formatting
- No unnecessary prop passing

## Future Enhancements

Potential improvements for future versions:
- Custom date format display (while keeping YYYY-MM-DD for value)
- Range picker support (select start and end dates)
- Quick date selection buttons (Today, Yesterday, etc.)
- Custom icon support (replace emoji with SVG/Icon library)
- Inline picker mode for iOS (always visible)

## License

This component is part of the Data Collection and Payment Management System frontend application.

## Support

For issues or questions, please refer to:
- [Frontend README](./README.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
