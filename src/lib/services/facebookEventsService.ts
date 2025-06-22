// Types pour l'API Facebook Events
interface FacebookEvent {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  place?: {
    name: string;
    location?: {
      city?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  cover?: {
    source: string;
  };
  attending_count?: number;
  interested_count?: number;
  category?: string;
  ticket_uri?: string;
}

interface FacebookEventsResponse {
  data: FacebookEvent[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  imageUrl?: string;
  attendees: number;
  interested: number;
  category: string;
  ticketUrl?: string;
  distance?: number;
}

class FacebookEventsService {
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private accessToken: string;
  private defaultLocation = {
    lat: 46.8139, // Québec
    lng: -71.208,
    distance: 10000, // 10km
  };

  constructor() {
    this.accessToken = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN || '';
  }

  async getLocalEvents(
    lat: number = this.defaultLocation.lat,
    lng: number = this.defaultLocation.lng,
    distance: number = this.defaultLocation.distance,
    days: number = 7,
  ): Promise<LocalEvent[]> {
    try {
      console.log('📅 Récupération des événements Facebook locaux...');

      if (!this.accessToken) {
        console.warn('⚠️ Token Facebook manquant, utilisation des données mockées');
        return this.getMockEvents();
      }

      // Calculer la date de fin (7 jours à partir d'aujourd'hui)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      // Construire l'URL de recherche
      const searchUrl = new URL(`${this.baseUrl}/search`);
      searchUrl.searchParams.append('type', 'event');
      searchUrl.searchParams.append('center', `${lat},${lng}`);
      searchUrl.searchParams.append('distance', distance.toString());
      searchUrl.searchParams.append('since', new Date().toISOString());
      searchUrl.searchParams.append('until', endDate.toISOString());
      searchUrl.searchParams.append(
        'fields',
        'id,name,description,start_time,end_time,place,cover,attending_count,interested_count,category,ticket_uri',
      );
      searchUrl.searchParams.append('access_token', this.accessToken);
      searchUrl.searchParams.append('limit', '20');

      console.log(
        '📡 URL de requête Facebook Events:',
        searchUrl.toString().replace(this.accessToken, '[TOKEN_MASQUÉ]'),
      );

      const response = await fetch(searchUrl.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API Facebook:', errorText);
        throw new Error(`Erreur API Facebook: ${response.status} - ${errorText}`);
      }

      const data: FacebookEventsResponse = await response.json();
      console.log('✅ Événements Facebook récupérés avec succès');

      // Transformer les données
      const events: LocalEvent[] = data.data
        .filter((event) => event.start_time) // Filtrer les événements sans date
        .map((event) => this.transformEvent(event, lat, lng))
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()); // Trier par date

      return events;
    } catch (error) {
      console.error('Erreur lors de la récupération des événements Facebook:', error);
      console.log('🔄 Utilisation des données mockées en fallback');
      return this.getMockEvents();
    }
  }

  private transformEvent(event: FacebookEvent, userLat: number, userLng: number): LocalEvent {
    const startDate = new Date(event.start_time);
    const endDate = event.end_time ? new Date(event.end_time) : undefined;

    // Calculer la distance si les coordonnées sont disponibles
    let distance: number | undefined;
    if (event.place?.location?.latitude && event.place?.location?.longitude) {
      distance = this.calculateDistance(
        userLat,
        userLng,
        event.place.location.latitude,
        event.place.location.longitude,
      );
    }

    return {
      id: event.id,
      title: event.name,
      description: event.description || 'Aucune description disponible',
      startDate,
      endDate,
      location: event.place?.name || 'Lieu non spécifié',
      imageUrl: event.cover?.source,
      attendees: event.attending_count || 0,
      interested: event.interested_count || 0,
      category: event.category || 'Événement',
      ticketUrl: event.ticket_uri,
      distance,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getMockEvents(): LocalEvent[] {
    const now = new Date();
    return [
      {
        id: '1',
        title: "Festival d'été de Québec",
        description: 'Le plus grand festival de musique en plein air au Canada',
        startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        location: 'Plains of Abraham, Québec',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        attendees: 1500,
        interested: 3200,
        category: 'Musique',
        distance: 2.5,
      },
      {
        id: '2',
        title: 'Marché du Vieux-Port',
        description: 'Découvrez les produits locaux et artisanaux',
        startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Demain
        location: 'Marché du Vieux-Port, Québec',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        attendees: 45,
        interested: 120,
        category: 'Marché',
        distance: 1.2,
      },
      {
        id: '3',
        title: "Exposition d'Art Contemporain",
        description: "Découvrez les œuvres d'artistes québécois émergents",
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        location: 'Musée national des beaux-arts du Québec',
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
        attendees: 89,
        interested: 234,
        category: 'Art',
        distance: 3.8,
      },
      {
        id: '4',
        title: 'Course à pied 5K',
        description: 'Course matinale dans le parc de la Chute-Montmorency',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
        location: 'Parc de la Chute-Montmorency',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        attendees: 156,
        interested: 289,
        category: 'Sport',
        distance: 8.5,
      },
    ];
  }

  formatEventDate(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return 'Demain';
    } else if (diffDays < 7) {
      return `Dans ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-CA', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  formatEventTime(date: Date): string {
    return date.toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export const facebookEventsService = new FacebookEventsService();
export type { LocalEvent };
