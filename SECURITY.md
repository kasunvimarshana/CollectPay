# PayMaster Security Documentation

## Overview

This document outlines the security measures implemented in the PayMaster application and best practices for maintaining security in production.

## Security Architecture

### Defense in Depth

The application implements multiple layers of security:

1. **Network Layer**: HTTPS/TLS encryption, firewall rules
2. **Application Layer**: Authentication, authorization, input validation
3. **Data Layer**: Encrypted storage, SQL injection prevention
4. **Infrastructure Layer**: Secure configuration, monitoring

## Authentication

### Backend Authentication

**Implementation**: Laravel Sanctum (Token-based)

**Features**:
- Secure password hashing using bcrypt (cost factor 12)
- Token-based API authentication
- Token expiration and refresh
- Session management
- Account lockout after failed attempts (recommended)

**Password Requirements**:
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers (recommended)
- Special characters encouraged

**Best Practices**:
```php
// Password hashing
$hash = bcrypt($password);

// Password verification
if (Hash::check($password, $hash)) {
    // Authenticated
}
```

### Frontend Authentication

**Token Storage**: Expo SecureStore (encrypted)

**Implementation**:
```typescript
// Store token securely
await SecureStore.setItemAsync('auth_token', token);

// Retrieve token
const token = await SecureStore.getItemAsync('auth_token');

// Delete token on logout
await SecureStore.deleteItemAsync('auth_token');
```

**Auto-logout**:
- Automatic logout on token expiration
- Logout on security errors
- Clear all local data on logout

## Authorization

### Role-Based Access Control (RBAC)

**Roles**:
- **Admin**: Full system access
- **Manager**: Can manage rates, make payments, view reports
- **Collector**: Can record collections, view data

**Implementation**:
```php
// Check role
if ($user->hasRole('admin')) {
    // Allow action
}

// Check multiple roles
if ($user->hasAnyRole(['admin', 'manager'])) {
    // Allow action
}
```

### Attribute-Based Access Control (ABAC)

**Permissions**:
- `manage_users`: Create, update, delete users
- `manage_rates`: Create, update product rates
- `make_payments`: Record payments
- `view_reports`: Access financial reports
- `manage_suppliers`: Manage supplier information
- `manage_products`: Manage product catalog

**Implementation**:
```php
// Check permission
if ($user->hasPermission('make_payments')) {
    // Allow payment
}
```

### API Endpoint Protection

All endpoints require authentication except:
- `POST /auth/register`
- `POST /auth/login`

Role/Permission requirements by endpoint:

```
Admin Only:
- POST /users
- DELETE /users/{id}
- POST /users/{id}/roles

Manager or Admin:
- POST /products/{id}/rates
- PUT /products/{id}/rates/{id}
- POST /payments

All Authenticated:
- GET /suppliers
- POST /collections
- GET /products
```

## Data Security

### Encryption

**In Transit**:
- All API communication over HTTPS/TLS 1.3
- Certificate pinning (recommended for production)
- No plain HTTP allowed

**At Rest**:
- Database encryption (recommended)
- Secure token storage (SecureStore)
- Sensitive field encryption (optional)

### Input Validation

**Backend Validation**:
```php
// All inputs validated
$validated = $request->validate([
    'email' => 'required|email|unique:users',
    'quantity' => 'required|numeric|min:0|max:999999.999',
    'amount' => 'required|numeric|min:0|max:999999999.99',
]);
```

**Frontend Validation**:
```typescript
// Validate before submission
if (quantity <= 0 || quantity > 999999.999) {
    throw new Error('Invalid quantity');
}
```

### SQL Injection Prevention

**Use Prepared Statements**:
```php
// Good - Parameterized query
$users = DB::select('SELECT * FROM users WHERE email = ?', [$email]);

// Bad - String concatenation
// NEVER DO THIS
$users = DB::select("SELECT * FROM users WHERE email = '$email'");
```

**ORM Usage**:
```php
// Use Eloquent ORM with parameter binding
$user = User::where('email', $email)->first();
```

### XSS Prevention

**Output Escaping**:
```php
// Blade templates auto-escape
{{ $user->name }}  // Safe

// Raw output (dangerous)
{!! $html !!}  // Only use with trusted content
```

**Frontend**:
```typescript
// React Native auto-escapes text
<Text>{userInput}</Text>  // Safe
```

### CSRF Protection

**Backend**:
- CSRF tokens for state-changing operations
- Token validation on POST/PUT/DELETE
- SameSite cookie attribute

**API Tokens**:
- Sanctum tokens are CSRF-protected
- Token required in Authorization header

## API Security

### Rate Limiting

**Implementation**:
```php
// Default: 60 requests per minute per user
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// Auth endpoints: 5 per minute per IP
RateLimiter::for('auth', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});
```

**Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1234567890
```

### CORS Configuration

**Allowed Origins**:
```php
'allowed_origins' => [
    'https://app.paymaster.com',
    'https://admin.paymaster.com',
],
```

**Allowed Methods**:
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers**:
```
Content-Type, Authorization, X-Requested-With
```

### Request Size Limits

```php
// Maximum request size: 10MB
'post_max_size' => '10M',
'upload_max_filesize' => '10M',
```

## Session Security

### Session Configuration

```php
'lifetime' => 120, // minutes
'expire_on_close' => true,
'secure' => true, // HTTPS only
'http_only' => true, // Not accessible via JavaScript
'same_site' => 'strict',
```

### Token Management

**Token Expiration**:
- Access tokens: 60 minutes
- Refresh tokens: 7 days
- Automatic refresh on activity

**Token Revocation**:
```php
// Revoke current token
$request->user()->currentAccessToken()->delete();

// Revoke all tokens (logout all devices)
$request->user()->tokens()->delete();
```

## Data Privacy

### Personal Data Protection

**Minimal Collection**:
- Only collect necessary data
- Clear privacy policy
- User consent for data collection

**Data Retention**:
- Define retention policies
- Automatic data purging (if applicable)
- User data export capability

**Data Access**:
- Users can view their own data
- Admin access logged and audited
- Data access requests handled

### Audit Logging

**What to Log**:
- Authentication attempts (success/failure)
- Authorization failures
- Data modifications (who, what, when)
- Administrative actions
- Security events

**Log Structure**:
```php
[
    'timestamp' => '2025-12-23 10:00:00',
    'user_id' => 1,
    'action' => 'payment.created',
    'resource_type' => 'payment',
    'resource_id' => 123,
    'ip_address' => '192.168.1.1',
    'user_agent' => '...',
]
```

**Log Security**:
- Logs stored securely
- Access restricted
- Regular log rotation
- No sensitive data in logs (passwords, tokens)

## Vulnerability Prevention

### Common Vulnerabilities

**SQL Injection**: ✅ Prevented
- Use parameterized queries
- ORM usage
- Input validation

**XSS**: ✅ Prevented
- Output escaping
- Content Security Policy
- Sanitization

**CSRF**: ✅ Prevented
- CSRF tokens
- SameSite cookies
- Token-based API auth

**Authentication Bypass**: ✅ Prevented
- Strong password hashing
- Secure session management
- Token validation

**Authorization Bypass**: ✅ Prevented
- Middleware checks
- Permission validation
- Role verification

**Mass Assignment**: ✅ Prevented
```php
// Use fillable or guarded
protected $fillable = ['name', 'email'];
```

**Insecure Direct Object References**: ✅ Prevented
```php
// Always check ownership
$collection = Collection::where('id', $id)
    ->where('collected_by', $user->id)
    ->firstOrFail();
```

## Mobile App Security

### Local Data Security

**Secure Storage**:
```typescript
// Use SecureStore for sensitive data
import * as SecureStore from 'expo-secure-store';

// Store
await SecureStore.setItemAsync('key', 'value');

// Retrieve
const value = await SecureStore.getItemAsync('key');
```

**SQLite Encryption**:
```typescript
// Use SQLCipher for encrypted SQLite
// Or implement encryption layer
```

### Network Security

**Certificate Pinning** (Production):
```typescript
// Validate server certificate
// Prevent MITM attacks
```

**Network Security Config** (Android):
```xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.paymaster.com</domain>
    </domain-config>
</network-security-config>
```

### Code Security

**No Hardcoded Secrets**:
```typescript
// Bad
const API_KEY = 'secret123';

// Good
const API_KEY = process.env.API_KEY;
```

**Obfuscation** (Production):
- Enable ProGuard (Android)
- Code obfuscation tools
- Remove debug logs

## Security Checklist

### Development
- [ ] All passwords hashed with bcrypt
- [ ] Input validation on all endpoints
- [ ] Output escaping in views
- [ ] CSRF protection enabled
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention measures
- [ ] Rate limiting configured
- [ ] Audit logging implemented

### Production
- [ ] HTTPS/TLS enabled and enforced
- [ ] Strong SSL/TLS configuration (A+ rating)
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] File permissions set correctly
- [ ] Debug mode disabled
- [ ] Error messages don't leak sensitive info
- [ ] Regular security updates
- [ ] Dependency vulnerability scanning
- [ ] Backup encryption
- [ ] Monitoring and alerting configured

### Mobile App
- [ ] Secure storage for tokens
- [ ] Certificate pinning (optional but recommended)
- [ ] Code obfuscation enabled
- [ ] No hardcoded secrets
- [ ] Proper error handling (no sensitive data exposure)
- [ ] Network security configured
- [ ] App permissions minimal and justified

## Security Headers

### Recommended Headers

```
# Prevent clickjacking
X-Frame-Options: DENY

# XSS protection
X-XSS-Protection: 1; mode=block

# Content type sniffing
X-Content-Type-Options: nosniff

# Referrer policy
Referrer-Policy: strict-origin-when-cross-origin

# Content Security Policy
Content-Security-Policy: default-src 'self'; script-src 'self'

# HTTPS enforcement
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Incident Response

### Security Incident Procedures

1. **Detection**: Monitor logs and alerts
2. **Containment**: Isolate affected systems
3. **Investigation**: Determine scope and impact
4. **Remediation**: Fix vulnerability
5. **Recovery**: Restore services
6. **Post-Incident**: Review and improve

### Security Contacts

- Security Team: security@paymaster.com
- Emergency: +XX XXX XXX XXXX

## Security Updates

### Update Policy

- Security patches: Immediately
- Minor updates: Monthly
- Major updates: Quarterly

### Vulnerability Disclosure

Report security vulnerabilities to: security@paymaster.com

**Please do not**:
- Publish vulnerabilities publicly before fix
- Test on production systems
- Access user data

## Compliance

### Data Protection

- GDPR compliance (if applicable)
- Data encryption requirements
- User consent management
- Right to be forgotten
- Data portability

### Industry Standards

- OWASP Top 10 compliance
- PCI DSS (if handling card data)
- ISO 27001 guidelines

## Security Training

### Developer Training

- Secure coding practices
- OWASP Top 10 awareness
- Input validation techniques
- Authentication/Authorization best practices
- Secure API design

### User Training

- Strong password creation
- Phishing awareness
- Device security
- Account security

## Monitoring and Alerting

### Security Monitoring

**Monitor**:
- Failed login attempts
- Authorization failures
- Unusual data access patterns
- Abnormal API usage
- System errors

**Alert On**:
- Multiple failed login attempts
- Privilege escalation attempts
- Data exfiltration patterns
- Suspected attacks
- System compromises

## Conclusion

Security is an ongoing process. Regular reviews, updates, and monitoring are essential to maintain a secure application.

**Remember**: Security is everyone's responsibility.
