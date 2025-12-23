import { DatabaseService } from './data/local/DatabaseService';
import { NetworkService } from './data/remote/NetworkService';
import { SyncService } from './data/repositories/SyncService';
import { AuthService } from './domain/usecases/AuthService';

export class App {
  private static instance: App;
  private initialized: boolean = false;

  private db: DatabaseService;
  private network: NetworkService;
  private sync: SyncService;
  private auth: AuthService;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.network = NetworkService.getInstance();
    this.sync = SyncService.getInstance();
    this.auth = AuthService.getInstance();
  }

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing CollectPay application...');

      // 1. Initialize local database
      console.log('Setting up local database...');
      await this.db.init();

      // 2. Initialize network monitoring
      console.log('Starting network monitoring...');
      await this.network.init();

      // 3. Initialize authentication
      console.log('Loading authentication state...');
      await this.auth.init();

      // 4. Initialize sync service
      console.log('Setting up synchronization...');
      await this.sync.init();

      // 5. Trigger initial sync if user is authenticated and online
      if (this.auth.isAuthenticated() && await this.network.isOnline()) {
        console.log('User authenticated and online, triggering sync...');
        // Don't await - let it run in background
        this.sync.sync().catch(error => {
          console.error('Initial sync failed:', error);
        });
      }

      this.initialized = true;
      console.log('CollectPay application initialized successfully');
    } catch (error) {
      console.error('Application initialization failed:', error);
      throw error;
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getDatabase(): DatabaseService {
    return this.db;
  }

  public getNetworkService(): NetworkService {
    return this.network;
  }

  public getSyncService(): SyncService {
    return this.sync;
  }

  public getAuthService(): AuthService {
    return this.auth;
  }

  public async shutdown(): Promise<void> {
    console.log('Shutting down CollectPay application...');
    
    this.network.stopMonitoring();
    await this.db.close();
    
    this.initialized = false;
    console.log('CollectPay application shut down');
  }
}

export default App;
