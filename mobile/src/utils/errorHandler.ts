import { AxiosError } from 'axios';

export interface AppError {
  message: string;
  code?: string;
  field?: string;
  details?: any;
}

/**
 * Error handling utility
 * Provides centralized error handling and user-friendly error messages
 */
class ErrorHandler {
  /**
   * Parse API error response
   */
  parseApiError(error: any): AppError {
    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;
      
      if (status === 401) {
        return {
          message: 'Session expired. Please login again.',
          code: 'UNAUTHORIZED',
        };
      }
      
      if (status === 403) {
        return {
          message: data?.message || 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
        };
      }
      
      if (status === 422) {
        // Validation error
        const errors = data?.errors || {};
        const firstError = Object.values(errors)[0];
        return {
          message: Array.isArray(firstError) ? firstError[0] : (data?.message || 'Validation error'),
          code: 'VALIDATION_ERROR',
          field: Object.keys(errors)[0],
          details: errors,
        };
      }
      
      if (status === 404) {
        return {
          message: data?.message || 'Resource not found',
          code: 'NOT_FOUND',
        };
      }
      
      if (status >= 500) {
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
        };
      }
      
      return {
        message: data?.message || 'An error occurred',
        code: 'API_ERROR',
        details: data,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'No response from server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Error in request setup
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'CLIENT_ERROR',
      };
    }
  }
  
  /**
   * Parse sync error
   */
  parseSyncError(error: any): AppError {
    if (error.conflicts && error.conflicts.length > 0) {
      return {
        message: `Sync completed with ${error.conflicts.length} conflict(s). Please resolve them.`,
        code: 'SYNC_CONFLICT',
        details: error.conflicts,
      };
    }
    
    return this.parseApiError(error);
  }
  
  /**
   * Parse validation error
   */
  parseValidationError(errors: Record<string, string[]>): AppError {
    const firstField = Object.keys(errors)[0];
    const firstError = errors[firstField][0];
    
    return {
      message: firstError,
      code: 'VALIDATION_ERROR',
      field: firstField,
      details: errors,
    };
  }
  
  /**
   * Get user-friendly error message
   */
  getUserMessage(error: any): string {
    const appError = this.parseApiError(error);
    return appError.message;
  }
  
  /**
   * Log error for debugging
   */
  logError(error: any, context?: string) {
    const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';
    if (isDev) {
      console.error(`[${context || 'Error'}]`, error);
    }
    // In production, send to error tracking service (e.g., Sentry)
  }
}

export const errorHandler = new ErrorHandler();
