# CollectPay TODO List

## High Priority

### Conflict Resolution Improvements
- [ ] Enhance conflict resolution logic in `backend/app/Http/Controllers/Api/SyncController.php`
  - Change version comparison from `>=` to `>` to handle equal versions properly
  - Prevent data staleness when versions are equal
  
- [ ] Add user notification for conflicts in `frontend/src/services/sync.ts`
  - Replace console.warn with proper UI notification
  - Show conflict details to user
  - Allow user to choose resolution strategy
  - Store conflict history for review

### Data Consistency
- [ ] Standardize amount calculation logic
  - Extract calculation to shared utility function
  - Ensure same rounding logic in frontend and backend
  - Add tests for floating-point precision
  
- [ ] Fix type inconsistency in foreign keys
  - Standardize foreign key types (use strings or numbers consistently)
  - Update `frontend/src/models/schema.ts` to use number types
  - Ensure proper type conversion during sync

## Medium Priority

### Testing
- [ ] Add unit tests for backend
  - Controller tests
  - Model tests
  - Middleware tests
  - Sync logic tests
  
- [ ] Add unit tests for frontend
  - Component tests
  - Service tests
  - Context tests
  - Sync tests

- [ ] Add integration tests
  - API endpoint tests
  - Sync flow tests
  - Authentication tests

- [ ] Add E2E tests
  - User flow tests
  - Offline mode tests
  - Sync tests

### Features
- [ ] Two-factor authentication (2FA)
  - SMS-based 2FA
  - TOTP-based 2FA
  - Backup codes
  
- [ ] Biometric authentication
  - Fingerprint
  - Face ID / Face recognition
  
- [ ] Photo attachments for collections
  - Camera integration
  - Image compression
  - Offline storage
  - Image sync
  
- [ ] Geolocation tracking
  - Record GPS coordinates with collections
  - Map view of collection locations
  - Offline map support
  
- [ ] Push notifications
  - Sync completion notifications
  - Payment reminders
  - New rate notifications
  
- [ ] Export functionality
  - PDF reports
  - Excel exports
  - CSV exports
  - Email reports

### UI/UX Improvements
- [ ] Advanced conflict resolution UI
  - Side-by-side comparison
  - Field-level merge
  - Conflict history
  
- [ ] Dashboard enhancements
  - Charts and graphs
  - Analytics
  - Performance metrics
  
- [ ] Search and filter improvements
  - Advanced search
  - Saved filters
  - Quick filters
  
- [ ] Bulk operations
  - Bulk collection entry
  - Bulk payment entry
  - Bulk updates

## Low Priority

### Optimization
- [ ] Query optimization
  - Add more database indexes
  - Optimize eager loading
  - Cache frequently accessed data
  
- [ ] Mobile app optimization
  - Reduce bundle size
  - Lazy loading
  - Image optimization
  
- [ ] Background sync
  - Periodic background sync
  - Smart sync scheduling
  - Batch processing

### Documentation
- [ ] Video tutorials
  - Setup guide
  - User guide
  - Developer guide
  
- [ ] API documentation improvements
  - OpenAPI/Swagger spec
  - Interactive API docs
  - More examples
  
- [ ] User documentation
  - In-app help
  - FAQ section
  - Troubleshooting guide

### Integrations
- [ ] Payment gateway integration
  - Stripe
  - PayPal
  - Local payment methods
  
- [ ] Accounting software integration
  - QuickBooks
  - Xero
  - Wave
  
- [ ] SMS notifications
  - Twilio integration
  - Message templates
  
- [ ] Email notifications
  - SendGrid integration
  - Email templates

### Security Enhancements
- [ ] Audit logging
  - User action logs
  - Data change logs
  - Security event logs
  
- [ ] Advanced ABAC
  - Time-based permissions
  - Location-based permissions
  - Conditional permissions
  
- [ ] Data encryption at rest
  - Database encryption
  - File encryption
  
- [ ] Security scanning
  - Dependency vulnerability scanning
  - SAST (Static Application Security Testing)
  - DAST (Dynamic Application Security Testing)

### DevOps
- [ ] CI/CD pipeline
  - Automated testing
  - Automated deployment
  - Automated rollback
  
- [ ] Monitoring
  - Application monitoring
  - Error tracking (Sentry)
  - Performance monitoring
  - Uptime monitoring
  
- [ ] Backup automation
  - Automated database backups
  - Backup verification
  - Disaster recovery plan

## Future Considerations

- [ ] Multi-language support (i18n)
- [ ] Multi-currency support
- [ ] Custom fields/attributes
- [ ] Workflow automation
- [ ] API webhooks
- [ ] GraphQL API
- [ ] Real-time updates (WebSockets)
- [ ] Desktop application
- [ ] Tablet optimization
- [ ] Offline maps
- [ ] Voice input
- [ ] Barcode/QR scanning
- [ ] Receipt printing
- [ ] Hardware integration (scales, printers)

## Known Issues

None reported yet. Please check the GitHub Issues page for the latest.

## Code Review Follow-ups

From the latest code review:
1. ✅ Model organization - Fixed by splitting models
2. ✅ Import paths - Fixed all import references
3. ✅ Babel decorators - Updated to modern syntax
4. 🔄 Conflict resolution logic - Needs enhancement (High Priority)
5. 🔄 User conflict notification - Needs implementation (High Priority)
6. 🔄 Amount calculation consistency - Needs standardization (High Priority)
7. 🔄 Foreign key type consistency - Needs fixing (High Priority)

---

**Last Updated**: 2024-12-22  
**Version**: 1.0.0

To contribute to any of these items, please:
1. Check the GitHub Issues to see if it's already being worked on
2. Create a new issue or comment on existing one
3. Fork the repository and create a feature branch
4. Submit a pull request with your changes
