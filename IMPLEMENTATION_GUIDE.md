# Next Steps - Implementation Guide

## Current Status

✅ **Completed:**
- Backend Application Layer (DTOs & Use Cases)
- Backend Infrastructure Layer (Repositories & Providers)
- Backend Presentation Layer (API Controllers, Routes, Middleware)
- Frontend Architecture Setup (Clean Architecture structure)
- Frontend Domain Layer (Entities & Repository Interfaces)
- Frontend Data Layer (Repository Implementations)
- Frontend Core Layer (API Client, Storage, Queue)

⏳ **In Progress:**
- Backend Authentication (Sanctum installation pending)
- Frontend Presentation Layer (UI pending)

📋 **Not Started:**
- Backend Testing
- Frontend Testing
- Deployment Configuration

---

## Immediate Next Steps (Priority Order)

### Step 1: Complete Backend Authentication Setup

#### Install Laravel Sanctum
```bash
cd backend

# Install Sanctum (requires network connection)
composer require laravel/sanctum

# Publish configuration
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Run migrations
php artisan migrate
```

#### Update User Model
```php
// backend/app/Models/User.php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasUuids, HasApiTokens;
    // ... rest of the model
}
```

#### Register Middleware
```php
// backend/bootstrap/app.php or config/kernel.php
protected $middlewareAliases = [
    // ... other middleware
    'role' => \Presentation\Http\Middleware\CheckRole::class,
];
```

#### Configure CORS
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],  // Restrict in production
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

#### Create .env file
```bash
cd backend
cp .env.example .env

# Configure database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fieldledger
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Generate app key
php artisan key:generate
```

#### Test Authentication
```bash
# Start server
php artisan serve

# Test registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

### Step 2: Complete Frontend Setup

#### Install Dependencies
```bash
cd frontend

# Install all packages
npm install

# Or if you prefer yarn
yarn install
```

#### Create State Management Store
```typescript
// frontend/src/presentation/state/authStore.ts
import { create } from 'zustand';
import { User } from '@domain/entities/User';
import { AuthRepository } from '@data/repositories/AuthRepository';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const authRepository = new AuthRepository();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authRepository.login(email, password);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authRepository.register(name, email, password, passwordConfirmation);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authRepository.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authRepository.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
```

#### Create Navigation Structure
```typescript
// frontend/src/presentation/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../state/authStore';

// Import screens (to be created)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SuppliersScreen from '../screens/suppliers/SuppliersScreen';
import ProductsScreen from '../screens/products/ProductsScreen';
import CollectionsScreen from '../screens/collections/CollectionsScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Suppliers" component={SuppliersScreen} />
            <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="Collections" component={CollectionsScreen} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

#### Create Login Screen
```typescript
// frontend/src/presentation/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../state/authStore';

const LoginScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigation handled by RootNavigator
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={isLoading}
      />
      
      <Button
        title="Create Account"
        onPress={() => navigation.navigate('Register')}
      />
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
```

#### Update App Entry Point
```typescript
// frontend/App.tsx
import React from 'react';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';

export default function App() {
  return <RootNavigator />;
}
```

#### Test Frontend
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

### Step 3: Backend Testing

#### Create Test Base Classes
```php
// backend/tests/TestCase.php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
}
```

#### Create Unit Test Example
```php
// backend/tests/Unit/Domain/ValueObjects/MoneyTest.php
<?php

namespace Tests\Unit\Domain\ValueObjects;

use Tests\TestCase;
use Domain\ValueObjects\Money;

class MoneyTest extends TestCase
{
    public function test_can_create_money_instance()
    {
        $money = new Money(100.50, 'USD');
        
        $this->assertEquals(100.50, $money->amount());
        $this->assertEquals('USD', $money->currency());
    }
    
    public function test_can_add_money()
    {
        $money1 = new Money(100.00, 'USD');
        $money2 = new Money(50.00, 'USD');
        
        $result = $money1->add($money2);
        
        $this->assertEquals(150.00, $result->amount());
    }
    
    public function test_cannot_add_different_currencies()
    {
        $this->expectException(\InvalidArgumentException::class);
        
        $money1 = new Money(100.00, 'USD');
        $money2 = new Money(50.00, 'EUR');
        
        $money1->add($money2);
    }
}
```

#### Create Feature Test Example
```php
// backend/tests/Feature/Api/SupplierApiTest.php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SupplierApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_suppliers()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/suppliers');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'total',
                'page',
                'per_page',
                'last_page',
            ]);
    }
    
    public function test_can_create_supplier()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/suppliers', [
                'name' => 'Test Supplier',
                'email' => 'test@example.com',
                'phone' => '1234567890',
            ]);
        
        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'name', 'email']);
    }
}
```

#### Run Tests
```bash
cd backend

# Run all tests
php artisan test

# Run specific test
php artisan test --filter=SupplierApiTest

# Run with coverage
php artisan test --coverage
```

---

### Step 4: Frontend UI Components

Create reusable components for consistent UI:

#### Button Component
```typescript
// frontend/src/presentation/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  secondary: {
    backgroundColor: '#6c757d',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

#### Card Component
```typescript
// frontend/src/presentation/components/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

---

### Step 5: Deployment Preparation

#### Backend Deployment

1. **Environment Configuration**
```bash
# Production .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-production-url.com

# Database
DB_CONNECTION=mysql
DB_HOST=production-db-host
DB_DATABASE=fieldledger_production

# Cache & Queue
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Security
SESSION_SECURE_COOKIE=true
```

2. **Optimize for Production**
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

3. **Setup Queue Worker**
```bash
# supervisor config for queue worker
[program:fieldledger-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/path/to/worker.log
```

#### Frontend Deployment

1. **Build for Production**
```bash
cd frontend

# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build for Web
expo build:web
```

2. **Expo EAS Build**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for app stores
eas build --platform android
eas build --platform ios
```

---

## Summary Checklist

### Backend ✅
- [x] Clean Architecture implemented
- [x] Controllers created
- [x] Routes defined
- [ ] Sanctum installed
- [ ] Tests written
- [ ] Deployed

### Frontend ✅
- [x] Architecture setup
- [x] Domain layer complete
- [x] Data layer complete
- [ ] State management added
- [ ] Navigation implemented
- [ ] UI components created
- [ ] Screens completed
- [ ] Tests written
- [ ] Built for production

### DevOps ⏳
- [ ] CI/CD pipeline
- [ ] Docker containers
- [ ] Database backups
- [ ] Monitoring setup
- [ ] Logging configured

---

## Getting Help

### Documentation
- Backend: `/backend/README.md`
- Frontend: `/frontend/README.md`
- Architecture: `/ARCHITECTURE.md`
- API: (to be added)

### Common Issues
- **Composer fails**: Check GitHub token or use offline installation
- **npm install fails**: Clear cache with `npm cache clean --force`
- **Migration errors**: Check database connection in `.env`
- **Expo errors**: Run `expo doctor` to diagnose

### Resources
- Laravel: https://laravel.com/docs
- React Native: https://reactnative.dev
- Expo: https://docs.expo.dev
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

---

**Ready to proceed with implementation! Start with Step 1 for immediate progress.**
