"# CollectPay

**Comprehensive Data Collection & Payment Management Application**

CollectPay is a production-ready, offline-first mobile application built with React Native (Expo) and Laravel backend, designed for tracking product collections from suppliers and managing associated payments. Perfect for field collectors, tea leaf collectors, or remote workers who need to work in areas with limited connectivity.

## 🌟 Features

### Core Functionality
- **Product Collection Tracking**: Record detailed information including product name, supplier, quantity (grams, kilograms, liters, milliliters), and responsible user
- **Payment Management**: Track advance payments, partial payments, and full payments with automatic calculation of amounts due
- **Rate Management**: Support for fluctuating rates based on supplier, product, and date
- **Automatic Calculations**: Real-time calculation of total amounts based on quantity, rate, and previous payments

### Offline-First Architecture
- **Local Data Storage**: Uses WatermelonDB for efficient local SQLite database
- **Offline Data Entry**: Full functionality without network connectivity
- **Automatic Sync**: Syncs data with central server when connectivity is restored
- **Conflict Resolution**: Robust version-based conflict resolution for multi-user scenarios

### Security & Access Control
- **Authentication**: Secure JWT-based authentication using Laravel Sanctum
- **Role-Based Access Control (RBAC)**: Three roles - Admin, Supervisor, Collector
- **Attribute-Based Access Control (ABAC)**: Fine-grained permissions system
- **Secure Token Storage**: Encrypted token storage using Expo SecureStore
- **Data Integrity**: Version tracking and validation to prevent data corruption

### Multi-User Support
- **Multi-Device Support**: Seamless operation across multiple devices
- **Real-Time Sync**: Automatic synchronization when online
- **Data Versioning**: Prevents data loss during simultaneous updates
- **User Management**: Admin and supervisor controls for team management

## 📁 Project Structure

```
CollectPay/
├── backend/                 # Laravel Backend API
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/     # API Controllers
│   │   └── Models/          # Eloquent Models
│   ├── database/
│   │   └── migrations/      # Database Migrations
│   ├── routes/
│   │   └── api.php          # API Routes
│   └── config/              # Configuration Files
│
└── frontend/                # React Native (Expo) Frontend
    ├── src/
    │   ├── components/      # Reusable Components
    │   ├── contexts/        # React Contexts (Auth, etc.)
    │   ├── models/          # WatermelonDB Models
    │   ├── screens/         # App Screens
    │   ├── services/        # API & Sync Services
    │   ├── types/           # TypeScript Types
    │   └── utils/           # Utility Functions
    ├── App.tsx              # Main App Entry Point
    └── app.json             # Expo Configuration
```

## 🚀 Getting Started

### Prerequisites

#### Backend Requirements
- PHP 8.2 or higher
- Composer
- MySQL/PostgreSQL
- Laravel 11.x

#### Frontend Requirements
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
composer install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Generate application key**
```bash
php artisan key:generate
```

5. **Run migrations**
```bash
php artisan migrate
```

6. **Start development server**
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Update API configuration**
Edit `src/services/api.ts` and update the `API_BASE_URL` if needed.

4. **Start Expo development server**
```bash
npm start
```

5. **Run on device/emulator**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## 🔐 Authentication & Authorization

### User Roles

1. **Admin**
   - Full system access
   - User management
   - Supplier and product management
   - Rate management
   - Delete capabilities

2. **Supervisor**
   - View all collections and payments
   - Create suppliers, products, and rates
   - Update data
   - Cannot delete

3. **Collector**
   - Create collections and payments
   - View own data only
   - Cannot manage suppliers, products, or rates

### Default Credentials

After running seeders (optional), you can create an admin user:

```bash
php artisan tinker
```

```php
User::create([
    'name' => 'Admin User',
    'email' => 'admin@collectpay.com',
    'password' => Hash::make('password'),
    'role' => 'admin',
    'is_active' => true,
]);
```

## 📱 Usage Guide

### Recording Collections

1. Login to the app
2. Tap "New Collection" on home screen
3. Select supplier and product
4. Enter quantity
5. Rate is automatically fetched (or enter manually)
6. Amount is calculated automatically
7. Add notes if needed
8. Save - data is stored locally immediately

### Managing Payments

1. Tap "New Payment" on home screen
2. Select supplier
3. Choose payment type (advance, partial, full)
4. Enter amount
5. Select payment method
6. Add reference number for tracking
7. Save - stored locally and will sync when online

### Syncing Data

1. Tap "Sync Data" button on home screen
2. App will upload pending collections and payments
3. Download updates from server
4. Resolve any conflicts automatically
5. View last sync time on home screen

## 🔄 Offline Sync Mechanism

### How It Works

1. **Local Storage**: All data is stored in WatermelonDB (SQLite)
2. **Client ID**: Each record gets a unique UUID for tracking
3. **Version Control**: Each record has a version number for conflict resolution
4. **Sync Process**:
   - Upload unsynced local changes to server
   - Server validates and processes changes
   - Handle conflicts (server version wins by default)
   - Download updates from server
   - Merge changes into local database

### Conflict Resolution

- Uses version numbers to detect conflicts
- Server version takes precedence by default
- Conflicts are logged and can be reviewed
- Future enhancement: Custom conflict resolution strategies

## 🏗️ Database Schema

### Key Tables

**users** - User accounts with roles and permissions
**suppliers** - Supplier information
**products** - Product definitions with units
**rates** - Product rates by date and supplier
**collections** - Product collection records
**payments** - Payment records
**sync_logs** - Sync history and conflict tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Get current user

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier (Admin/Supervisor)
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier (Admin only)

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (Admin/Supervisor)
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Collections
- `GET /api/collections` - List user's collections
- `POST /api/collections` - Create collection
- `PUT /api/collections/{id}` - Update collection
- `DELETE /api/collections/{id}` - Delete collection

### Payments
- `GET /api/payments` - List user's payments
- `POST /api/payments` - Create payment
- `GET /api/payments/summary` - Get payment summary
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

### Sync
- `POST /api/sync/collections` - Sync collections
- `POST /api/sync/payments` - Sync payments
- `POST /api/sync/updates` - Get server updates

## 🧪 Testing

### Backend Testing
```bash
cd backend
php artisan test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **HTTPS**: SSL/TLS for all API communications
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Eloquent ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Rate Limiting**: API rate limiting to prevent abuse

## 📊 Scalability Considerations

- **Database Indexing**: Strategic indexes for performance
- **Pagination**: All list endpoints support pagination
- **Caching**: Laravel cache for frequently accessed data
- **Queue Jobs**: Background processing for heavy operations
- **Database Optimization**: Efficient queries with eager loading
- **API Versioning**: Support for future API versions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For issues, questions, or contributions, please open an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Export reports (PDF, Excel)
- [ ] Advanced analytics and dashboards
- [ ] Push notifications for sync status
- [ ] Biometric authentication
- [ ] Multi-language support
- [ ] Advanced conflict resolution UI
- [ ] Bulk operations support
- [ ] Receipt generation
- [ ] Photo attachments for collections
- [ ] Geolocation tracking

## 📱 Use Cases

### Tea Leaf Collection
Ideal for tea leaf collectors who visit multiple suppliers daily:
- Record leaf weight from each supplier
- Track advance payments given
- Calculate final payments based on monthly rates
- Work offline in remote plantation areas
- Sync when back in coverage area

### Agricultural Collection
Track collection of various agricultural products:
- Multiple product types (vegetables, fruits, grains)
- Different units (kg, liters, etc.)
- Variable pricing based on quality/market rates
- Payment tracking per supplier

### Milk Collection
Perfect for milk collection centers:
- Daily milk collection from farmers
- Rate based on fat content
- Advance and periodic payments
- Offline operation in rural areas

---

**Built with ❤️ for field collectors and agricultural workers**" 
