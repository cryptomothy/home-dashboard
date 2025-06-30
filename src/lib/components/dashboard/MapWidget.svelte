<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { MapPinIcon, LoaderIcon, CarIcon, NavigationIcon } from 'lucide-svelte';
  import { PUBLIC_DEFAULT_LAT, PUBLIC_DEFAULT_LON } from '$env/static/public';
  import { communautoService, type CommunautoVehicle } from '$lib/services/communautoService';
  import { getMapStyles, getMapConfig } from '$lib/config/mapStyles';
  import { calculateDistance } from '$lib/utils';

  // État du composant
  let mapContainer: HTMLDivElement;
  let map: google.maps.Map | null = null;
  let loading = true;
  let error = false;
  let vehicles: CommunautoVehicle[] = [];
  let markers: google.maps.Marker[] = [];
  let vehiclesLoading = false;
  let userLocation: { lat: number; lng: number } | null = null;
  let userMarker: google.maps.Marker | null = null;
  let radiusCircle: google.maps.Circle | null = null;
  let showNearbyVehicles = false;
  let nearbyVehicles: CommunautoVehicle[] = [];
  let nearbyVehiclesLoading = false;

  // Configuration de la carte
  const defaultCenter = {
    lat: parseFloat(PUBLIC_DEFAULT_LAT),
    lng: parseFloat(PUBLIC_DEFAULT_LON),
  };

  onMount(async () => {
    await loadGoogleMapsAPI();
    await loadVehicles();
  });

  onDestroy(() => {
    // Nettoyer les marqueurs
    clearMarkers();
    // Nettoyer la carte si elle existe
    if (map) {
      // Google Maps se nettoie automatiquement
    }
  });

  // Reactive statement pour initialiser la carte quand mapContainer et google.maps sont disponibles
  $: if (mapContainer && google?.maps?.Map && !map) {
    console.log('🗺️ mapContainer et google.maps disponibles, initialisation de la carte...');
    initMap();
  }

  // Reactive statement pour ajouter les marqueurs quand la carte et les véhicules sont disponibles
  $: if (map && vehicles.length > 0) {
    console.log('🗺️ Ajout des marqueurs Communauto...');
    addVehicleMarkers();
  }

  // Reactive statement pour mettre à jour les véhicules à proximité
  $: if (showNearbyVehicles && userLocation && nearbyVehicles.length > 0) {
    console.log('🗺️ Mise à jour des véhicules à proximité...');
    updateNearbyVehiclesDisplay();
  }

  async function loadGoogleMapsAPI() {
    try {
      loading = true;
      error = false;
      console.log('🗺️ Début du chargement de Google Maps API');

      // Vérifier si l'API Google Maps est déjà chargée
      if (typeof google === 'undefined' || !google.maps) {
        console.log('🗺️ Google Maps API non chargée, chargement du script...');
        await loadGoogleMapsScript();
      } else {
        console.log('🗺️ Google Maps API déjà chargée');
      }

      // Attendre que l'API soit complètement chargée
      await new Promise<void>((resolve) => {
        if (google.maps.Map) {
          console.log('🗺️ Google Maps Map disponible');
          resolve();
        } else {
          console.log('🗺️ Attente du chargement complet de Google Maps...');
          google.maps.event.addDomListener(window, 'load', () => {
            console.log('🗺️ Google Maps chargement terminé');
            resolve();
          });
        }
      });

      console.log('🗺️ Google Maps API chargée avec succès');
    } catch (err) {
      console.error('Erreur lors du chargement de Google Maps:', err);
      error = true;
    } finally {
      setTimeout(() => {
        loading = false;
      }, 1000);
    }
  }

  function loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API;
      console.log('🗺️ Clé API Google Maps:', apiKey ? 'Présente' : 'Manquante');

      if (!apiKey) {
        reject(new Error('Clé API Google Maps manquante'));
        return;
      }

      // Vérifier si le script est déjà chargé
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log('🗺️ Script Google Maps déjà présent');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('🗺️ Script Google Maps chargé avec succès');
        resolve();
      };
      script.onerror = () => {
        console.error('🗺️ Échec du chargement du script Google Maps');
        reject(new Error('Échec du chargement de Google Maps'));
      };

      document.head.appendChild(script);
      console.log('🗺️ Script Google Maps ajouté au DOM');
    });
  }

  async function loadVehicles() {
    try {
      vehiclesLoading = true;
      vehicles = await communautoService.getVehiclesWithLocation();
      console.log(`🚗 ${vehicles.length} véhicules Communauto chargés`);
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules Communauto:', err);
    } finally {
      setTimeout(() => {
        vehiclesLoading = false;
      }, 1000);
    }
  }

  async function getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('📍 Position utilisateur obtenue:', location);
          resolve(location);
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }

  async function loadNearbyVehicles() {
    if (!userLocation) return;

    try {
      nearbyVehiclesLoading = true;
      nearbyVehicles = await communautoService.getVehiclesInRadius(
        90, // cityId pour Montréal
        userLocation.lat,
        userLocation.lng,
        1, // rayon de 1km
      );
      console.log(`🚗 ${nearbyVehicles.length} véhicules trouvés dans un rayon de 1km`);
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules à proximité:', err);
    } finally {
      nearbyVehiclesLoading = false;
    }
  }

  async function toggleNearbyVehicles() {
    if (!showNearbyVehicles) {
      // Activer la recherche de véhicules à proximité
      try {
        if (!userLocation) {
          userLocation = await getUserLocation();
          addUserMarker();
        }
        await loadNearbyVehicles();
        showNearbyVehicles = true;
      } catch (err) {
        console.error("Erreur lors de l'activation des véhicules à proximité:", err);
      }
    } else {
      // Désactiver la recherche de véhicules à proximité
      showNearbyVehicles = false;
      nearbyVehicles = [];
      removeUserMarker();
      removeRadiusCircle();
      // Recharger tous les véhicules
      await loadVehicles();
    }
  }

  function initMap() {
    console.log('🗺️ Initialisation de la carte avec les coordonnées:', defaultCenter);

    const mapOptions = getMapConfig();
    console.log('🗺️ Options de la carte:', mapOptions);

    map = new google.maps.Map(mapContainer, {
      center: defaultCenter,
      zoom: mapOptions.defaultZoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: getMapStyles(),
      ...mapOptions,
    });

    console.log('🗺️ Carte initialisée avec succès');
  }

  function addVehicleMarkers() {
    // Nettoyer les marqueurs existants
    clearMarkers();

    const vehiclesToShow = showNearbyVehicles ? nearbyVehicles : vehicles;

    vehiclesToShow.forEach((vehicle) => {
      const position = {
        lat: vehicle.vehicleLocation.latitude,
        lng: vehicle.vehicleLocation.longitude,
      };

      // Calculer la distance si on a la position de l'utilisateur
      let title = `Véhicule #${vehicle.vehicleNb}`;
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          position.lat,
          position.lng,
        );
        title += ` (${distance.toFixed(1)}km)`;
      }

      // Créer un marqueur personnalisé
      const marker = new google.maps.Marker({
        position: position,
        map: map!,
        title: title,
        icon: {
          url: createCustomMarkerIcon(),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
        },
      });

      markers.push(marker);
    });

    console.log(`🗺️ ${markers.length} marqueurs Communauto ajoutés`);
  }

  function addUserMarker() {
    if (!map || !userLocation) return;

    // Supprimer le marqueur utilisateur existant
    removeUserMarker();

    // Créer un marqueur pour la position de l'utilisateur
    userMarker = new google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Votre position',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
    });

    // Ajouter un cercle pour représenter le rayon de 1km
    radiusCircle = new google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      map: map,
      center: userLocation,
      radius: 1000, // 1km en mètres
    });

    // Centrer la carte sur la position de l'utilisateur
    map.setCenter(userLocation);
    map.setZoom(14);
  }

  function removeUserMarker() {
    if (userMarker) {
      userMarker.setMap(null);
      userMarker = null;
    }
    removeRadiusCircle();
  }

  function removeRadiusCircle() {
    if (radiusCircle) {
      radiusCircle.setMap(null);
      radiusCircle = null;
    }
  }

  function updateNearbyVehiclesDisplay() {
    addVehicleMarkers();
  }

  function clearMarkers() {
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];
  }

  function createCustomMarkerIcon(): string {
    // Créer un SVG pour le marqueur Communauto
    const svg = `
      <svg width="151" height="151" viewBox="0 0 151 151" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="75.4995" cy="75.5" r="75.5" fill="url(#paint0_linear_636_40)"/>
        <path d="M92.9713 83.3848C92.9713 94.1679 85.7826 102.769 74.8711 102.769C64.0239 102.769 56.771 94.1679 56.771 83.3848C56.771 72.6018 63.9597 64.001 74.8711 64.001C85.7826 64.001 92.9713 72.6018 92.9713 83.3848ZM67.5541 83.3848C67.5541 88.327 70.1856 92.4349 74.9353 92.4349C79.685 92.4349 82.3166 88.327 82.3166 83.3848C82.3166 78.4426 79.685 74.3347 74.9353 74.3347C70.1856 74.2706 67.5541 78.4426 67.5541 83.3848Z" fill="#8BC53F"/>
        <path d="M44.6405 85C44.6405 68.2478 58.2477 54.6406 75 54.6406C91.7522 54.6406 105.295 68.2478 105.295 85C105.295 91.611 103.177 97.7086 99.5828 102.715H121.791C123.845 97.1951 125 91.2259 125 85C125 57.4005 102.599 35 75 35C47.4005 35 25 57.4005 25 85C25 91.2259 26.1553 97.1951 28.2092 102.715H50.353C46.7587 97.7086 44.6405 91.611 44.6405 85Z" fill="#8BC53F"/>
        <defs>
          <linearGradient id="paint0_linear_636_40" x1="75.4995" y1="0" x2="75.4995" y2="151" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0A5E99"/>
            <stop offset="1" stop-color="#109CFF"/>
          </linearGradient>
        </defs>
      </svg>

    `;

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function getVehicleTypeName(typeId: number): string {
    const types: { [key: number]: string } = {
      1: 'Électrique',
      2: 'Hybride',
      3: 'Essence',
      4: 'Standard',
    };
    return types[typeId] || 'Inconnu';
  }

  function refreshMap() {
    loadGoogleMapsAPI();
  }

  async function refreshVehicles() {
    communautoService.clearCache();
    if (showNearbyVehicles) {
      await loadNearbyVehicles();
    } else {
      await loadVehicles();
    }
  }
</script>

<div
  class="col-span-8 row-span-3 glassmorphism rounded-2xl overflow-hidden min-h-[600px] tech-glow"
>
  <div class="p-3 h-full flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <MapPinIcon class="h-4 w-4 text-green-400" />
        <span class="text-sm font-mono text-green-300 uppercase tracking-wider"
          >Carte Communauto</span
        >
        {#if showNearbyVehicles}
          <span class="text-xs text-blue-400 font-mono bg-blue-500/20 px-2 py-1 rounded">
            {nearbyVehicles.length} véhicules à proximité
          </span>
        {:else if vehicles.length > 0}
          <span class="text-xs text-green-400 font-mono bg-green-500/20 px-2 py-1 rounded">
            {vehicles.length} véhicules
          </span>
        {/if}
      </div>
      <div class="flex items-center space-x-2">
        <button
          on:click={toggleNearbyVehicles}
          disabled={nearbyVehiclesLoading}
          class="p-1 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50 {showNearbyVehicles
            ? 'bg-blue-500/40'
            : ''}"
          title="Afficher les véhicules à proximité (1km)"
        >
          <NavigationIcon
            class="h-3 w-3 text-blue-400 {nearbyVehiclesLoading ? 'animate-spin' : ''}"
          />
        </button>
        <button
          on:click={refreshVehicles}
          disabled={vehiclesLoading || nearbyVehiclesLoading}
          class="p-1 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50"
          title="Rafraîchir les véhicules"
        >
          <CarIcon
            class="h-3 w-3 text-blue-400 {vehiclesLoading || nearbyVehiclesLoading
              ? 'animate-spin'
              : ''}"
          />
        </button>
        <button
          on:click={refreshMap}
          disabled={loading}
          class="p-1 rounded-lg bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
          title="Rafraîchir la carte"
        >
          <LoaderIcon class="h-3 w-3 text-green-400 {loading ? 'animate-spin' : ''}" />
        </button>
      </div>
    </div>

    {#if loading}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <LoaderIcon class="h-8 w-8 text-green-400 animate-spin mx-auto mb-2" />
          <p class="text-xs text-gray-400 font-mono">Chargement de la carte...</p>
        </div>
      </div>
    {:else if error}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <p class="text-xs text-red-400 font-mono mb-2">Erreur de chargement</p>
          <button
            on:click={refreshMap}
            class="text-xs text-green-400 font-mono hover:text-green-300 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    {:else}
      <div class="flex-1 relative">
        <div bind:this={mapContainer} class="w-full h-full rounded-lg overflow-hidden"></div>

        <!-- Instructions d'utilisation -->
        <div class="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <p class="text-xs text-gray-300 font-mono">
            {showNearbyVehicles
              ? 'Véhicules dans un rayon de 1km'
              : 'Utilisez la souris pour naviguer'}
          </p>
        </div>

        <!-- Indicateur de chargement des véhicules -->
        {#if vehiclesLoading || nearbyVehiclesLoading}
          <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <div class="flex items-center space-x-2">
              <CarIcon class="h-3 w-3 text-blue-400 animate-spin" />
              <span class="text-xs text-gray-300 font-mono">
                {showNearbyVehicles
                  ? 'Chargement véhicules à proximité...'
                  : 'Chargement véhicules...'}
              </span>
            </div>
          </div>
        {/if}

        <!-- Indicateur de position utilisateur -->
        {#if userLocation && showNearbyVehicles}
          <div class="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span class="text-xs text-gray-300 font-mono">Votre position</span>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  /* Styles pour s'assurer que la carte occupe tout l'espace disponible */
  :global(.glassmorphism) {
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  :global(.tech-glow) {
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
  }
</style>
