/**
 * Styles personnalisés pour la carte Google Maps
 * Thème sombre et moderne cohérent avec le design du site
 */

// ID de votre style personnalisé créé sur Google Cloud Console
// Désactivé pour utiliser les styles inline
export const CUSTOM_MAP_STYLE_ID = ''; // Désactivé

// Debug: Afficher l'ID de style dans la console
console.log('🗺️ CUSTOM_MAP_STYLE_ID:', CUSTOM_MAP_STYLE_ID || 'Non défini');

export const communautoMapStyles: google.maps.MapTypeStyle[] = [
  // Style général - fond sombre élégant
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#1e1e1e' }], // Gris très sombre
  },
  {
    featureType: 'all',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1e1e1e' }],
  },

  // Texte principal - blanc subtil
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e5e5e5' }], // Blanc cassé
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1e1e1e' }, { lightness: 0 }],
  },

  // Routes - hiérarchie claire
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2d2d2d' }], // Gris moyen pour les autoroutes
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#404040' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffffff' }], // Blanc pour les noms d'autoroutes
  },

  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#333333' }], // Gris plus clair pour les artères
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4a4a4a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d4d4d4' }], // Gris clair pour les noms de rues
  },

  {
    featureType: 'road.local',
    elementType: 'geometry.fill',
    stylers: [{ color: '#404040' }], // Gris encore plus clair pour les rues locales
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#555555' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0b0b0' }], // Gris plus subtil pour les rues locales
  },

  // Eau - bleu très sombre et élégant
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a1a2e' }], // Bleu très sombre
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a0a0a0' }], // Gris pour les noms d'eau
  },

  // Parcs et espaces verts - vert très sombre
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a2e1a' }], // Vert très sombre
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a2e1a' }],
  },

  // Masquer la plupart des POI pour un design épuré
  {
    featureType: 'poi.business',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.medical',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.school',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.sports_complex',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.government',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },

  // Masquer les transports en commun
  {
    featureType: 'transit.station',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },

  // Noms de quartiers et villes - blanc subtil
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffffff' }], // Blanc pour les noms de villes
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d4d4d4' }], // Gris clair pour les quartiers
  },

  // Contours administratifs - très subtils
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#404040' }, { lightness: -10 }],
  },
];

/**
 * Configuration par défaut pour la carte
 */
export const mapConfig = {
  defaultZoom: 14,
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  scrollwheel: true,
  gestureHandling: 'cooperative' as const,
};

/**
 * Fonction pour obtenir la configuration de la carte
 */
export function getMapConfig() {
  console.log('🗺️ Configuration de carte avec styles inline');
  return { ...mapConfig };
}

/**
 * Fonction pour obtenir les styles de la carte
 * Utilise les styles inline sobres et modernes
 */
export function getMapStyles(): google.maps.MapTypeStyle[] {
  console.log('🗺️ Utilisation des styles inline sobres');
  return communautoMapStyles;
}
