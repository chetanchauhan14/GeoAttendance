import { AuthorizedLocation, LocationStatus } from '../types/attendance';

// Default authorized location (configurable)
export const AUTHORIZED_LOCATION: AuthorizedLocation = {
  latitude: 12.933382651731844,
  longitude: 77.70289831523786,
  radius: 2000, // 2000 meters radius
  name: 'Office Location'
};

/**
 * Calculate the distance between two coordinates using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get current location and check if user is within authorized zone
 */
export function getCurrentLocationStatus(): Promise<LocationStatus> {
  return new Promise((resolve) => {
    const locationStatus: LocationStatus = {
      hasPermission: false,
      isInside: false,
      distance: 0,
    };

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      resolve(locationStatus);
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        locationStatus.hasPermission = true;
        locationStatus.currentLocation = { latitude, longitude };

        // Calculate distance to authorized location
        const distance = calculateDistance(
          latitude,
          longitude,
          AUTHORIZED_LOCATION.latitude,
          AUTHORIZED_LOCATION.longitude
        );

        locationStatus.distance = distance;
        locationStatus.isInside = distance <= AUTHORIZED_LOCATION.radius;

        resolve(locationStatus);
      },
      (error) => {
        console.error('Location error:', error);
        // Check if error is due to permission denial
        if (error.code === 1) { // PERMISSION_DENIED
          locationStatus.hasPermission = false;
        }
        resolve(locationStatus);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}