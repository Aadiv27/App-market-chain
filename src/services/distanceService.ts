// Distance calculation service using Google Maps Distance Matrix API
export interface DistanceResult {
  distance: number; // in kilometers
  duration: string; // estimated travel time
  cost: number; // delivery cost at ₹10/km
}

export interface AddressInfo {
  address: string;
  shopName: string;
  phone?: string;
}

export class DistanceService {
  private static readonly GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  private static readonly COST_PER_KM = 10; // ₹10 per kilometer

  /**
   * Calculate distance between two addresses using Google Maps Distance Matrix API
   */
  static async calculateDistance(
    origin: string,
    destination: string
  ): Promise<DistanceResult> {
    try {
      // If no API key is available, use mock calculation
      if (!this.GOOGLE_MAPS_API_KEY) {
        console.warn('Google Maps API key not found, using mock distance calculation');
        return this.getMockDistance(origin, destination);
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${encodeURIComponent(origin)}&` +
        `destinations=${encodeURIComponent(destination)}&` +
        `units=metric&` +
        `key=${this.GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch distance data');
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
        throw new Error('Invalid response from Google Maps API');
      }

      const element = data.rows[0].elements[0];

      if (element.status !== 'OK') {
        throw new Error('Could not calculate distance between addresses');
      }

      const distanceInMeters = element.distance.value;
      const distanceInKm = Math.round(distanceInMeters / 1000);
      const duration = element.duration.text;
      const cost = distanceInKm * this.COST_PER_KM;

      return {
        distance: distanceInKm,
        duration,
        cost
      };
    } catch (error) {
      console.error('Error calculating distance:', error);
      // Fallback to mock calculation
      return this.getMockDistance(origin, destination);
    }
  }

  /**
   * Mock distance calculation for development/fallback
   */
  private static getMockDistance(origin: string, destination: string): DistanceResult {
    // Simple mock calculation based on string similarity
    const mockDistance = Math.floor(Math.random() * 50) + 5; // 5-55 km
    const mockDuration = `${Math.floor(mockDistance / 30 * 60)} mins`; // Rough estimate
    const cost = mockDistance * this.COST_PER_KM;

    return {
      distance: mockDistance,
      duration: mockDuration,
      cost
    };
  }

  /**
   * Format distance result for display
   */
  static formatDistanceResult(result: DistanceResult): string {
    return `${result.distance} km (${result.duration}) - ₹${result.cost}`;
  }
}