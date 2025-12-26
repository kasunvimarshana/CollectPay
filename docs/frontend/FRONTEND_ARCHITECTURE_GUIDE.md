# TrackVault Frontend Architecture Guide

**Version:** 1.0.0  
**Date:** 2025-12-26  
**Status:** Production Ready

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Application Flow](#application-flow)
3. [Component Hierarchy](#component-hierarchy)
4. [Data Flow](#data-flow)
5. [File Structure](#file-structure)
6. [Design Patterns](#design-patterns)
7. [Code Examples](#code-examples)

---

## Architecture Overview

TrackVault frontend follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   Screens (LoginScreen, HomeScreen, SuppliersScreen, etc) │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   Components (Button, Input, Picker, FormModal, etc)      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   Contexts (AuthContext for global state)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   Navigation (AppNavigator, MainTabs)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                          Data Layer                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   API Services (auth, supplier, product, collection, etc) │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   API Client (axios with interceptors)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   Utilities (formatters, constants, validators)           │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   Secure Storage (Expo SecureStore)                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Application Flow

### 1. App Initialization

```
App.tsx
  ↓
AuthProvider (wraps entire app)
  ↓
AppNavigator (checks authentication)
  ↓
  ├─ If NOT authenticated → LoginScreen
  └─ If authenticated → MainTabs
                          ↓
                          ├─ Home Tab
                          ├─ Suppliers Tab
                          ├─ Products Tab
                          ├─ Collections Tab
                          └─ Payments Tab
```

### 2. Authentication Flow

```
User opens app
  ↓
AuthContext.checkAuth() runs
  ↓
  ├─ Token found in SecureStore?
  │    ↓ YES
  │    Call authService.getMe()
  │    ↓
  │    Set user state
  │    ↓
  │    Navigate to MainTabs
  │
  └─ NO
       ↓
       Show LoginScreen
       ↓
       User enters credentials
       ↓
       authService.login()
       ↓
       Save token to SecureStore
       ↓
       Set user state
       ↓
       Navigate to MainTabs
```

### 3. CRUD Operation Flow (Example: Create Supplier)

```
User clicks FAB on SuppliersScreen
  ↓
Open FormModal
  ↓
User fills form (name, code, phone, email, address)
  ↓
User clicks Submit
  ↓
validateForm() - client-side validation
  ↓
  ├─ Validation fails → Show errors
  └─ Validation passes
       ↓
       setIsSubmitting(true)
       ↓
       supplierService.create(formData)
       ↓
       API Client adds auth token (interceptor)
       ↓
       POST /api/suppliers
       ↓
       ├─ Success
       │   ↓
       │   Show success alert
       │   ↓
       │   Close modal
       │   ↓
       │   Refresh supplier list
       │
       └─ Error
           ↓
           Show error alert
           ↓
           Keep modal open
       ↓
       setIsSubmitting(false)
```

---

## Component Hierarchy

### Screen Component Structure

All main screens follow this pattern:

```
Screen Component
├─ State Management
│  ├─ Entity list state (e.g., suppliers)
│  ├─ Loading state (isLoading, isRefreshing)
│  ├─ Modal state (modalVisible)
│  ├─ Form state (formData)
│  ├─ Error state (errors)
│  └─ Editing state (editingEntity)
│
├─ Effects
│  └─ useEffect → loadEntities()
│
├─ Handler Functions
│  ├─ loadEntities()
│  ├─ handleRefresh()
│  ├─ openCreateModal()
│  ├─ openEditModal()
│  ├─ handleSubmit()
│  ├─ handleDelete()
│  ├─ validateForm()
│  └─ resetForm()
│
└─ Render
   ├─ Loading State → ActivityIndicator
   ├─ FlatList (entity cards)
   │  ├─ Pull-to-refresh
   │  ├─ renderItem → Card with Edit/Delete
   │  └─ ListEmptyComponent
   ├─ FloatingActionButton
   └─ FormModal
      ├─ Input components
      ├─ Picker components
      └─ Submit/Cancel buttons
```

### Component Tree Example

```
App
└─ AuthProvider
   └─ AppNavigator
      └─ NavigationContainer
         └─ Stack.Navigator
            ├─ LoginScreen (if not authenticated)
            └─ MainTabs (if authenticated)
               └─ Tab.Navigator
                  ├─ HomeScreen
                  ├─ SuppliersScreen
                  │  ├─ FlatList
                  │  │  └─ Supplier Cards
                  │  │     ├─ TouchableOpacity (Edit)
                  │  │     └─ Button (Delete)
                  │  ├─ FloatingActionButton
                  │  └─ FormModal
                  │     ├─ Input (Name)
                  │     ├─ Input (Code)
                  │     ├─ Input (Phone)
                  │     ├─ Input (Email)
                  │     ├─ Input (Address)
                  │     └─ Buttons (Submit/Cancel)
                  ├─ ProductsScreen
                  ├─ CollectionsScreen
                  └─ PaymentsScreen
```

---

## Data Flow

### 1. API Request Flow with Interceptors

```
Screen calls API service
  ↓
API service calls apiClient (axios)
  ↓
Request Interceptor
  ├─ Get token from SecureStore
  ├─ Add Authorization header
  └─ Return modified config
  ↓
HTTP Request to Backend
  ↓
Backend Response
  ↓
Response Interceptor
  ├─ Success → Return response
  └─ Error (401) → Clear token, logout
  ↓
Return to API service
  ↓
Return to Screen
```

### 2. State Management Flow

```
┌─────────────────────────────────────────────┐
│         Global State (Context)              │
│  ┌───────────────────────────────────────┐  │
│  │  AuthContext                          │  │
│  │  - user                               │  │
│  │  - isLoading                          │  │
│  │  - isAuthenticated                    │  │
│  │  - login()                            │  │
│  │  - logout()                           │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
              ↕ (useAuth hook)
┌─────────────────────────────────────────────┐
│        Screen State (useState)              │
│  ┌───────────────────────────────────────┐  │
│  │  - Entity list (suppliers, products)  │  │
│  │  - Loading states                     │  │
│  │  - Form data                          │  │
│  │  - Validation errors                  │  │
│  │  - Modal visibility                   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
              ↕ (props)
┌─────────────────────────────────────────────┐
│       Component State (useState)            │
│  ┌───────────────────────────────────────┐  │
│  │  - Input values                       │  │
│  │  - Focus states                       │  │
│  │  - Internal UI states                 │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## File Structure

```
frontend/
│
├── App.tsx                    # Root component
├── index.ts                   # Entry point
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
│
└── src/
    │
    ├── api/                   # API Integration Layer
    │   ├── client.ts          # Axios instance with interceptors
    │   ├── auth.ts            # Auth service (login, register, logout)
    │   ├── supplier.ts        # Supplier CRUD service
    │   ├── product.ts         # Product & Rate CRUD service
    │   ├── collection.ts      # Collection CRUD service
    │   └── payment.ts         # Payment CRUD service
    │
    ├── components/            # Reusable UI Components
    │   ├── Button.tsx         # Button with variants
    │   ├── Input.tsx          # Text input with validation
    │   ├── Picker.tsx         # Dropdown selector
    │   ├── DatePicker.tsx     # Date input
    │   ├── FormModal.tsx      # Modal for forms
    │   ├── FloatingActionButton.tsx  # FAB for create actions
    │   └── index.ts           # Component exports
    │
    ├── contexts/              # Global State Management
    │   └── AuthContext.tsx    # Authentication context
    │
    ├── navigation/            # Navigation Configuration
    │   └── AppNavigator.tsx   # Root navigator
    │
    ├── screens/               # Screen Components
    │   ├── LoginScreen.tsx         # Authentication screen
    │   ├── HomeScreen.tsx          # Dashboard/home
    │   ├── SuppliersScreen.tsx     # Supplier management
    │   ├── ProductsScreen.tsx      # Product management
    │   ├── CollectionsScreen.tsx   # Collection management
    │   └── PaymentsScreen.tsx      # Payment management
    │
    └── utils/                 # Utility Functions
        ├── constants.ts       # App constants
        └── formatters.ts      # Date/amount formatters
```

---

## Design Patterns

### 1. Service Pattern (API Layer)

Each entity has a dedicated service with standard CRUD operations:

```typescript
export const supplierService = {
  async getAll(params?) { ... },
  async getById(id) { ... },
  async create(data) { ... },
  async update(id, data) { ... },
  async delete(id) { ... },
};
```

**Benefits:**
- Centralized API logic
- Easy to test
- Consistent interface
- Type-safe operations

### 2. Context Pattern (Global State)

AuthContext provides authentication state and methods:

```typescript
<AuthProvider>
  <App />
</AuthProvider>

// In any component:
const { user, isAuthenticated, login, logout } = useAuth();
```

**Benefits:**
- Global state without prop drilling
- Centralized auth logic
- Type-safe context
- Easy to extend

### 3. Compound Component Pattern (Reusable UI)

Components are designed to work together:

```typescript
<FormModal visible={modalVisible} onClose={handleClose} title="Add Supplier">
  <Input label="Name" value={name} onChangeText={setName} error={errors.name} required />
  <Input label="Email" value={email} onChangeText={setEmail} error={errors.email} />
  <Button title="Submit" onPress={handleSubmit} loading={isSubmitting} />
</FormModal>
```

**Benefits:**
- Flexible composition
- Reusable components
- Consistent UI
- Type-safe props

### 4. Interceptor Pattern (API Client)

Axios interceptors handle cross-cutting concerns:

```typescript
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  }
);
```

**Benefits:**
- Automatic token injection
- Centralized error handling
- 401 auto-logout
- Reduced boilerplate

---

## Code Examples

### 1. Creating a New Screen

```typescript
import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { entityService, Entity } from '../api/entity';
import { FloatingActionButton, FormModal, Input, Button } from '../components';

const EntityScreen = () => {
  // State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data on mount
  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const response = await entityService.getAll();
      setEntities(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load entities');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await entityService.create(formData);
      Alert.alert('Success', 'Entity created successfully');
      setModalVisible(false);
      loadEntities();
    } catch (error) {
      Alert.alert('Error', 'Failed to create entity');
    }
  };

  // Render
  if (isLoading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={entities}
        renderItem={({ item }) => <EntityCard entity={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
      <FloatingActionButton onPress={() => setModalVisible(true)} />
      <FormModal visible={modalVisible} onClose={() => setModalVisible(false)} title="Add Entity">
        <Input label="Name" value={formData.name} onChangeText={(name) => setFormData({ ...formData, name })} error={errors.name} required />
        <Input label="Code" value={formData.code} onChangeText={(code) => setFormData({ ...formData, code })} error={errors.code} required />
        <Button title="Submit" onPress={handleSubmit} />
      </FormModal>
    </View>
  );
};

export default EntityScreen;
```

### 2. Creating a New API Service

```typescript
import apiClient from './client';

export interface Entity {
  id: number;
  name: string;
  code: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEntityRequest {
  name: string;
  code: string;
}

export interface UpdateEntityRequest extends CreateEntityRequest {
  version: number;
}

export const entityService = {
  async getAll(params?: { search?: string; per_page?: number }) {
    const response = await apiClient.get('/entities', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(`/entities/${id}`);
    return response.data;
  },

  async create(data: CreateEntityRequest) {
    const response = await apiClient.post('/entities', data);
    return response.data;
  },

  async update(id: number, data: UpdateEntityRequest) {
    const response = await apiClient.put(`/entities/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/entities/${id}`);
    return response.data;
  },
};
```

### 3. Creating a New Reusable Component

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary': return styles.secondary;
      case 'danger': return styles.danger;
      default: return styles.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomButton;
```

---

## Best Practices

### 1. TypeScript Usage

✅ **DO:**
- Define interfaces for all entities
- Use type-safe props
- Export types for reuse
- Use strict type checking

❌ **DON'T:**
- Use `any` type
- Skip type definitions
- Use type assertions unless necessary

### 2. Component Design

✅ **DO:**
- Keep components focused (single responsibility)
- Extract reusable logic to custom hooks
- Use composition over inheritance
- Handle loading and error states

❌ **DON'T:**
- Create large monolithic components
- Mix business logic with UI
- Forget error handling
- Skip loading indicators

### 3. State Management

✅ **DO:**
- Use Context for global state (auth)
- Use useState for local state
- Keep state as close to where it's used
- Validate before updating state

❌ **DON'T:**
- Store everything in Context
- Create unnecessary global state
- Mutate state directly
- Skip validation

### 4. API Integration

✅ **DO:**
- Use interceptors for cross-cutting concerns
- Handle errors gracefully
- Show user-friendly messages
- Validate before API calls

❌ **DON'T:**
- Make API calls directly from components
- Ignore error responses
- Show technical error messages to users
- Skip client-side validation

### 5. Security

✅ **DO:**
- Store tokens in SecureStore
- Use HTTPS in production
- Validate all inputs
- Handle 401 errors (auto-logout)

❌ **DON'T:**
- Store tokens in AsyncStorage
- Log sensitive data
- Trust user input
- Ignore authentication errors

---

## Performance Optimization

### 1. List Rendering

```typescript
// Use FlatList instead of ScrollView + map
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={21}
/>
```

### 2. Memoization

```typescript
// Memoize expensive computations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Memoize callbacks
const handlePress = useCallback(() => {
  navigation.navigate('Details', { id });
}, [id, navigation]);
```

### 3. Image Optimization

```typescript
// Use appropriate image sizes
<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
/>
```

---

## Testing Strategy

### 1. Component Tests

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

test('Button calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button title="Click me" onPress={onPress} />);
  
  fireEvent.press(getByText('Click me'));
  
  expect(onPress).toHaveBeenCalled();
});
```

### 2. Integration Tests

```typescript
import { render, waitFor } from '@testing-library/react-native';
import SuppliersScreen from '../SuppliersScreen';
import { supplierService } from '../../api/supplier';

jest.mock('../../api/supplier');

test('Loads and displays suppliers', async () => {
  const mockSuppliers = [
    { id: 1, name: 'Supplier 1', code: 'S001' },
    { id: 2, name: 'Supplier 2', code: 'S002' },
  ];
  
  supplierService.getAll.mockResolvedValue({ data: mockSuppliers });
  
  const { getByText } = render(<SuppliersScreen />);
  
  await waitFor(() => {
    expect(getByText('Supplier 1')).toBeTruthy();
    expect(getByText('Supplier 2')).toBeTruthy();
  });
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot find module 'expo-secure-store'"
**Solution:**
```bash
npm install expo-secure-store
```

#### Issue: "Network request failed"
**Solution:**
- Check backend is running
- Verify API URL in `src/api/client.ts`
- Ensure device/simulator can reach backend

#### Issue: "401 Unauthorized"
**Solution:**
- Check token is being sent
- Verify token is valid
- Check backend authentication middleware

#### Issue: "TypeScript errors"
**Solution:**
```bash
npx tsc --noEmit
```

---

## Deployment

### iOS Build

```bash
# Using EAS Build
eas build --platform ios

# Or using Expo classic build
expo build:ios
```

### Android Build

```bash
# Using EAS Build
eas build --platform android

# Or using Expo classic build
expo build:android
```

---

## Conclusion

This architecture guide provides a comprehensive overview of the TrackVault frontend structure, patterns, and best practices. The application is built with:

- ✅ Clean Architecture
- ✅ Type Safety (TypeScript)
- ✅ Reusable Components
- ✅ Consistent Patterns
- ✅ Security Best Practices
- ✅ Performance Optimization
- ✅ Comprehensive Documentation

For more details, refer to:
- [Frontend README](frontend/README.md)
- [Implementation Guide](IMPLEMENTATION.md)
- [API Documentation](API.md)

---

**Last Updated:** 2025-12-26  
**Maintained by:** GitHub Copilot Agent
