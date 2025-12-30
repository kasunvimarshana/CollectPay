# Next Steps for Field Ledger Implementation

## Current Status: Phases 1 & 2 Complete ✅

The Field Ledger application has successfully completed the foundational layers:
- ✅ **Phase 1**: Application Layer (DTOs & Use Cases)
- ✅ **Phase 2**: Infrastructure Layer (Repositories & Providers)

## What's Been Accomplished

### Clean Architecture Foundation
1. **27 Use Cases** implementing business logic
2. **8 DTOs** for clean data transfer
3. **5 Repository implementations** with full CRUD operations
4. **Service Provider** for dependency injection
5. **Updated Domain models** to align with database schema

### Code Quality
- ✅ SOLID principles throughout
- ✅ Dependency Inversion via interfaces
- ✅ Single Responsibility for all classes
- ✅ Clean separation of concerns
- ✅ Zero framework dependencies in Domain layer

---

## Phase 3: Presentation Layer (API) - IMMEDIATE NEXT STEPS

### Priority 1: Create API Controllers

Create controllers in `backend/src/Presentation/Http/Controllers/`:

#### 1. SupplierController.php
```php
<?php

namespace Presentation\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Application\UseCases\Supplier\CreateSupplierUseCase;
use Application\UseCases\Supplier\UpdateSupplierUseCase;
use Application\UseCases\Supplier\DeleteSupplierUseCase;
use Application\UseCases\Supplier\GetSupplierUseCase;
use Application\UseCases\Supplier\ListSuppliersUseCase;
use Application\DTOs\CreateSupplierDTO;
use Application\DTOs\UpdateSupplierDTO;

class SupplierController extends Controller
{
    public function __construct(
        private readonly CreateSupplierUseCase $createSupplier,
        private readonly UpdateSupplierUseCase $updateSupplier,
        private readonly DeleteSupplierUseCase $deleteSupplier,
        private readonly GetSupplierUseCase $getSupplier,
        private readonly ListSuppliersUseCase $listSuppliers
    ) {}

    public function index(Request $request): JsonResponse
    {
        $result = $this->listSuppliers->execute(
            page: $request->get('page', 1),
            perPage: $request->get('per_page', 15),
            filters: $request->only(['is_active', 'search'])
        );

        return response()->json($result);
    }

    public function show(string $id): JsonResponse
    {
        $supplier = $this->getSupplier->execute($id);
        return response()->json($supplier->toArray());
    }

    public function store(Request $request): JsonResponse
    {
        $dto = CreateSupplierDTO::fromArray($request->all());
        $supplier = $this->createSupplier->execute($dto);

        return response()->json($supplier->toArray(), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $dto = UpdateSupplierDTO::fromArray($request->all());
        $supplier = $this->updateSupplier->execute($id, $dto);

        return response()->json($supplier->toArray());
    }

    public function destroy(string $id): JsonResponse
    {
        $this->deleteSupplier->execute($id);
        return response()->json(null, 204);
    }
}
```

#### 2. ProductController.php
Similar structure to SupplierController, plus:
- `addRate(Request $request, string $id)` - For rate management

#### 3. CollectionController.php
Similar structure, plus:
- `calculateTotal(Request $request, string $supplierId)` - Calculate totals

#### 4. PaymentController.php
Similar structure, plus:
- `calculateTotal(Request $request, string $supplierId)` - Calculate totals
- `calculateBalance(Request $request, string $supplierId)` - Calculate balance

#### 5. UserController.php
Similar structure for user management

#### 6. AuthController.php
```php
<?php

namespace Presentation\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        // Implement user registration using CreateUserUseCase
    }

    public function login(Request $request): JsonResponse
    {
        // Implement login with Laravel Sanctum
    }

    public function logout(Request $request): JsonResponse
    {
        // Implement logout
    }

    public function me(Request $request): JsonResponse
    {
        // Return current authenticated user
    }
}
```

### Priority 2: Define API Routes

Update `backend/routes/api.php`:

```php
<?php

use Illuminate\Support\Facades\Route;
use Presentation\Http\Controllers\AuthController;
use Presentation\Http\Controllers\SupplierController;
use Presentation\Http\Controllers\ProductController;
use Presentation\Http\Controllers\CollectionController;
use Presentation\Http\Controllers\PaymentController;
use Presentation\Http\Controllers\UserController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Resource routes
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('collections', CollectionController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('users', UserController::class);
    
    // Custom calculation routes
    Route::get('suppliers/{id}/collections/total', [CollectionController::class, 'calculateTotal']);
    Route::get('suppliers/{id}/payments/total', [PaymentController::class, 'calculateTotal']);
    Route::get('suppliers/{id}/balance', [PaymentController::class, 'calculateBalance']);
    
    // Product rate management
    Route::post('products/{id}/rates', [ProductController::class, 'addRate']);
});
```

### Priority 3: Create Request Validation Classes

Create in `backend/src/Presentation/Http/Requests/`:

#### Example: CreateSupplierRequest.php
```php
<?php

namespace Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Will be controlled by middleware
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'metadata' => 'nullable|array',
        ];
    }
}
```

Create similar validation classes for:
- CreateProductRequest
- UpdateProductRequest
- CreateCollectionRequest
- CreatePaymentRequest
- CreateUserRequest
- UpdateUserRequest

### Priority 4: Create API Resource Classes

Create in `backend/src/Presentation/Http/Resources/`:

#### Example: SupplierResource.php
```php
<?php

namespace Presentation\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id(),
            'name' => $this->name(),
            'email' => $this->email()?->value(),
            'phone' => $this->phone()?->value(),
            'address' => $this->address(),
            'is_active' => $this->isActive(),
            'metadata' => $this->metadata(),
            'created_at' => $this->createdAt()->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
```

Create similar resources for:
- ProductResource
- CollectionResource
- PaymentResource
- UserResource

---

## Phase 4: Authentication & Authorization

### Step 1: Install Laravel Sanctum
```bash
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Step 2: Configure Sanctum

Update `config/sanctum.php` for API token authentication.

### Step 3: Create Authentication Middleware

Create `backend/app/Http/Middleware/CheckRole.php`:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }
}
```

### Step 4: Register Middleware

Update `bootstrap/app.php` or `app/Http/Kernel.php` to register the middleware.

### Step 5: Protect Routes

Update routes to use role-based middleware:
```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('users', UserController::class);
});
```

---

## Phase 5: Testing

### Unit Tests for Use Cases

Create tests in `backend/tests/Unit/Application/UseCases/`:

```php
<?php

namespace Tests\Unit\Application\UseCases\Supplier;

use Tests\TestCase;
use Application\UseCases\Supplier\CreateSupplierUseCase;
use Application\DTOs\CreateSupplierDTO;
use Domain\Repositories\SupplierRepositoryInterface;
use Mockery;

class CreateSupplierUseCaseTest extends TestCase
{
    public function test_it_creates_a_supplier()
    {
        $repository = Mockery::mock(SupplierRepositoryInterface::class);
        $useCase = new CreateSupplierUseCase($repository);
        
        $dto = CreateSupplierDTO::fromArray([
            'name' => 'Test Supplier',
            'email' => 'test@example.com',
        ]);
        
        $repository->shouldReceive('save')
            ->once()
            ->andReturn(Mockery::mock('Domain\Entities\Supplier'));
        
        $result = $useCase->execute($dto);
        
        $this->assertInstanceOf('Domain\Entities\Supplier', $result);
    }
}
```

### Feature Tests for API Endpoints

Create tests in `backend/tests/Feature/Api/`:

```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;

class SupplierApiTest extends TestCase
{
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
                'name' => 'New Supplier',
                'email' => 'new@example.com',
            ]);
        
        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'name', 'email']);
    }
}
```

---

## Phase 6: Frontend - React Native/Expo

### Step 1: Clean Architecture Structure

Create this structure in `frontend/src/`:

```
src/
├── domain/
│   ├── entities/
│   │   ├── Supplier.ts
│   │   ├── Product.ts
│   │   ├── Collection.ts
│   │   └── Payment.ts
│   ├── repositories/
│   │   └── interfaces/
│   └── usecases/
│       ├── supplier/
│       ├── product/
│       ├── collection/
│       └── payment/
├── data/
│   ├── repositories/
│   │   └── implementations/
│   ├── datasources/
│   │   ├── api/
│   │   └── local/
│   └── models/
├── presentation/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   └── state/
└── core/
    ├── network/
    ├── storage/
    └── utils/
```

### Step 2: Install Dependencies

```bash
cd frontend
npm install @react-navigation/native @react-navigation/stack
npm install react-native-async-storage
npm install axios
npm install zustand  # or redux-toolkit
```

### Step 3: Implement Domain Entities

```typescript
// src/domain/entities/Supplier.ts
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### Step 4: Implement API Client

```typescript
// src/data/datasources/api/ApiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://your-backend-url/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Step 5: Implement Offline Support

```typescript
// src/core/storage/OfflineQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineQueue {
  private static QUEUE_KEY = '@offline_queue';

  static async add(operation: any): Promise<void> {
    const queue = await this.getQueue();
    queue.push(operation);
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static async getQueue(): Promise<any[]> {
    const data = await AsyncStorage.getItem(this.QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async process(): Promise<void> {
    const queue = await this.getQueue();
    // Process each operation and sync with backend
    for (const operation of queue) {
      try {
        await this.syncOperation(operation);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }

  private static async syncOperation(operation: any): Promise<void> {
    // Implement sync logic
  }
}
```

---

## Quick Start Commands

### Backend Testing
```bash
cd backend

# Run migrations
php artisan migrate

# Run tests
php artisan test

# Start server
php artisan serve
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start Expo
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

---

## Success Criteria

### Backend
- [ ] All API endpoints functional
- [ ] Authentication working with Sanctum
- [ ] All use cases testable and tested
- [ ] API documentation complete
- [ ] RBAC implemented

### Frontend
- [ ] All screens implemented
- [ ] Offline support working
- [ ] Data syncs correctly
- [ ] Clean Architecture followed
- [ ] User authentication working

---

## Resources

- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **SOLID Principles**: https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design
- **Laravel Docs**: https://laravel.com/docs
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Expo Docs**: https://docs.expo.dev/

---

**Remember**: Always follow the established patterns in the codebase. The foundation is solid—build upon it consistently!
