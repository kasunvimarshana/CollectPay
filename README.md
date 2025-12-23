"# TransacTrack

A comprehensive, secure, and production-ready data collection and payment management application for field workers operating in rural or low-connectivity environments.

## Features

### Core Functionality
- **Supplier Management**: Detailed supplier profiles with contact information, location, and metadata
- **Product Collection Tracking**: Record product details with multiple units (grams, kilograms, liters, milliliters)
- **Payment Management**: Handle advance payments, partial payments, and full settlements
- **Product Rate Management**: Version-controlled pricing with time-based rates
- **Financial Calculations**: Automated, transparent payment calculations

### Architecture & Technical Features
- **Offline-First Design**: Uninterrupted data entry without connectivity
- **Automatic Synchronization**: Reliable sync with centralized database when online
- **Multi-User/Multi-Device Support**: Concurrent operations with conflict resolution
- **Security First**: Encrypted data, secure transactions, comprehensive authentication
- **RBAC & ABAC**: Role-Based and Attribute-Based Access Control
- **Audit Logging**: Complete audit trail for all operations
- **Clean Code**: SOLID principles, DRY guidelines, minimal dependencies

## Technology Stack

### Backend
- **Framework**: Laravel 11.x
- **Database**: SQLite (development), MySQL/PostgreSQL (production)
- **Authentication**: Laravel Sanctum (Token-based API authentication)
- **API**: RESTful API with comprehensive endpoints

### Frontend (to be implemented)
- **Framework**: React Native with Expo
- **Offline Storage**: SQLite for local data persistence
- **State Management**: React Context/Redux
- **Network Monitoring**: Built-in connectivity detection

## Project Structure

```
TransacTrack/
├── backend/                 # Laravel backend API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/    # API Controllers
│   │   │   └── Middleware/ # RBAC, ABAC middleware
│   │   ├── Models/         # Eloquent models
│   │   └── Services/       # Business logic services
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/        # Database seeders
│   ├── routes/
│   │   └── api.php         # API routes
│   └── config/             # Configuration files
└── frontend/               # React Native frontend (TBD)
```

## Installation

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/kasunvimarshana/TransacTrack.git
cd TransacTrack/backend
```

2. **Install dependencies**
```bash
composer install
```

3. **Environment configuration**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Database setup**
```bash
# For SQLite (development)
touch database/database.sqlite
php artisan migrate
```

5. **Start the development server**
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Documentation

See the comprehensive API documentation in the [docs/API.md](docs/API.md) file.

## Security Features

### Authentication
- Token-based authentication using Laravel Sanctum
- Secure password hashing with bcrypt
- Device-specific tokens for multi-device support

### Authorization
- **RBAC**: Role-based access control with roles: admin, manager, collector, viewer
- **ABAC**: Attribute-based access control for fine-grained permissions

### Data Security
- Encrypted sensitive data
- SQL injection protection via Eloquent ORM
- Audit logging for all operations

## User Roles

- **Admin**: Full system access, user management, rate management
- **Manager**: Supplier management, payment processing, report viewing
- **Collector**: Collection entry, supplier viewing
- **Viewer**: Read-only access to reports and data

## License

This project is open-source and available under the MIT License." 
