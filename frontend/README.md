# PayTrack Mobile App

## React Native (Expo) Frontend for PayTrack

### Features
- **Offline-First Architecture** with SQLite
- **Auto-Sync** with manual sync option
- **Secure Authentication** with token storage
- **Clean UI** optimized for field use
- **Network Monitoring** with status indicators
- **Multi-Device Support** with conflict resolution

## Requirements
- Node.js 18+ (LTS)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Configuration

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://your-backend-server:8000/api/v1
```

For local development:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

For Android emulator accessing localhost:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
```

## Project Structure

```
frontend/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   ├── auth/              # Authentication screens
│   ├── suppliers/         # Supplier management
│   ├── products/          # Product management
│   ├── collections/       # Collection tracking
│   └── payments/          # Payment processing
├── components/            # Reusable UI components
├── services/              # API and business logic
│   ├── api.ts            # API client
│   └── syncService.ts    # Sync service
├── database/              # SQLite configuration
│   └── index.ts          # Database setup
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
└── types/                 # TypeScript definitions
```

## Key Services

### API Service (`services/api.ts`)
- HTTP client with Axios
- Token management
- Request/response interceptors
- All API endpoint methods

### Sync Service (`services/syncService.ts`)
- Offline-first sync engine
- Network monitoring
- Conflict resolution
- Sync queue management
- Event-driven auto-sync

### Database (`database/index.ts`)
- SQLite initialization
- Table creation
- Data migrations
- Query helpers

## Offline-First Strategy

### Data Flow
1. **Online**: Direct API call → Server → Response → Local cache
2. **Offline**: Local SQLite → Sync queue → Wait for network
3. **Sync**: Queue → Batch push → Conflict resolution → Pull changes

### Sync Triggers
- Network connectivity restored (automatic)
- App returns to foreground (automatic)
- User authentication (automatic)
- Manual sync button (user-triggered)

### Conflict Resolution
- Version-based detection
- Server-wins strategy (default)
- User notified of conflicts
- Local data updated with server version

## Security

### Data Security
- **Secure Storage**: Expo SecureStore for tokens
- **Encrypted SQLite**: Data encrypted at rest
- **HTTPS**: All API calls over TLS
- **Token Auth**: Bearer token authentication

### Best Practices
- Never store passwords locally
- Tokens auto-refresh
- Automatic logout on token expiry
- Input validation on forms

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Building for Production

#### Android
```bash
npx expo build:android
# or with EAS
eas build --platform android
```

#### iOS
```bash
npx expo build:ios
# or with EAS
eas build --platform ios
```

## Features Implementation Status

✅ **Completed**
- [x] Authentication (Login/Register/Logout)
- [x] Offline SQLite database
- [x] API service layer
- [x] Sync service with auto-sync
- [x] Network monitoring
- [x] Secure token storage

🚧 **In Progress**
- [ ] UI Components
- [ ] Navigation structure
- [ ] Supplier screens
- [ ] Product screens
- [ ] Collection screens
- [ ] Payment screens
- [ ] Sync status screen

📋 **Planned**
- [ ] Dashboard with statistics
- [ ] Reports and analytics
- [ ] Settings screen
- [ ] Profile management
- [ ] Export functionality
- [ ] Biometric authentication
- [ ] Push notifications

## Troubleshooting

### Cannot connect to backend
- Check API URL in `.env`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- Ensure backend server is running
- Check network connectivity

### Sync not working
- Check internet connection
- Verify authentication token is valid
- Check sync queue for errors
- Review sync logs in console

### Database errors
- Clear app data and reinstall
- Check database migrations
- Verify SQLite compatibility

## Performance Tips

1. **Optimize Re-renders**: Use React.memo for expensive components
2. **Lazy Loading**: Load screens on demand
3. **Image Optimization**: Use optimized images
4. **Debounce Inputs**: Debounce search and form inputs
5. **Pagination**: Implement infinite scroll for large lists

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## Support

For issues and questions:
- GitHub Issues
- Email: support@paytrack.com

## License

MIT
