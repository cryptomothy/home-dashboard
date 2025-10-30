/**
 * Styles personnalisés pour la carte Google Maps
 */

export const CUSTOM_MAP_STYLE_ID = '';

export const communautoMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#1e1e1e' }],
  },
  {
    featureType: 'all',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1e1e1e' }],
  },

  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e5e5e5' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1e1e1e' }, { lightness: 0 }],
  },

  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2d2d2d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#404040' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffffff' }],
  },

  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#333333' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4a4a4a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d4d4d4' }],
  },

  {
    featureType: 'road.local',
    elementType: 'geometry.fill',
    stylers: [{ color: '#404040' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#555555' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0b0b0' }],
  },

  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a0a0a0' }],
  },

  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a2e1a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a2e1a' }],
  },

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

  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d4d4d4' }],
  },

  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#404040' }, { lightness: -10 }],
  },
];

export const mapConfig = {
  defaultZoom: 15,
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

export function getMapConfig() {
  return { ...mapConfig };
}

export function getMapStyles(): google.maps.MapTypeStyle[] {
  return communautoMapStyles;
}
