# FieldLedger Security Guide

## Overview

This document outlines the security measures implemented in FieldLedger and best practices for maintaining a secure deployment.

## Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────────────────┐
│                  Application Security Layers                 │
├─────────────────────────────────────────────────────────────┤
│  1. Transport Layer (HTTPS/TLS 1.3)                         │
│  2. Authentication (Laravel Sanctum JWT)                     │
│  3. Authorization (RBAC + ABAC)                             │
│  4. Input Validation & Sanitization                          │
│  5. Database Layer (Prepared Statements)                     │
│  6. Data Encryption (At Rest & In Transit)                  │
│  7. Audit Logging                                            │
└─────────────────────────────────────────────────────────────┘
```

## Authentication & Authorization

### Laravel Sanctum JWT

**Token Generation**:
- Tokens are generated upon successful login
- Tokens are signed using application key
- Tokens include user ID and device information
- Tokens expire after configured period (default: 24 hours)

**Token Storage (Mobile)**:
- Stored in Expo SecureStore (encrypted keychain/keystore)
- Never stored in plain text or AsyncStorage
- Automatically included in API requests via interceptor

### Role-Based Access Control (RBAC)

**Roles**:
- `admin`: Full system access
- `manager`: Read/write access, can approve transactions
- `collector`: Create and edit own records
- `viewer`: Read-only access

**Implementation**:
```php
// Backend Middleware
Route::middleware(['auth:sanctum', 'role:admin,manager'])->group(function() {
    // Protected routes
});

// User Model
public function hasRole(string $role): bool {
    return $this->role === $role;
}
```

### Attribute-Based Access Control (ABAC)

**Fine-grained Permissions**:
```php
// User Model
public function canAccess(string $resource, string $action): bool {
    if ($this->role === 'admin') return true;
    
    $permission = "{$resource}.{$action}";
    return $this->hasPermission($permission);
}
```

**Permission Examples**:
- `suppliers.create`
- `suppliers.update`
- `transactions.create`
- `payments.approve`

## Data Encryption

### At Rest

**Backend (Database)**:
- Database-level encryption (MySQL encryption at rest)
- Sensitive fields encrypted before storage
- Encryption keys stored securely (not in code)

**Frontend (Mobile)**:
- Expo SecureStore for sensitive data
- Custom encryption service for cached data
- Secure key generation and storage

```typescript
// Frontend Encryption
import { encryptionService } from './services/encryptionService';

// Encrypt sensitive data
const encrypted = await encryptionService.encrypt(sensitiveData);

// Store securely
await encryptionService.secureStore('key', encrypted);

// Retrieve and decrypt
const decrypted = await encryptionService.secureRetrieve('key');
```

### In Transit

**HTTPS/TLS 1.3**:
- All API communications use HTTPS
- TLS 1.3 for modern security
- Certificate pinning (optional for high security)

```typescript
// Optional: Certificate Pinning
const apiClient = axios.create({
    baseURL: API_URL,
    httpsAgent: new https.Agent({
        ca: fs.readFileSync('path/to/ca-certificate.pem'),
    }),
});
```

## Input Validation & Sanitization

### Backend Validation

**Laravel Request Validation**:
```php
$validated = $request->validate([
    'email' => 'required|email|max:255',
    'amount' => 'required|numeric|min:0',
    'phone' => 'nullable|regex:/^[0-9]{10}$/',
]);
```

**Custom Validation Rules**:
```php
// Prevent SQL injection
$input = htmlspecialchars($request->input('notes'), ENT_QUOTES, 'UTF-8');

// Sanitize file uploads
$validator->after(function ($validator) {
    // Custom validation logic
});
```

### Frontend Validation

**React Hook Form**:
```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onBlur',
});

<TextInput
    {...register('email', {
        required: 'Email is required',
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
        },
    })}
/>
```

## SQL Injection Prevention

**Eloquent ORM**:
- All queries use prepared statements
- No raw SQL concatenation
- Parameter binding for dynamic queries

```php
// Safe: Eloquent ORM
Transaction::where('supplier_id', $supplierId)->get();

// Safe: Query Builder with bindings
DB::table('transactions')
    ->where('supplier_id', '=', $supplierId)
    ->get();

// Safe: Raw query with bindings
DB::select('SELECT * FROM transactions WHERE supplier_id = ?', [$supplierId]);
```

## Cross-Site Scripting (XSS) Prevention

**Laravel Built-in Protection**:
- Blade templates auto-escape output
- `{{ }}` syntax escapes HTML
- Use `{!! !!}` only for trusted content

**Frontend Protection**:
```typescript
// React automatically escapes JSX
<Text>{userInput}</Text>  // Safe

// Be careful with dangerouslySetInnerHTML
// Only use for sanitized HTML
```

## Cross-Site Request Forgery (CSRF)

**API Token Authentication**:
- Stateless API using tokens
- No session-based CSRF tokens needed
- SameSite cookie attribute (if using cookies)

## Rate Limiting

### Backend Rate Limiting

**Laravel Throttle Middleware**:
```php
// routes/api.php
Route::middleware(['throttle:60,1'])->group(function () {
    // Allow 60 requests per minute per IP
});

// Custom rate limiting
RateLimiter::for('api', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(20)->by($request->ip());
});
```

### Failed Login Protection

**Account Lockout**:
```php
// Implement in AuthController
if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
    $seconds = RateLimiter::availableIn($throttleKey);
    throw ValidationException::withMessages([
        'email' => ["Too many login attempts. Please try again in {$seconds} seconds."],
    ]);
}
```

## Secure Password Handling

**Hashing**:
```php
// Laravel uses bcrypt by default
$user->password = Hash::make($password);

// Verification
if (Hash::check($password, $user->password)) {
    // Password correct
}
```

**Password Requirements**:
- Minimum 8 characters
- Must include uppercase, lowercase, number
- No common passwords
- Password confirmation required

## Session Management

**Token Expiration**:
```php
// config/sanctum.php
'expiration' => 1440, // 24 hours

// Manual token revocation
$request->user()->currentAccessToken()->delete();
```

**Device Management**:
```php
// Track active devices per user
Device::where('user_id', $userId)
    ->where('is_active', true)
    ->get();

// Revoke all user tokens
$user->tokens()->delete();
```

## Audit Logging

### What to Log

**Security Events**:
- Login attempts (successful and failed)
- Password changes
- Permission changes
- Data modifications
- API access patterns

**Implementation**:
```php
// Create audit log entry
AuditLog::create([
    'user_id' => auth()->id(),
    'action' => 'transaction.created',
    'entity_type' => 'Transaction',
    'entity_id' => $transaction->id,
    'ip_address' => $request->ip(),
    'user_agent' => $request->userAgent(),
    'changes' => json_encode($transaction->toArray()),
]);
```

## Sync Security

### Tamper-Resistant Sync

**Request Signing**:
```typescript
import CryptoJS from 'crypto-js';

// Generate signature
const signature = CryptoJS.HmacSHA256(
    JSON.stringify(payload),
    secretKey
).toString();

// Include in request
headers: {
    'X-Signature': signature,
    'X-Timestamp': timestamp,
}
```

**Backend Verification**:
```php
// Verify signature
$expectedSignature = hash_hmac('sha256', $request->getContent(), config('app.key'));

if (!hash_equals($expectedSignature, $request->header('X-Signature'))) {
    abort(401, 'Invalid signature');
}
```

### Idempotent Operations

**UUID-based Deduplication**:
```php
// Check for duplicate
if (Transaction::where('uuid', $uuid)->exists()) {
    return response()->json(['status' => 'duplicate'], 200);
}

// Create with UUID
Transaction::create(['uuid' => $uuid, ...]);
```

## Security Headers

**Nginx Configuration**:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## File Upload Security

**Validation**:
```php
$request->validate([
    'file' => 'required|file|mimes:pdf,jpg,png|max:2048', // 2MB max
]);

// Additional checks
$extension = $file->getClientOriginalExtension();
$mimeType = $file->getMimeType();

// Scan for malware (use ClamAV or similar)
```

## API Security Best Practices

### 1. Use HTTPS Only
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

### 2. Validate Content-Type
```php
if ($request->header('Content-Type') !== 'application/json') {
    abort(415, 'Unsupported Media Type');
}
```

### 3. Limit Response Data
```php
// Don't expose sensitive fields
return response()->json($user->makeHidden(['password', 'remember_token']));
```

### 4. Implement CORS Properly
```php
// config/cors.php
'allowed_origins' => ['https://app.fieldledger.com'],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_headers' => ['Content-Type', 'Authorization'],
```

## Mobile App Security

### 1. Code Obfuscation
```bash
# For production builds
npx react-native-obfuscating-transformer
```

### 2. Root/Jailbreak Detection
```typescript
import { isRooted, isJailbroken } from 'react-native-device-info';

if (await isRooted() || await isJailbroken()) {
    // Warn user or restrict functionality
}
```

### 3. SSL Pinning (Optional)
```typescript
// For high-security requirements
const trustManager = await SSLPinning.addCertificate('api.fieldledger.com', certificateData);
```

## Incident Response

### Security Incident Checklist

1. **Detect**: Monitor logs for suspicious activity
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix vulnerabilities
5. **Recover**: Restore normal operations
6. **Learn**: Document lessons learned

### Emergency Contacts

- Security Team: security@fieldledger.com
- On-Call Engineer: +1-XXX-XXX-XXXX

## Compliance

### Data Protection

- **GDPR**: User data privacy and right to deletion
- **CCPA**: California Consumer Privacy Act compliance
- **Data Retention**: Configurable retention policies

### Regular Security Audits

- **Code Reviews**: All changes reviewed for security
- **Penetration Testing**: Quarterly security assessments
- **Dependency Scanning**: Automated vulnerability checks
- **Security Training**: Regular developer training

## Security Checklist

### Deployment Security

- [ ] HTTPS/TLS configured
- [ ] Strong passwords enforced
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Security headers set
- [ ] Database credentials secured
- [ ] API tokens rotated regularly
- [ ] Audit logging enabled
- [ ] Backups encrypted
- [ ] Firewall configured
- [ ] Intrusion detection system active
- [ ] Regular security updates applied

### Application Security

- [ ] Input validation implemented
- [ ] Output encoding/escaping
- [ ] Prepared statements for SQL
- [ ] Authentication required for APIs
- [ ] Authorization checks on all operations
- [ ] Sensitive data encrypted
- [ ] Error messages don't leak information
- [ ] File uploads validated
- [ ] Session timeout configured
- [ ] Password complexity enforced

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security](https://laravel.com/docs/security)
- [React Native Security](https://reactnative.dev/docs/security)
- [CWE Top 25](https://cwe.mitre.org/top25/)

## Updates

This security guide should be reviewed and updated:
- After each security incident
- Quarterly as part of security audits
- When new features are added
- When new threats are identified
