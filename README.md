"# PayTrack - Complete Data Collection & Payment Management System

## Overview

PayTrack is a production-ready, offline-first data collection and payment management application with React Native (Expo) frontend and Laravel backend. The system provides seamless operation across all network conditions with automatic synchronization, conflict resolution, and zero data loss.

## Architecture

### Backend (Laravel)
- **Clean Architecture** with separation of concerns
- **RESTful API** with versioning (v1)
- **Authentication**: Laravel Sanctum (Bearer tokens)
- **Authorization**: RBAC (Role-Based) + ABAC (Attribute-Based)
- **Database**: MySQL with migrations
- **Sync Engine**: Bidirectional sync with conflict resolution
- **Security**: Encrypted data, validated inputs, transactional operations

### Frontend (React Native/Expo)
- **Offline-First**: SQLite for local data storage
- **Auto-Sync**: Event-driven synchronization
- **State Management**: React Query + Context API
- **Network Monitoring**: Automatic network detection
- **Secure Storage**: Expo SecureStore for tokens
- **Clean Architecture**: Services, repositories, hooks pattern

## Features

### Core Functionality
1. **Supplier Management** - Full CRUD with balance tracking
2. **Product Management** - Catalog with units and categories
3. **Rate Management** - Time-based versioned rates with history
4. **Collection Tracking** - Daily records with auto-calculations
5. **Payment Processing** - Multiple types with auto-allocation

### Sync & Offline Features
- **Online-First** with offline fallback
- **Auto-Sync Triggers**: Network regain, app foreground, authentication
- **Manual Sync**: User-triggered with status indicators
- **Conflict Resolution**: Version-based with server-wins strategy
- **Idempotent Operations**: No data duplication
- **Optimized Sync**: Minimal data transfer

## Quick Start

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup
```bash
cd frontend
npm install
echo "EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env
npx expo start
```

## Documentation

- [Backend API Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [API Endpoints](docs/API.md)
- [Sync Strategy](docs/SYNC.md)
- [Security Guide](docs/SECURITY.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Technology Stack

**Backend**: Laravel 10, MySQL, Sanctum  
**Frontend**: React Native (Expo 50), SQLite, Axios  
**All Open Source & LTS**

## License

MIT" 
