# Security Documentation - TrackVault

## Overview

TrackVault implements comprehensive security measures following industry best practices to ensure data integrity, confidentiality, and availability. The security architecture is designed around **Defense in Depth**, implementing multiple layers of protection.

## Security Architecture

### 1. Authentication

#### Laravel Sanctum Token-Based Authentication
- **Implementation**: Uses Laravel Sanctum for API token authentication
- **Token Storage**: Tokens stored securely in Expo SecureStore (encrypted) on frontend
- **Token Lifecycle**: 
  - Generated on login
  - Included in all API requests via Authorization header
  - Automatically deleted on logout
  - Expired tokens rejected by backend

#### Password Security
- **Hashing**: Bcrypt algorithm with automatic salting
- **Minimum Requirements**: 8 characters (enforced in validation)
- **Production Recommendation**: Enforce stronger passwords (uppercase, lowercase, numbers, symbols)

```php
// Backend password hashing
'password' => Hash::make($request->password)
```

### 2. Authorization

#### Role-Based Access Control (RBAC)

Three primary roles with distinct permissions:

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, user management, all CRUD operations |
| **Collector** | Create/view collections, view suppliers, view products |
| **Finance** | Create/view payments, view reports, supplier balance queries |

**Implementation**:
```php
// User model
public function hasPermission(string $permission): bool
{
    if ($this->role === 'admin') {
        return true; // Admins have all permissions
    }
    
    $permissions = $this->permissions ?? [];
    return in_array($permission, $permissions);
}
```

#### Attribute-Based Access Control (ABAC)

Users can have granular permissions stored in JSON field:
- Custom permissions can be assigned to users
- Permissions checked before sensitive operations
- Extensible for future requirements

```php
// Example permissions array
'permissions' => ['view_reports', 'export_data', 'manage_rates']
```

### 3. Data Protection

#### Encryption at Rest
- **Database**: Use encrypted database connections in production
- **Sensitive Fields**: Consider encrypting sensitive metadata fields
- **Environment Variables**: Store credentials in `.env` (never commit to Git)

#### Encryption in Transit
- **HTTPS Required**: All production API calls must use HTTPS
- **TLS 1.2+**: Enforce modern TLS versions
- **Certificate Pinning**: Recommended for mobile apps in production

```typescript
// Frontend API client
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.trackvault.com/api';
```

#### Secure Storage (Frontend)
- **SecureStore**: Sensitive data (auth tokens) stored in Expo SecureStore
- **AsyncStorage**: Non-sensitive data only (preferences, cache)
- **Never Store**: Passwords, financial data, PII in local storage

```typescript
import * as SecureStore from 'expo-secure-store';

// Store token securely
await SecureStore.setItemAsync('authToken', token);
```

### 4. Data Integrity

#### Version-Based Optimistic Locking

Prevents concurrent update conflicts:

```php
// Update with version check
DB::transaction(function () use ($model, $validated) {
    if ($model->version != $validated['version']) {
        throw new \Exception('Version mismatch. Please refresh and try again.');
    }
    
    $validated['version'] = $model->version + 1;
    $model->update($validated);
});
```

**Flow**:
1. Client fetches record with current version
2. User makes changes
3. Client sends update with original version
4. Server checks if version matches
5. If match: Update succeeds, version incremented
6. If mismatch: Update rejected, client must refresh

#### Database Transactions

All critical operations wrapped in transactions:
```php
$collection = DB::transaction(function () use ($validated, $request) {
    // Multiple database operations
    // All succeed or all rollback
    return Collection::create($validated);
});
```

#### Soft Deletes

Audit trail maintained:
- Records never permanently deleted
- `deleted_at` timestamp tracks deletion
- Can be restored if needed
- Supports compliance requirements

### 5. Input Validation

#### Server-Side Validation

**Never trust client input** - All validation enforced on backend:

```php
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:users',
    'quantity' => 'required|numeric|min:0.001',
    'payment_type' => 'required|in:advance,partial,full',
]);
```

#### SQL Injection Prevention
- **Eloquent ORM**: Uses parameterized queries
- **Query Builder**: Automatic parameter binding
- **Never**: Concatenate user input into SQL

#### XSS Prevention
- **Output Encoding**: Automatic in Laravel views
- **JSON API**: Content-Type headers prevent XSS
- **Frontend**: React Native escapes by default

### 6. API Security

#### Rate Limiting
**Recommended for Production**:
```php
// routes/api.php
Route::middleware(['throttle:60,1'])->group(function () {
    // 60 requests per minute per IP
});
```

#### CORS Configuration
```php
// config/cors.php
'allowed_origins' => [
    env('FRONTEND_URL', 'https://app.trackvault.com')
],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_headers' => ['Content-Type', 'Authorization'],
```

#### Request Validation
- All endpoints require valid JSON
- Content-Type header validation
- Request size limits enforced

### 7. Audit Trail

#### Automatic Tracking

All models include:
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp
- `deleted_at`: Soft delete timestamp (if applicable)
- `user_id`: User who created/modified (collections, payments)

#### Logging Recommendations

For production, implement:
```php
// Log security events
Log::channel('security')->info('Login attempt', [
    'email' => $email,
    'ip' => $request->ip(),
    'success' => $success
]);
```

### 8. Multi-User & Multi-Device Security

#### Session Management
- Each device gets independent token
- Multiple concurrent sessions supported
- Token revocation on logout affects only that device

#### Concurrency Control
- Version-based locking prevents data corruption
- Transactions ensure atomicity
- Race conditions handled deterministically

### 9. Security Checklist for Production

#### Backend
- [ ] Enable HTTPS only (disable HTTP)
- [ ] Set strong `APP_KEY` in `.env`
- [ ] Configure secure database credentials
- [ ] Enable query logging for auditing
- [ ] Implement rate limiting
- [ ] Configure CORS properly
- [ ] Disable debug mode (`APP_DEBUG=false`)
- [ ] Review and harden `.env` settings
- [ ] Set up automated backups
- [ ] Implement monitoring and alerting

#### Frontend
- [ ] Use HTTPS API endpoint only
- [ ] Enable certificate pinning
- [ ] Implement biometric authentication (optional)
- [ ] Clear sensitive data on logout
- [ ] Implement secure session timeout
- [ ] Handle token refresh properly
- [ ] Validate all user inputs
- [ ] Implement proper error handling (no sensitive data in errors)

#### General
- [ ] Regular security audits
- [ ] Dependency updates (check for CVEs)
- [ ] Penetration testing
- [ ] Security training for developers
- [ ] Incident response plan
- [ ] Regular backups and recovery testing

### 10. Known Limitations & Recommendations

#### Current Implementation
- Basic RBAC (3 roles)
- Token-based auth (no refresh tokens)
- No 2FA/MFA
- No password complexity requirements
- No account lockout on failed attempts

#### Production Recommendations
1. **Implement 2FA/MFA** for admin accounts
2. **Add password complexity rules** (uppercase, lowercase, numbers, symbols)
3. **Account lockout** after N failed login attempts
4. **Refresh tokens** for better token management
5. **IP whitelisting** for admin access
6. **Audit logging** to database or external service
7. **Security headers** (CSP, HSTS, X-Frame-Options, etc.)
8. **Regular penetration testing**
9. **WAF (Web Application Firewall)** in front of API
10. **DDoS protection** via CDN

### 11. Vulnerability Reporting

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: security@trackvault.com
3. Include detailed description and steps to reproduce
4. Allow reasonable time for fix before public disclosure

### 12. Compliance Considerations

This system can support:
- **GDPR**: Data portability, right to be forgotten (soft deletes)
- **SOC 2**: Audit trails, access controls, encryption
- **PCI DSS**: If handling payment cards (not currently implemented)

Additional compliance features may be required based on jurisdiction and use case.

---

**Last Updated**: 2025-12-25
**Version**: 1.0
