# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in FieldLedger, please report it to:

- **Email**: security@fieldledger.com
- **GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature

Please do NOT create public GitHub issues for security vulnerabilities.

## What to Include

When reporting a security issue, please include:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)
5. Your contact information

## Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Based on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

## Security Features

### Authentication & Authorization
- JWT token-based authentication using Laravel Sanctum
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Token expiration and refresh
- Secure password hashing (bcrypt)

### Data Protection
- Encrypted data at rest (Expo SecureStore)
- Encrypted data in transit (HTTPS/TLS)
- SQL injection prevention (Eloquent ORM)
- XSS protection (Laravel built-in)
- CSRF protection

### Network Security
- API rate limiting
- CORS configuration
- Certificate pinning ready
- Secure headers

### Offline Security
- Local database encryption
- Secure token storage
- Automatic token cleanup
- Session management

## Best Practices

### For Users
1. Use strong passwords (minimum 8 characters)
2. Enable biometric authentication when available
3. Keep the app updated
4. Don't share credentials
5. Logout when not in use

### For Developers
1. Keep dependencies updated
2. Run security audits regularly
3. Follow OWASP guidelines
4. Implement proper input validation
5. Use prepared statements
6. Enable security headers
7. Log security events
8. Regular code reviews

## Compliance

- GDPR ready
- Data retention policies
- Privacy controls
- Audit logging
- User consent management

## Security Checklist

### Backend
- [x] JWT authentication
- [x] RBAC/ABAC implementation
- [x] Input validation
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection
- [x] Rate limiting ready
- [x] Audit logging schema
- [x] Password hashing
- [ ] API documentation security notes

### Frontend
- [x] Secure token storage
- [x] Encrypted local database
- [x] Network security
- [x] Session management
- [ ] Biometric authentication
- [ ] Certificate pinning
- [ ] Secure coding practices

## Known Security Considerations

1. **Offline Conflict Resolution**: Server-wins strategy by default
2. **Token Expiration**: Tokens expire after configured time
3. **Multi-Device Access**: Concurrent access supported with sync
4. **Data Backup**: Users should regularly sync to prevent data loss

## Security Updates

We release security patches as soon as possible. Users are notified via:
- In-app notifications
- Email alerts
- GitHub releases
- Security advisories

## Contact

For security-related inquiries:
- Email: security@fieldledger.com
- GitHub: Create a security advisory

---

Last Updated: 2024-01-01
