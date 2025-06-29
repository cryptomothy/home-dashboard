// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  // Google Maps API types
  declare namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts?: MapOptions);
        setCenter(latlng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
        getZoom(): number;
        getCenter(): LatLng;
      }

      class Marker {
        constructor(opts?: MarkerOptions);
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng | LatLngLiteral): void;
        getPosition(): LatLng;
        setTitle(title: string): void;
        addListener(eventName: string, handler: Function): void;
      }

      class Circle {
        constructor(opts?: CircleOptions);
        setMap(map: Map | null): void;
        setCenter(center: LatLng | LatLngLiteral): void;
        setRadius(radius: number): void;
      }

      class InfoWindow {
        constructor(opts?: InfoWindowOptions);
        open(map: Map | null, anchor?: Marker): void;
        close(): void;
        setContent(content: string | Element): void;
      }

      namespace event {
        function addDomListener(instance: any, eventName: string, handler: Function): void;
      }

      namespace SymbolPath {
        const CIRCLE: string;
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        mapTypeId?: MapTypeId;
        styles?: MapTypeStyle[];
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        mapTypeControl?: boolean;
        scaleControl?: boolean;
        streetViewControl?: boolean;
        rotateControl?: boolean;
        fullscreenControl?: boolean;
        scrollwheel?: boolean;
        gestureHandling?: string;
      }

      interface MarkerOptions {
        position?: LatLng | LatLngLiteral;
        map?: Map;
        title?: string;
        icon?: string | Icon;
      }

      interface CircleOptions {
        center?: LatLng | LatLngLiteral;
        radius?: number;
        map?: Map;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeWeight?: number;
        fillColor?: string;
        fillOpacity?: number;
      }

      interface InfoWindowOptions {
        content?: string | Element;
        position?: LatLng | LatLngLiteral;
      }

      interface Icon {
        url?: string;
        scaledSize?: Size;
        anchor?: Point;
        path?: string;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      enum MapTypeId {
        ROADMAP = 'roadmap',
        SATELLITE = 'satellite',
        HYBRID = 'hybrid',
        TERRAIN = 'terrain',
      }

      interface MapTypeStyle {
        featureType?: string;
        elementType?: string;
        stylers?: MapTypeStyler[];
      }

      interface MapTypeStyler {
        color?: string;
        lightness?: number;
        weight?: number;
        visibility?: 'on' | 'off' | 'simplified';
      }
    }
  }
}

export {};
