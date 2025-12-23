"# SyncCollect

A comprehensive, secure, and production-ready data collection and payment management application with React Native (Expo) frontend and Laravel backend.

## Features

### Core Functionality
- **Online-First Architecture**: Real-time remote persistence with robust offline support
- **Seamless Synchronization**: Automatic sync when connectivity is restored
- **Supplier Management**: Complete CRUD operations for supplier records
- **Product Management**: Multi-unit quantity tracking with time-based rates
- **Payment Processing**: Advance, partial, and full payment support
- **Transaction History**: Complete audit trail of all operations
- **Multi-Device Support**: Concurrent access with conflict resolution

### Security
- **Authentication**: JWT-based token authentication
- **Authorization**: RBAC and ABAC implementations
- **Encrypted Storage**: Secure local data storage
- **Encrypted Transmission**: HTTPS/TLS for API communication
- **Audit Logging**: Complete operation tracking

### Technical Excellence
- **Clean Architecture**: SOLID principles and DRY guidelines
- **Type Safety**: TypeScript frontend, strong typing in Laravel
- **Offline Support**: Local SQLite database with sync queue
- **Network Monitoring**: Real-time connectivity status
- **Conflict Resolution**: Deterministic conflict detection and resolution

## Project Structure

```
SyncCollect/
├── backend/          # Laravel API backend
├── frontend/         # React Native (Expo) mobile app
├── docs/            # Documentation
└── README.md        # This file
```

## Prerequisites

- PHP 8.3+
- Composer 2.9+
- Node.js 20+
- npm 10+
- MySQL/PostgreSQL (for production) or SQLite (for development)

## Getting Started

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
   php artisan key:generate
   ```

4. Run migrations:
   ```bash
   php artisan migrate
   ```

5. Start development server:
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API endpoint:
   ```bash
   # Create .env file with your backend URL
   echo "EXPO_PUBLIC_API_URL=http://localhost:8000/api" > .env
   ```

4. Start development server:
   ```bash
   npm start
   ```

## Development

### Running Tests

#### Backend Tests
```bash
cd backend
php artisan test
```

#### Frontend Tests
```bash
cd frontend
npm test
```

### Code Style

#### Backend (Laravel Pint)
```bash
cd backend
./vendor/bin/pint
```

#### Frontend (ESLint)
```bash
cd frontend
npm run lint
```

## Architecture

### Backend Architecture
- **Framework**: Laravel 12 (LTS)
- **Authentication**: Laravel Sanctum
- **Database**: MySQL/PostgreSQL/SQLite
- **Queue**: Laravel Queue for background jobs
- **API**: RESTful API with versioning

### Frontend Architecture
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context API / Redux
- **Local Storage**: SQLite with expo-sqlite
- **Network**: Axios with interceptors
- **Navigation**: React Navigation

### Synchronization Strategy
1. **Optimistic UI**: Immediate UI updates for better UX
2. **Offline Queue**: Local queue for pending operations
3. **Background Sync**: Automatic sync when online
4. **Conflict Detection**: Timestamp and version-based
5. **Conflict Resolution**: Last-write-wins with user override option

## API Documentation

API documentation will be available at `/api/documentation` when the backend server is running.

## License

This project is open-source and available under the MIT License.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## Support

For issues and questions, please create an issue in the GitHub repository." 
