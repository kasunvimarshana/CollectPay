"# TransacTrack

A comprehensive, secure, and production-ready data collection and payment management system designed for field workers operating in rural or low-connectivity environments.

## Overview

TransacTrack is a full-stack application consisting of:
- **Backend**: Laravel REST API with robust security and sync mechanisms
- **Frontend**: React Native (Expo) mobile app with offline-first architecture

## Key Features

### Core Functionality
- **Supplier Management**: Detailed profiles with contact info, location, and metadata
- **Product Collection Tracking**: Multiple unit support (g, kg, ml, l)
- **Payment Management**: Advance, partial, and full payments with various methods
- **Dynamic Pricing**: Fluctuating rates with historical tracking
- **Automatic Calculations**: Transparent payment computation

### Offline-First Architecture
- **Network Monitoring**: Real-time connectivity detection
- **Local Storage**: Complete offline functionality
- **Automatic Sync**: Background synchronization when online
- **Conflict Resolution**: Robust multi-device conflict handling
- **Queue Management**: Pending operations tracked and synced

### Security
- **Authentication**: JWT-based authentication with Laravel Sanctum
- **Authorization**: RBAC (Role-Based Access Control)
- **Data Encryption**: Secure storage and transmission
- **Input Validation**: Comprehensive validation on both client and server
- **SQL Injection Protection**: Eloquent ORM with prepared statements
- **XSS Protection**: Built-in Laravel security features

### Architecture
- **Clean Code**: SOLID principles throughout
- **DRY**: No code duplication
- **Separation of Concerns**: Clear layer separation
- **Minimal Dependencies**: Only essential, LTS-supported libraries
- **Scalable Design**: Ready for growth

## Project Structure

```
TransacTrack/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/    # API controllers
│   │   ├── Models/         # Eloquent models
│   │   ├── Services/       # Business logic
│   │   └── Repositories/   # Data access layer
│   ├── config/             # Configuration files
│   ├── database/
│   │   └── migrations/     # Database schema
│   └── routes/
│       └── api.php         # API routes
│
├── mobile/                  # React Native app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── screens/        # Screen components
│   │   ├── services/       # API & sync services
│   │   ├── store/          # Redux state management
│   │   └── types/          # TypeScript types
│   └── App.tsx             # Main app component
│
└── README.md               # This file
```

## Getting Started

### Prerequisites

- **Backend**:
  - PHP >= 8.1
  - Composer
  - MySQL >= 5.7 or MariaDB >= 10.3

- **Frontend**:
  - Node.js >= 18
  - npm or yarn
  - Expo CLI

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run migrations:
```bash
php artisan migrate
```

5. Start server:
```bash
php artisan serve
```

API will be available at `http://localhost:8000`

See [backend/README.md](backend/README.md) for detailed instructions.

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:8000/api"
    }
  }
}
```

4. Start the app:
```bash
npm start
```

See [mobile/README.md](mobile/README.md) for detailed instructions.

## API Documentation

### Authentication Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get authenticated user

### Resource Endpoints

All resource endpoints follow RESTful conventions and require authentication:

- `/api/suppliers` - Supplier management
- `/api/products` - Product management
- `/api/collections` - Collection tracking
- `/api/payments` - Payment management

### Sync Endpoints

- `POST /api/sync` - Synchronize offline data
- `POST /api/sync/conflicts/{id}/resolve` - Resolve sync conflict

## Database Schema

### Core Tables

- **users**: System users with role-based access
- **suppliers**: Supplier profiles with location data
- **products**: Product catalog with unit types
- **product_rates**: Historical pricing data
- **collections**: Product collection records
- **payments**: Payment transactions
- **sync_conflicts**: Conflict tracking for sync

### Relationships

- User has many Collections, Payments
- Supplier has many Collections, Payments
- Product has many Collections, ProductRates
- Collection belongs to Supplier, Product, User
- Payment belongs to Supplier, User

## User Roles

- **Admin**: Full system access, user management
- **Manager**: View reports, manage suppliers/products
- **Collector**: Record collections and payments
- **Viewer**: Read-only access to data

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control
3. **Data Encryption**: Sensitive data encrypted at rest
4. **Secure Communication**: HTTPS in production
5. **Input Validation**: Both client and server validation
6. **SQL Injection**: Protected via ORM
7. **XSS**: Protected via output escaping
8. **CSRF**: Protected via Laravel middleware

## Offline-First Strategy

1. **Data Persistence**: Redux Persist with AsyncStorage
2. **Network Detection**: NetInfo for connectivity monitoring
3. **Queue Management**: Track pending operations
4. **Automatic Sync**: Background sync when online
5. **Conflict Resolution**: Version-based conflict detection
6. **Optimistic Updates**: Immediate UI updates with rollback

## Development Guidelines

### Code Style

- Follow PSR-12 for PHP
- Follow Airbnb style guide for TypeScript/React
- Use meaningful variable and function names
- Comment complex logic

### Git Workflow

1. Create feature branch from main
2. Make small, focused commits
3. Write descriptive commit messages
4. Submit pull request for review
5. Merge after approval

### Testing

- Write unit tests for business logic
- Write integration tests for API endpoints
- Test offline scenarios thoroughly
- Test sync conflicts and resolution

## Deployment

### Backend Deployment

1. Set up production server (Linux recommended)
2. Configure web server (Apache/Nginx)
3. Set up MySQL database
4. Configure SSL certificate
5. Set environment variables
6. Run migrations
7. Set up monitoring

### Mobile App Deployment

1. Configure production API URL
2. Build production bundles
3. Submit to App Store (iOS)
4. Submit to Play Store (Android)
5. Set up crash reporting
6. Monitor user feedback

## Performance Optimization

- Database indexing on frequently queried columns
- API response caching where appropriate
- Pagination for large datasets
- Lazy loading in mobile app
- Image optimization
- Minification and bundling

## Monitoring and Logging

- Error logging on backend
- User action tracking
- Sync success/failure rates
- API response times
- Database query performance
- Mobile app crash reports

## Troubleshooting

### Common Issues

1. **Sync not working**: Check network connectivity and API availability
2. **Login fails**: Verify credentials and API endpoint
3. **Data not saving offline**: Check Redux Persist configuration
4. **Conflicts not resolving**: Review conflict resolution logic

## Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Bulk data import/export
- [ ] Multi-language support
- [ ] Photo attachments for collections
- [ ] GPS tracking for collections
- [ ] Barcode scanning
- [ ] Biometric authentication

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@transactrack.com
- Documentation: https://docs.transactrack.com

## Acknowledgments

Built with:
- Laravel - PHP Framework
- React Native - Mobile Framework
- Expo - React Native Platform
- Redux - State Management
- Laravel Sanctum - Authentication" 
