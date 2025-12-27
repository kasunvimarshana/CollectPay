# TrackVault Security Guide

## Security Overview

TrackVault implements multiple layers of security to protect sensitive data and ensure system integrity.

## Security Architecture

```
┌─────────────────────────────────────────┐
│         External Threats                │
├─────────────────────────────────────────┤
│  1. Network Security (HTTPS/TLS)        │
├─────────────────────────────────────────┤
│  2. API Gateway (Rate Limiting, CORS)   │
├─────────────────────────────────────────┤
│  3. Authentication (JWT)                 │
├─────────────────────────────────────────┤
│  4. Authorization (RBAC/ABAC)            │
├─────────────────────────────────────────┤
│  5. Input Validation                     │
├─────────────────────────────────────────┤
│  6. Application Logic                    │
├─────────────────────────────────────────┤
│  7. Data Encryption (at rest & transit)  │
├─────────────────────────────────────────┤
│  8. Database (Encrypted, Access Control) │
└─────────────────────────────────────────┘
```

## Authentication

### JWT Implementation

**Token Generation**:
```php
$token = $jwtService->generateToken([
    'user_id' => $user->getId()->toString(),
    'email' => $user->getEmail()->toString(),
    'roles' => $user->getRoles(),
    'permissions' => $user->getPermissions(),
]);
```

**Token Structure**:
```
Header.Payload.Signature
```

**Token Expiry**:
- Access Token: 1 hour
- Refresh Token: 7 days

### Password Security

**Hashing Algorithm**: Argon2id
```php
$hashedPassword = $passwordHashService->hash($password);
// Uses Argon2id with:
// - Memory cost: 65536 KB
// - Time cost: 4 iterations
// - Threads: 3
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Management

- **Stateless**: JWT tokens (no server-side sessions)
- **Token Storage**: 
  - Frontend: Secure storage (expo-secure-store)
  - Never in localStorage or cookies without httpOnly flag

## Authorization

### Role-Based Access Control (RBAC)

**Predefined Roles**:
- `admin`: Full system access
- `manager`: Read all, create collections/payments
- `collector`: Create collections, view suppliers/products
- `viewer`: Read-only access

**Role Hierarchy**:
```
admin > manager > collector > viewer
```

### Attribute-Based Access Control (ABAC)

**Permissions**:
- `users:create`, `users:read`, `users:update`, `users:delete`
- `suppliers:create`, `suppliers:read`, `suppliers:update`, `suppliers:delete`
- `products:create`, `products:read`, `products:update`, `products:delete`
- `collections:create`, `collections:read`, `collections:update`, `collections:delete`
- `payments:create`, `payments:read`, `payments:update`, `payments:delete`

**Permission Check**:
```php
if (!$user->hasPermission('collections:create')) {
    throw new ForbiddenException('Insufficient permissions');
}
```

## Data Encryption

### Encryption at Rest

**Algorithm**: AES-256-GCM

**Implementation**:
```php
$encryptionService = new EncryptionService($encryptionKey);
$encrypted = $encryptionService->encrypt($sensitiveData);
$decrypted = $encryptionService->decrypt($encrypted);
```

**Encrypted Fields**:
- Payment card details (if stored)
- Bank account numbers
- Tax IDs
- Personal identification numbers

### Encryption in Transit

**Requirements**:
- HTTPS/TLS 1.2 or higher
- Strong cipher suites
- Certificate from trusted CA

**nginx Configuration**:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers off;
```

## Input Validation

### Backend Validation

**Sanitization**:
```php
$name = filter_var($input['name'], FILTER_SANITIZE_STRING);
$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
```

**Validation Rules**:
- Email: Valid email format
- Phone: Valid phone format
- Numbers: Type checking, range validation
- Strings: Length limits, character whitelist
- Dates: Valid date format, range checks

### Frontend Validation

**Email Validation**:
```typescript
const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
```

**Form Validation**:
- Required field checks
- Format validation
- Range validation
- Custom business rules

## SQL Injection Prevention

**Use Prepared Statements**:
```php
$stmt = $connection->prepare(
    'SELECT * FROM users WHERE email = :email'
);
$stmt->execute(['email' => $email]);
```

**Never**:
```php
// DON'T DO THIS!
$query = "SELECT * FROM users WHERE email = '$email'";
```

## XSS Prevention

**Output Escaping**:
```php
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');
```

**Content Security Policy**:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';";
```

## CSRF Protection

**Token-Based Protection**:
- JWT tokens are immune to CSRF (when not in cookies)
- Use custom headers for API requests
- Validate Origin/Referer headers

## API Security

### Rate Limiting

**Implementation**:
```php
// Allow 1000 requests per hour per IP
$rateLimit = new RateLimiter(1000, 3600);
if (!$rateLimit->check($ipAddress)) {
    throw new TooManyRequestsException();
}
```

**Limits**:
- Authenticated: 1000 requests/hour
- Anonymous: 100 requests/hour
- Login endpoint: 5 attempts/15 minutes

### CORS Configuration

**Allowed Origins**:
```php
$allowedOrigins = [
    'https://yourdomain.com',
    'https://app.yourdomain.com'
];
```

**Headers**:
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### API Key Management

**Environment Variables**:
```bash
# Never commit these to git!
JWT_SECRET=your-secure-random-string-minimum-32-characters
ENCRYPTION_KEY=exactly-32-characters-for-aes256
DB_PASSWORD=strong-database-password
```

**Key Rotation**:
- Rotate JWT secret every 90 days
- Rotate encryption key annually
- Update all affected tokens/data

## Database Security

### Access Control

**Principle of Least Privilege**:
```sql
-- Application user (limited permissions)
GRANT SELECT, INSERT, UPDATE, DELETE ON trackvault.* TO 'app_user'@'localhost';

-- Read-only user (for reporting)
GRANT SELECT ON trackvault.* TO 'readonly_user'@'localhost';
```

### Connection Security

**SSL/TLS Connection**:
```php
$dsn = "mysql:host=localhost;dbname=trackvault;charset=utf8mb4";
$options = [
    PDO::MYSQL_ATTR_SSL_CA => '/path/to/ca-cert.pem',
    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
];
$pdo = new PDO($dsn, $user, $password, $options);
```

### Backup Encryption

**Encrypted Backups**:
```bash
# Backup with encryption
mysqldump trackvault | gpg --encrypt --recipient admin@yourdomain.com > backup.sql.gpg

# Restore
gpg --decrypt backup.sql.gpg | mysql trackvault
```

## Audit Logging

### What to Log

**Security Events**:
- Login attempts (success/failure)
- Permission denials
- Data modifications
- Administrative actions
- API access
- Error conditions

**Audit Log Entry**:
```json
{
  "timestamp": "2025-12-27T10:00:00Z",
  "user_id": "uuid",
  "action": "UPDATE",
  "entity_type": "Payment",
  "entity_id": "uuid",
  "changes": {"amount": {"old": 1000, "new": 1500}},
  "ip_address": "192.168.1.100",
  "user_agent": "TrackVault Mobile/1.0"
}
```

### Log Storage

- **Retention**: Minimum 1 year
- **Protection**: Read-only for application
- **Backup**: Regular backups
- **Review**: Regular security audits

## Mobile App Security

### Secure Storage

**Expo SecureStore**:
```typescript
import * as SecureStore from 'expo-secure-store';

// Store token
await SecureStore.setItemAsync('auth_token', token);

// Retrieve token
const token = await SecureStore.getItemAsync('auth_token');
```

### Certificate Pinning

```typescript
// Validate server certificate
const trustedCertificates = [
  'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
];
```

### Biometric Authentication

```typescript
import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access TrackVault',
    fallbackLabel: 'Use passcode',
  });
  return result.success;
};
```

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] HTTPS configured with valid certificate
- [ ] Strong JWT secret (32+ characters)
- [ ] Strong encryption key (32 characters)
- [ ] Database user has minimal permissions
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging enabled
- [ ] Regular backups configured

### Post-Deployment

- [ ] Security headers configured
- [ ] SSL/TLS certificate valid
- [ ] Firewall rules configured
- [ ] Monitoring and alerting active
- [ ] Regular security updates scheduled
- [ ] Incident response plan in place

## Vulnerability Management

### Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update PHP packages
composer update

# Update Node packages
npm audit fix
```

### Security Scanning

**Backend**:
```bash
# PHP security checker
composer require --dev sensiolabs/security-checker
./vendor/bin/security-checker security:check composer.lock
```

**Frontend**:
```bash
# npm audit
npm audit

# Fix vulnerabilities
npm audit fix
```

## Incident Response

### Security Incident Procedure

1. **Detect**: Monitor logs and alerts
2. **Contain**: Isolate affected systems
3. **Investigate**: Analyze logs and determine scope
4. **Remediate**: Fix vulnerabilities
5. **Recover**: Restore services
6. **Learn**: Update procedures and security measures

### Contact Information

**Security Team**:
- Email: security@yourdomain.com
- Emergency: +1-XXX-XXX-XXXX

## Compliance

### Data Protection

- **GDPR**: User data rights, consent, erasure
- **PCI-DSS**: If handling payment cards
- **SOC 2**: Security controls and auditing

### Data Retention

- **User Data**: Keep while account active + 30 days
- **Audit Logs**: Minimum 1 year
- **Financial Records**: 7 years (regulatory requirement)

## Security Training

### For Developers

- Secure coding practices
- OWASP Top 10
- Authentication and authorization
- Input validation
- Encryption best practices

### For Users

- Strong password guidelines
- Phishing awareness
- Two-factor authentication
- Device security

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [PHP Security Guide](https://www.php.net/manual/en/security.php)

## Security Contact

For security issues, please email: security@yourdomain.com

**PGP Key**: Available at keyserver.ubuntu.com
