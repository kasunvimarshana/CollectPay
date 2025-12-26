"# FieldLedger - Data Collection & Payment Management Application

A comprehensive, secure, and production-ready offline-first application for field data collection and payment management, built with React Native (Expo) and Laravel.

## 🚀 Features

### Core Functionality
- **Supplier Management**: Complete CRUD operations for supplier records
- **Product Management**: Multi-unit quantity tracking with base and alternate units
- **Transaction Recording**: Time-based rate tracking with automatic calculations
- **Payment Management**: Support for advance, partial, and full payments
- **Balance Tracking**: Real-time supplier balance calculations

### Offline-First Architecture
- **Primary Online Operation**: Backend as source of truth with real-time persistence
- **Automatic Offline Support**: Seamless fallback during network outages
- **Deterministic Synchronization**: Zero data loss with automatic sync on reconnection
- **Conflict Resolution**: Robust conflict detection and resolution mechanisms
- **Multi-Device Support**: Concurrent operations across multiple devices

### Security Features
- **Authentication**: Secure token-based authentication (Laravel Sanctum)
- **Authorization**: Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC)
- **Encrypted Storage**: Local data encryption using Expo SecureStore
- **Encrypted Transmission**: HTTPS/TLS for all API communications
- **Session Management**: Secure token management and automatic expiration

### Technical Architecture
- **Clean Code**: Adheres to SOLID principles and DRY guidelines
- **Minimal Dependencies**: Native implementations prioritized
- **Open Source**: Only free, LTS-supported libraries
- **Type Safety**: Full TypeScript implementation
- **Scalable Design**: Modular architecture for easy maintenance

## 📁 Project Structure

```
FieldLedger/
├── backend/                    # Laravel Backend API
│   ├── app/
│   │   ├── Models/            # Eloquent models
│   │   ├── Http/Controllers/  # API controllers
│   │   └── Services/          # Business logic layer
│   ├── database/
│   │   └── migrations/        # Database schema
│   └── routes/
│       └── api.php            # API routes
│
├── frontend/                   # React Native (Expo) Mobile App
│   ├── app/                   # Expo Router pages
│   │   ├── (auth)/           # Authentication screens
│   │   └── (tabs)/           # Main app screens
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── database/         # Local SQLite database
│   │   ├── services/         # Sync manager
│   │   ├── store/            # State management (Zustand)
│   │   └── types/            # TypeScript definitions
│   └── components/           # Reusable components
│
└── docs/                      # Documentation
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Laravel 11.x
- **Language**: PHP 8.2+
- **Database**: MySQL 8.0+ / MariaDB 10.3+
- **Authentication**: Laravel Sanctum
- **Architecture**: Repository pattern with service layer

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Local Database**: Expo SQLite
- **Secure Storage**: Expo SecureStore
- **Network Detection**: Expo Network
- **API Client**: Axios
- **Data Fetching**: TanStack Query (React Query)

## 📋 Prerequisites

### Backend
- PHP >= 8.2
- Composer
- MySQL >= 8.0 or MariaDB >= 10.3

### Frontend
- Node.js >= 18
- npm or yarn
- Expo CLI

## 🚀 Getting Started

### Backend Setup

1. Navigate to backend directory: `cd backend`
2. Install dependencies: `composer install`
3. Configure environment: `cp .env.example .env`
4. Generate key: `php artisan key:generate`
5. Run migrations: `php artisan migrate`
6. Start server: `php artisan serve`

### Frontend Setup

1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Configure API URL in `.env`
4. Start server: `npm start`

## 📖 API Documentation

See backend/README.md for detailed API documentation.

## 🔒 Security

- Token-based authentication (Laravel Sanctum)
- RBAC and ABAC authorization
- Encrypted local storage
- HTTPS/TLS for all communications
- Password hashing with bcrypt

## 📱 Offline Support

The application features robust offline-first architecture:
- Automatic network detection
- Local SQLite database
- Sync queue management
- Conflict resolution
- Zero data loss guarantee

## 📝 License

MIT License
" 
