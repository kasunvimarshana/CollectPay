# Collectix Installation Guide

This guide will help you set up Collectix on your local development environment or production server.

## System Requirements

### Backend Requirements
- PHP 8.2 or higher
- Composer 2.x
- MySQL 8.0+ or PostgreSQL 13+
- PHP Extensions:
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - JSON
  - BCMath
  - Ctype
  - Fileinfo

### Frontend Requirements
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Expo CLI (optional but recommended)
- iOS/Android device or emulator

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/kasunvimarshana/Collectix.git
cd Collectix
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
composer install
```

#### Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
APP_NAME=Collectix
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=collectix
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### Generate Application Key

```bash
php artisan key:generate
```

#### Create Database

Create a database named `collectix` in your MySQL/PostgreSQL server:

```sql
CREATE DATABASE collectix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Run Migrations

```bash
php artisan migrate
```

#### Seed Sample Data (Optional)

```bash
php artisan db:seed
```

This will create sample users:
- Admin: admin@collectix.test / password
- Collector: collector@collectix.test / password
- Finance: finance@collectix.test / password
- Manager: manager@collectix.test / password

#### Start Development Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Environment Configuration

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

**Note**: For Android emulator, use `http://10.0.2.2:8000/api`

#### Start Expo

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (macOS only)
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your phone

## Testing the Installation

### Test Backend API

1. Open a browser or Postman
2. Navigate to `http://localhost:8000/api/login`
3. Send a POST request with:
```json
{
  "email": "admin@collectix.test",
  "password": "password"
}
```

### Test Frontend

1. Start the frontend with `npm start`
2. Open the app on your device
3. Login with admin credentials
4. Navigate through the menu

## Common Issues

### Issue: PHP Extensions Missing

**Solution**: Install required extensions

Ubuntu/Debian:
```bash
sudo apt-get install php8.2-mbstring php8.2-xml php8.2-mysql
```

### Issue: Composer Memory Limit

**Solution**: Increase memory limit
```bash
php -d memory_limit=-1 $(which composer) install
```

### Issue: Database Connection Failed

**Solution**: 
1. Verify MySQL/PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists

### Issue: Cannot Connect to API from Mobile

**Solution**:
1. Make sure backend server is running
2. Use correct IP address (not localhost)
3. For Android emulator: use `10.0.2.2` instead of `localhost`
4. For physical device: use computer's local IP (e.g., `192.168.1.100`)

### Issue: CORS Errors

**Solution**: The backend is already configured for CORS. If issues persist:
1. Check `config/cors.php`
2. Ensure API URL in frontend matches backend
3. Clear cache: `php artisan config:clear`

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## Support

For issues or questions:
1. Check the [README.md](README.md)
2. Review documentation files (PRD.md, SRS.md)
3. Create an issue on GitHub

## Security Note

**Important**: Change default passwords and update `.env` configuration for production use. Never commit `.env` files to version control.
