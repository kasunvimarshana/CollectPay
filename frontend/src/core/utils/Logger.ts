/**
 * Logger Service
 * 
 * Centralized logging service for the frontend application
 * Provides consistent logging with environment-aware behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 100;

  constructor() {
    this.isDevelopment = __DEV__;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any, context?: string): void {
    if (this.isDevelopment) {
      this.log('debug', message, data, context);
      console.log(`[DEBUG]${context ? ` [${context}]` : ''} ${message}`, data || '');
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
    if (this.isDevelopment) {
      console.info(`[INFO]${context ? ` [${context}]` : ''} ${message}`, data || '');
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
    console.warn(`[WARN]${context ? ` [${context}]` : ''} ${message}`, data || '');
  }

  /**
   * Log error message
   */
  error(message: string, error?: any, context?: string): void {
    this.log('error', message, error, context);
    console.error(`[ERROR]${context ? ` [${context}]` : ''} ${message}`, error || '');
    
    // In production, you might want to send to error tracking service (e.g., Sentry)
    if (!this.isDevelopment) {
      this.sendToErrorTracking(message, error, context);
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, data, 'API');
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, duration?: number): void {
    const message = `API Response: ${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    
    if (status >= 400) {
      this.warn(message, undefined, 'API');
    } else {
      this.debug(message, undefined, 'API');
    }
  }

  /**
   * Log API error
   */
  apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method} ${url}`, error, 'API');
  }

  /**
   * Log sync operation
   */
  sync(message: string, data?: any): void {
    this.info(message, data, 'SYNC');
  }

  /**
   * Log auth operation
   */
  auth(message: string, data?: any): void {
    // Don't log sensitive auth data in production
    if (this.isDevelopment) {
      this.info(message, data, 'AUTH');
    } else {
      this.info(message, undefined, 'AUTH');
    }
  }

  /**
   * Log navigation event
   */
  navigation(screen: string, params?: any): void {
    this.debug(`Navigation to ${screen}`, params, 'NAV');
  }

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.debug(`Performance: ${metric} = ${value}${unit}`, undefined, 'PERF');
  }

  /**
   * Get log history
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Export logs as string
   */
  exportLogs(): string {
    return this.logHistory
      .map(entry => `[${entry.timestamp}] [${entry.level.toUpperCase()}]${entry.context ? ` [${entry.context}]` : ''} ${entry.message}`)
      .join('\n');
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };

    this.logHistory.push(entry);

    // Keep history size manageable
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Send error to tracking service (placeholder)
   */
  private sendToErrorTracking(message: string, error: any, context?: string): void {
    // Implement error tracking service integration here
    // Example: Sentry, Bugsnag, Firebase Crashlytics, etc.
    // 
    // Sentry.captureException(error, {
    //   tags: { context },
    //   extra: { message },
    // });
  }
}

// Export singleton instance
export default new Logger();
