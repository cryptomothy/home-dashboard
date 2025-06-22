<script lang="ts">
  import { onMount } from 'svelte';
  import {
    CalendarIcon,
    MapPinIcon,
    ExternalLinkIcon,
    ChevronRightIcon,
    LoaderIcon,
  } from 'lucide-svelte';
  import {
    bonjourQuebecService,
    type BonjourQuebecEvent,
  } from '$lib/services/bonjourQuebecService';

  let events: BonjourQuebecEvent[] = [];
  let loading = true;
  let error = false;
  let totalResults = 0;
  let currentPage = 0;

  onMount(async () => {
    await loadEvents();
  });

  async function loadEvents() {
    try {
      loading = true;
      error = false;
      const response = await bonjourQuebecService.getSummerEvents();
      events = response.events;
      totalResults = response.totalResults;
      currentPage = response.currentPage;
    } catch (err) {
      console.error('Erreur lors du chargement des événements Bonjour Québec:', err);
      error = true;
    } finally {
      loading = false;
    }
  }

  // Fonction pour rafraîchir manuellement les données
  function refreshEvents() {
    loadEvents();
  }

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Festival: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Musique: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Art: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      Sport: 'bg-green-500/20 text-green-400 border-green-500/30',
      Marché: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      Conférence: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      Théâtre: 'bg-red-500/20 text-red-400 border-red-500/30',
      Cinéma: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }

  function formatDates(datesString: string): string {
    return bonjourQuebecService.formatEventDates(datesString);
  }
</script>

<div class="col-span-8 row-span-2 glassmorphism rounded-2xl overflow-hidden tech-glow-blue">
  <div class="p-3 flex flex-col h-full">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <CalendarIcon class="h-4 w-4 text-blue-400" />
        <span class="text-sm font-mono text-blue-300 uppercase"
          >événements Québec pour la semaine du {new Date().toLocaleDateString('fr-CA', {
            day: 'numeric',
            month: 'long',
          })} au {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA', {
            day: 'numeric',
            month: 'long',
          })}
        </span>
      </div>
      <div class="flex items-center space-x-2">
        {#if totalResults > 0}
          <span class="text-xs text-gray-400 font-mono">
            {totalResults} événements
          </span>
        {/if}
        <button
          on:click={refreshEvents}
          disabled={loading}
          class="p-1 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50"
        >
          <LoaderIcon class="h-3 w-3 text-blue-400 {loading ? 'animate-spin' : ''}" />
        </button>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-400 mx-auto mb-2"
          ></div>
          <p class="text-xs text-gray-400 font-mono">Chargement des événements...</p>
        </div>
      </div>
    {:else if error}
      <div class="text-center py-8 text-gray-400">
        <CalendarIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Impossible de charger les événements</p>
      </div>
    {:else if events.length === 0}
      <div class="text-center py-8 text-gray-400">
        <CalendarIcon class="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Aucun événement trouvé</p>
      </div>
    {:else}
      <div class="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
        {#each events.slice(0, 8) as event}
          <div
            class="group relative bg-blue-500/10 rounded-lg p-3 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
          >
            <!-- Contenu -->
            <div class="relative z-10">
              <!-- En-tête avec catégorie -->
              <div class="flex items-start justify-between mb-2">
                <span
                  class="px-2 py-1 rounded text-xs font-mono {getCategoryColor(event.category)}"
                >
                  {event.category}
                </span>
              </div>

              <!-- Titre -->
              <h3
                class="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors"
              >
                {event.title}
              </h3>

              <!-- Dates -->
              <div class="flex items-center gap-1 text-xs text-gray-300 mb-2">
                <CalendarIcon class="h-3 w-3" />
                <span class="font-mono line-clamp-1">{formatDates(event.dates)}</span>
              </div>

              <!-- Région -->
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <MapPinIcon class="h-3 w-3" />
                <span class="line-clamp-1 font-mono">{event.region}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>

      {#if events.length > 8}
        <div class="text-center pt-3 border-t border-blue-500/20 mt-3">
          <span class="text-xs text-gray-400 font-mono">
            +{events.length - 8} autres événements
          </span>
          <div class="flex items-center justify-center gap-1 mt-1">
            <span class="text-xs text-blue-400 font-mono">Voir plus</span>
            <ChevronRightIcon class="h-3 w-3 text-blue-400" />
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  /* Scrollbar personnalisée */
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(59, 130, 246, 0.1);
    border-radius: 2px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 2px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
  }
</style>
