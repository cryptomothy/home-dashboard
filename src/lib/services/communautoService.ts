import { calculateBoundingBox, calculateDistance } from '$lib/utils';
import { PUBLIC_DEFAULT_LAT, PUBLIC_DEFAULT_LON } from '$env/static/public';

export interface CommunautoVehicle {
  id: number;
  number: number;
  cityId: number;
  location: {
    latitude: number;
    longitude: number;
  };
  bodyTypeId: number;
  typeId: number;
  propulsionTypeId: number;
  transmissionTypeId: number;
  tireTypeId: number;
  accessories: number[];
  energyLevel: number | null;
  satisfiesFilters: boolean;
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
  private defaultLocation = {
    lat: parseFloat(PUBLIC_DEFAULT_LAT),
    lng: parseFloat(PUBLIC_DEFAULT_LON),
  };

  async getVehicles(cityId: number = 90): Promise<CommunautoResponse> {
    const now = Date.now();

    // Vérifier si on a des données en cache et si elles sont encore valides
    if (this.cache && now - this.lastFetch < this.cacheDuration) {
      console.log('🚗 Données Communauto servies depuis le cache');
      return this.cache;
    }

    try {
      console.log('🚗 Récupération des véhicules Communauto dans un rayon de 1km...');

      // Calculer la zone de recherche autour de la position par défaut
      const boundingBox = calculateBoundingBox(
        this.defaultLocation.lat,
        this.defaultLocation.lng,
        1,
      );

      const params = new URLSearchParams({
        cityId: cityId.toString(),
        MaxLatitude: boundingBox.maxLatitude.toString(),
        MinLatitude: boundingBox.minLatitude.toString(),
        MaxLongitude: boundingBox.maxLongitude.toString(),
        MinLongitude: boundingBox.minLongitude.toString(),
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

      // Filtrer les véhicules pour ne garder que ceux dans le rayon exact de 1km
      const vehiclesInRadius = data.vehicles.filter((vehicle) => {
        if (!vehicle.location?.latitude || !vehicle.location?.longitude) {
          return false;
        }

        const distance = calculateDistance(
          this.defaultLocation.lat,
          this.defaultLocation.lng,
          vehicle.location.latitude,
          vehicle.location.longitude,
        );

        return distance <= 1;
      });

      // Créer une nouvelle réponse avec les véhicules filtrés
      const filteredResponse: CommunautoResponse = {
        ...data,
        vehicles: vehiclesInRadius,
        totalNbVehicles: vehiclesInRadius.length,
      };

      // Mettre en cache les données
      this.cache = filteredResponse;
      this.lastFetch = now;

      console.log(
        `🚗 ${vehiclesInRadius.length} véhicules Communauto récupérés dans un rayon de 1km`,
      );
      return filteredResponse;
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
    radiusKm: number = 1,
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
        if (!vehicle.location?.latitude || !vehicle.location?.longitude) {
          return false;
        }

        const distance = calculateDistance(
          centerLat,
          centerLng,
          vehicle.location.latitude,
          vehicle.location.longitude,
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
    // Les véhicules sont déjà filtrés par rayon de 1km et avec localisation dans getVehicles
    return response.vehicles;
  }

  // Méthode pour vider le cache (utile pour forcer un refresh)
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}

export const communautoService = new CommunautoService();
