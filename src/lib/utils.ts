import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Calcule les coordonnées d'une zone rectangulaire autour d'un point central
 * @param centerLat Latitude du centre
 * @param centerLng Longitude du centre
 * @param radiusKm Rayon en kilomètres
 * @returns Objet avec les coordonnées min/max de la zone
 */
export function calculateBoundingBox(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
): {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
} {
  // Approximation : 1 degré de latitude ≈ 111 km
  // 1 degré de longitude ≈ 111 km * cos(latitude)
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180));

  return {
    minLatitude: centerLat - latDelta,
    maxLatitude: centerLat + latDelta,
    minLongitude: centerLng - lngDelta,
    maxLongitude: centerLng + lngDelta,
  };
}

/**
 * Calcule la distance entre deux points en kilomètres (formule de Haversine)
 * @param lat1 Latitude du premier point
 * @param lng1 Longitude du premier point
 * @param lat2 Latitude du deuxième point
 * @param lng2 Longitude du deuxième point
 * @returns Distance en kilomètres
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
