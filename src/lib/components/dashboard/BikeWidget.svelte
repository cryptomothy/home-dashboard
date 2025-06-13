<script lang="ts">
  import { onMount } from 'svelte';
  import {
    BikeIcon,
    RefreshCwIcon,
    LoaderIcon,
    BatteryChargingIcon,
    MapPinIcon,
  } from 'lucide-svelte';
  import { bikeService, type StationInfo } from '$lib/services/bikeService';

  // État du composant
  let stations: StationInfo[] = [];
  let loading = true;
  let error = false;
  let lastUpdated = new Date();

  // Charger les données au montage du composant
  onMount(() => {
    loadBikeData();

    // Rafraîchir toutes les 5 minutes (300000 ms)
    const interval = setInterval(loadBikeData, 300000);

    // Nettoyer l'interval au démontage
    return () => clearInterval(interval);
  });

  async function loadBikeData() {
    try {
      loading = true;
      error = false;

      // Charger les données des stations sélectionnées
      stations = await bikeService.getSelectedStations();
      lastUpdated = new Date();

      console.log('🚲 Données àVélo rechargées à', lastUpdated.toLocaleTimeString());
    } catch (err) {
      console.error('Erreur lors du chargement des données àVélo:', err);
      error = true;
    } finally {
      setTimeout(() => {
        loading = false;
      }, 1000);
    }
  }

  // Fonction pour rafraîchir manuellement
  function refreshBikeData() {
    loadBikeData();
  }

  // Fonction pour déterminer la classe de couleur en fonction de la disponibilité
  function getAvailabilityColorClass(available: number, total: number): string {
    const ratio = available / total;
    if (ratio > 0.3) return 'green';
    if (ratio > 0.1) return 'yellow';
    return 'red';
  }
</script>

<div class="col-span-3 row-span-2 glassmorphism rounded-2xl overflow-hidden tech-glow-cyan">
  <div class="p-3 flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <BikeIcon class="h-4 w-4 text-cyan-400" />
        <span class="text-sm font-mono text-cyan-300 uppercase tracking-wider">àVélo</span>
      </div>
      <button
        on:click={refreshBikeData}
        disabled={loading}
        class="p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
      >
        <RefreshCwIcon class="h-3 w-3 text-cyan-400 {loading ? 'animate-spin' : ''}" />
      </button>
    </div>

    {#if loading || stations.length === 0}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <LoaderIcon class="h-6 w-6 text-cyan-400 animate-spin mx-auto mb-2" />
          <p class="text-xs text-gray-400 font-mono">Chargement des stations...</p>
        </div>
      </div>
    {:else if error && stations.length === 0}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <p class="text-xs text-red-400 font-mono mb-2">Erreur de chargement</p>
          <button
            on:click={refreshBikeData}
            class="text-xs text-cyan-400 font-mono hover:text-cyan-300 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    {:else}
      <!-- Stations sélectionnées -->
      <div class="space-y-3">
        {#each stations as station}
          <div class="bg-cyan-500/10 rounded-lg border border-cyan-500/30 p-2">
            <div class="flex items-center mb-1">
              <MapPinIcon class="h-3 w-3 text-cyan-400 mr-1" />
              <p class="text-xs font-mono font-bold text-white">
                {station.name}
                {#if station.is_charging}
                  <BatteryChargingIcon class="h-3 w-3 text-green-400 inline-block ml-1" />
                {/if}
              </p>
            </div>

            <div class="flex justify-between items-center mb-1">
              <p class="text-xs font-mono text-cyan-300">Vélos disponibles</p>
              <div
                class="bg-{getAvailabilityColorClass(
                  station.available,
                  station.total,
                )}-400/30 text-{getAvailabilityColorClass(
                  station.available,
                  station.total,
                )}-300 text-xs font-mono px-2 py-0.5 rounded"
              >
                {station.available}/{station.total}
              </div>
            </div>

            <div class="w-full bg-gray-700 rounded-full h-1.5 mb-2">
              <div
                class="bg-gradient-to-r from-cyan-500 to-{getAvailabilityColorClass(
                  station.available,
                  station.total,
                )}-400 h-1.5 rounded-full transition-all"
                style="width: {(station.available / station.total) * 100}%"
              ></div>
            </div>

            <div class="flex justify-between items-center text-xs font-mono">
              <span class="text-cyan-300">Emplacements libres: {station.docks_available}</span>
              <span class="text-cyan-300">E-bikes: {station.ebikes}</span>
            </div>
          </div>
        {/each}
      </div>

      <!-- Dernière mise à jour -->
      <div class="mt-3 text-center">
        <p class="text-xs text-gray-500 font-mono">
          Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-CA', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    {/if}
  </div>
</div>
