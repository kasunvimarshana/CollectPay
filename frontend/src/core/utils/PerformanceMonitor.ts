/**
 * Performance Monitoring Utility
 * 
 * Tracks and monitors application performance metrics
 */

import Logger from './Logger';

interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private measurements: PerformanceMark[] = [];
  private maxMeasurements: number = 100;

  /**
   * Start performance measurement
   */
  start(name: string, metadata?: Record<string, any>): void {
    this.marks.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });
  }

  /**
   * End performance measurement
   */
  end(name: string): number | null {
    const mark = this.marks.get(name);
    
    if (!mark) {
      Logger.warn(`Performance mark "${name}" not found`, undefined, 'PERF');
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - mark.startTime;

    const measurement: PerformanceMark = {
      ...mark,
      endTime,
      duration,
    };

    this.measurements.push(measurement);
    this.marks.delete(name);

    // Keep measurements list manageable
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }

    // Log slow operations
    if (duration > 1000) {
      Logger.warn(
        `Slow operation detected: ${name} took ${duration}ms`,
        mark.metadata,
        'PERF'
      );
    } else if (__DEV__) {
      Logger.debug(`${name} completed in ${duration}ms`, mark.metadata, 'PERF');
    }

    return duration;
  }

  /**
   * Measure async function
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measure sync function
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.start(name, metadata);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all measurements
   */
  getMeasurements(): PerformanceMark[] {
    return [...this.measurements];
  }

  /**
   * Get measurements by name
   */
  getMeasurementsByName(name: string): PerformanceMark[] {
    return this.measurements.filter(m => m.name === name);
  }

  /**
   * Get average duration for measurement name
   */
  getAverageDuration(name: string): number | null {
    const measurements = this.getMeasurementsByName(name);
    
    if (measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / measurements.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avgDuration: number; minDuration: number; maxDuration: number }> {
    const summary: Record<string, { count: number; avgDuration: number; minDuration: number; maxDuration: number }> = {};

    for (const measurement of this.measurements) {
      if (!measurement.duration) continue;

      if (!summary[measurement.name]) {
        summary[measurement.name] = {
          count: 0,
          avgDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
        };
      }

      const entry = summary[measurement.name];
      entry.count++;
      entry.minDuration = Math.min(entry.minDuration, measurement.duration);
      entry.maxDuration = Math.max(entry.maxDuration, measurement.duration);
    }

    // Calculate averages
    for (const name in summary) {
      const measurements = this.getMeasurementsByName(name);
      const total = measurements.reduce((sum, m) => sum + (m.duration || 0), 0);
      summary[name].avgDuration = total / measurements.length;
    }

    return summary;
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.marks.clear();
    this.measurements = [];
  }

  /**
   * Export measurements as JSON
   */
  export(): string {
    return JSON.stringify({
      measurements: this.measurements,
      summary: this.getSummary(),
    }, null, 2);
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;

/**
 * React Hook for performance measurement
 */
export function usePerformanceMonitor() {
  return {
    start: (name: string, metadata?: Record<string, any>) => performanceMonitor.start(name, metadata),
    end: (name: string) => performanceMonitor.end(name),
    measure: <T,>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>) => 
      performanceMonitor.measure(name, fn, metadata),
    measureSync: <T,>(name: string, fn: () => T, metadata?: Record<string, any>) => 
      performanceMonitor.measureSync(name, fn, metadata),
    getSummary: () => performanceMonitor.getSummary(),
  };
}
