import { calculateBoundingBox, calculateDistance } from '$lib/utils';

export interface CommunautoVehicle {
  vehicleId: number;
  vehicleNb: number;
  cityId: number;
  vehiclePropulsionTypeId: number;
  vehicleTypeId: number;
  vehicleBodyTypeId: number;
  vehicleTransmissionTypeId: number;
  vehicleTireTypeId: number;
  vehiclePromotions: any[];
  vehicleAccessories: number[];
  vehicleLocation: {
    latitude: number;
    longitude: number;
  };
  satisfiesFilters: boolean;
  energyLevelPercentage: number | null;
  displayZone: boolean;
}

export interface CommunautoResponse {
  totalNbVehicles: number;
  cachingInfo: {
    cachingDurationInSec: number;
    servedFromCache: boolean;
    cachingExpirationUTCDate: string | null;
    hashCode: number;
  };
  vehicles: CommunautoVehicle[];
}

class CommunautoService {
  private baseUrl = '/api/communauto'; // Utilise notre endpoint proxy
  private cache: CommunautoResponse | null = null;
  private lastFetch: number = 0;
  private cacheDuration = 30000; // 30 secondes

  async getVehicles(cityId: number = 90): Promise<CommunautoResponse> {
    const now = Date.now();

    // Vérifier si on a des données en cache et si elles sont encore valides
    if (this.cache && now - this.lastFetch < this.cacheDuration) {
      console.log('🚗 Données Communauto servies depuis le cache');
      return this.cache;
    }

    try {
      console.log('🚗 Récupération des véhicules Communauto...');

      const response = await fetch(`${this.baseUrl}?cityId=${cityId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: CommunautoResponse = await response.json();

      // Vérifier si la réponse contient une erreur
      if ('error' in data && typeof data.error === 'string') {
        throw new Error(data.error);
      }

      // Mettre en cache les données
      this.cache = data;
      this.lastFetch = now;

      console.log(`🚗 ${data.totalNbVehicles} véhicules Communauto récupérés`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules Communauto:', error);

      // Retourner les données en cache si disponibles, même si expirées
      if (this.cache) {
        console.log('🚗 Utilisation des données en cache (expirées)');
        return this.cache;
      }

      throw error;
    }
  }

  // Méthode pour tester l'API simple (sans géolocalisation)
  async getVehiclesSimple(cityId: number = 90): Promise<CommunautoResponse> {
    try {
      console.log('🚗 Test API Communauto Simple...');

      const response = await fetch(`/api/communauto/simple?cityId=${cityId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: CommunautoResponse = await response.json();

      if ('error' in data && typeof data.error === 'string') {
        throw new Error(data.error);
      }

      console.log(`🚗 API Simple: ${data.totalNbVehicles} véhicules récupérés`);
      return data;
    } catch (error) {
      console.error('Erreur API Communauto Simple:', error);
      throw error;
    }
  }

  // Méthode pour tester l'API HTTP/1.1
  async getVehiclesHTTP1(cityId: number = 90): Promise<CommunautoResponse> {
    try {
      console.log('🚗 Test API Communauto HTTP/1.1...');

      const response = await fetch(`/api/communauto/http1?cityId=${cityId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: CommunautoResponse = await response.json();

      if ('error' in data && typeof data.error === 'string') {
        throw new Error(data.error);
      }

      console.log(`🚗 API HTTP/1.1: ${data.totalNbVehicles} véhicules récupérés`);
      return data;
    } catch (error) {
      console.error('Erreur API Communauto HTTP/1.1:', error);
      throw error;
    }
  }

  // Méthode pour obtenir les véhicules dans une zone géographique spécifique
  async getVehiclesInArea(
    cityId: number = 90,
    maxLatitude: number,
    minLatitude: number,
    maxLongitude: number,
    minLongitude: number,
  ): Promise<CommunautoResponse> {
    try {
      console.log('🚗 Récupération des véhicules Communauto dans une zone spécifique...');

      const params = new URLSearchParams({
        cityId: cityId.toString(),
        MaxLatitude: maxLatitude.toString(),
        MinLatitude: minLatitude.toString(),
        MaxLongitude: maxLongitude.toString(),
        MinLongitude: minLongitude.toString(),
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: CommunautoResponse = await response.json();

      // Vérifier si la réponse contient une erreur
      if ('error' in data && typeof data.error === 'string') {
        throw new Error(data.error);
      }

      console.log(`🚗 ${data.totalNbVehicles} véhicules Communauto récupérés dans la zone`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules Communauto dans la zone:', error);
      throw error;
    }
  }

  // Méthode pour obtenir les véhicules dans un rayon autour d'un point
  async getVehiclesInRadius(
    cityId: number = 90,
    centerLat: number,
    centerLng: number,
    radiusKm: number = 2,
  ): Promise<CommunautoVehicle[]> {
    try {
      console.log(`🚗 Récupération des véhicules Communauto dans un rayon de ${radiusKm}km...`);

      // Calculer la zone de recherche
      const boundingBox = calculateBoundingBox(centerLat, centerLng, radiusKm);

      // Récupérer les véhicules dans la zone
      const response = await this.getVehiclesInArea(
        cityId,
        boundingBox.maxLatitude,
        boundingBox.minLatitude,
        boundingBox.maxLongitude,
        boundingBox.minLongitude,
      );

      // Filtrer les véhicules pour ne garder que ceux dans le rayon exact
      const vehiclesInRadius = response.vehicles.filter((vehicle) => {
        if (!vehicle.vehicleLocation?.latitude || !vehicle.vehicleLocation?.longitude) {
          return false;
        }

        const distance = calculateDistance(
          centerLat,
          centerLng,
          vehicle.vehicleLocation.latitude,
          vehicle.vehicleLocation.longitude,
        );

        return distance <= radiusKm;
      });

      console.log(`🚗 ${vehiclesInRadius.length} véhicules trouvés dans le rayon de ${radiusKm}km`);
      return vehiclesInRadius;
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules dans le rayon:', error);
      throw error;
    }
  }

  // Méthode pour obtenir seulement les véhicules avec leur localisation
  async getVehiclesWithLocation(cityId: number = 90): Promise<CommunautoVehicle[]> {
    const response = await this.getVehicles(cityId);
    return response.vehicles.filter(
      (vehicle) =>
        vehicle.vehicleLocation &&
        vehicle.vehicleLocation.latitude &&
        vehicle.vehicleLocation.longitude,
    );
  }

  // Méthode pour vider le cache (utile pour forcer un refresh)
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  // Méthode pour tester toutes les versions de l'API
  async testAllAPIs(cityId: number = 90): Promise<{
    main: boolean;
    simple: boolean;
    http1: boolean;
    details: any;
  }> {
    const results = {
      main: false,
      simple: false,
      http1: false,
      details: {} as any,
    };

    // Test API principale
    try {
      await this.getVehicles(cityId);
      results.main = true;
      results.details.main = 'OK';
    } catch (error) {
      results.details.main = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    // Test API simple
    try {
      await this.getVehiclesSimple(cityId);
      results.simple = true;
      results.details.simple = 'OK';
    } catch (error) {
      results.details.simple = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    // Test API HTTP/1.1
    try {
      await this.getVehiclesHTTP1(cityId);
      results.http1 = true;
      results.details.http1 = 'OK';
    } catch (error) {
      results.details.http1 = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    console.log('🧪 Résultats des tests API Communauto:', results);
    return results;
  }
}

export const communautoService = new CommunautoService();
