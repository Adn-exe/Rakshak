/**
 * Browser geolocation utilities.
 */

import type { Location } from '@/types';

/** Request user's current location via browser Geolocation API. */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Try reverse geocoding for address
        let address = '';
        try {
          address = await reverseGeocode(lat, lng);
        } catch {
          address = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
        }

        resolve({
          latitude: lat,
          longitude: lng,
          address,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location unavailable'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out'));
            break;
          default:
            reject(new Error('Location error'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/** Reverse geocode coordinates to an address using Nominatim (OpenStreetMap). */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    if (!res.ok) throw new Error('Geocoding failed');

    const data = await res.json();
    const addr = data.address;

    // Build a readable address
    const parts = [
      addr.city || addr.town || addr.village || addr.county,
      addr.state,
    ].filter(Boolean);

    return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || '';
  } catch {
    return '';
  }
}
