import * as Location from "expo-location";
import { Location as LocationType } from "@/types";

/**
 * Location Service - Handles GPS coordinate capture with permission management
 * Wraps expo-location for easier testing and reusability
 */
class LocationService {
  private hasPermission: boolean = false;

  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === "granted";
      return this.hasPermission;
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.hasPermission = status === "granted";
      return this.hasPermission;
    } catch (error) {
      console.error("Error checking location permissions:", error);
      return false;
    }
  }

  /**
   * Get current GPS position
   * @param highAccuracy - Use high accuracy mode (uses more battery)
   * @returns Location object with latitude and longitude, or null if failed
   */
  async getCurrentPosition(
    highAccuracy: boolean = true
  ): Promise<LocationType | null> {
    try {
      // Check permissions first
      if (!this.hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error("Location permissions not granted");
        }
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: highAccuracy
          ? Location.Accuracy.High
          : Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: new Date(location.timestamp).toISOString(),
      };
    } catch (error) {
      console.error("Error getting current position:", error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param from - Starting location
   * @param to - Destination location
   * @returns Distance in kilometers
   */
  calculateDistance(from: LocationType, to: LocationType): number {
    const R = 6371; // Earth's radius in kilometers

    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) *
        Math.cos(this.toRadians(to.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if location is within a certain radius of a point
   * @param current - Current location
   * @param center - Center point
   * @param radiusKm - Radius in kilometers
   * @returns True if within radius
   */
  isWithinRadius(
    current: LocationType,
    center: LocationType,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(current, center);
    return distance <= radiusKm;
  }

  /**
   * Validate location accuracy
   * @param location - Location to validate
   * @param maxAccuracy - Maximum acceptable accuracy in meters (lower is better)
   * @returns True if accuracy is acceptable
   */
  isAccuracyAcceptable(
    location: LocationType,
    maxAccuracy: number = 100
  ): boolean {
    if (!location.accuracy) {
      return false;
    }
    return location.accuracy <= maxAccuracy;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format location for display
   * @param location - Location to format
   * @returns Formatted string (e.g., "12.3456°N, 78.9012°E")
   */
  formatLocation(location: LocationType): string {
    const lat = Math.abs(location.latitude).toFixed(4);
    const lon = Math.abs(location.longitude).toFixed(4);
    const latDir = location.latitude >= 0 ? "N" : "S";
    const lonDir = location.longitude >= 0 ? "E" : "W";
    return `${lat}°${latDir}, ${lon}°${lonDir}`;
  }
}

export const locationService = new LocationService();
