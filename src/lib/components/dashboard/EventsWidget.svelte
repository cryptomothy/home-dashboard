<script lang="ts">
  import { onMount } from 'svelte';
  import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from 'lucide-svelte';
  import { facebookEventsService, type LocalEvent } from '$lib/services/facebookEventsService';

  let events: LocalEvent[] = [];
  let loading = true;
  let error = false;

  onMount(async () => {
    try {
      events = await facebookEventsService.getLocalEvents();
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err);
      error = true;
    } finally {
      loading = false;
    }
  });

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Musique: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Art: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      Sport: 'bg-green-500/20 text-green-400 border-green-500/30',
      Marché: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      Festival: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Conférence: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      Théâtre: 'bg-red-500/20 text-red-400 border-red-500/30',
      Cinéma: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }

  function formatDistance(distance?: number): string {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  }
</script>

<div class="col-span-8 row-span-2 glassmorphism rounded-2xl overflow-hidden tech-glow-purple">
  <div class="p-3 flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <CalendarIcon class="h-4 w-4 text-purple-400" />
        <span class="text-sm font-mono text-purple-300 uppercase tracking-wider"
          >Événements Locaux</span
        >
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-400 mx-auto mb-2"
          ></div>
          <p class="text-xs text-gray-400 font-mono">Chargement...</p>
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
        <p class="text-sm">Aucun événement à proximité</p>
      </div>
    {:else}
      <div class="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
        {#each events.slice(0, 6) as event}
          <div
            class="group relative bg-purple-500/10 rounded-lg p-2 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
          >
            <!-- Image de fond -->
            {#if event.imageUrl}
              <div
                class="absolute inset-0 rounded-lg overflow-hidden opacity-10 group-hover:opacity-20 transition-opacity"
              >
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            {/if}

            <!-- Contenu -->
            <div class="relative z-10">
              <!-- En-tête avec catégorie et distance -->
              <div class="flex items-start justify-between mb-1">
                <span
                  class="px-1.5 py-0.5 rounded text-xs font-mono {getCategoryColor(event.category)}"
                >
                  {event.category}
                </span>
                {#if event.distance}
                  <span class="text-xs text-gray-400 font-mono">
                    {formatDistance(event.distance)}
                  </span>
                {/if}
              </div>

              <!-- Titre -->
              <h3 class="font-semibold text-white text-xs mb-1 line-clamp-2">
                {event.title}
              </h3>

              <!-- Date et heure -->
              <div class="flex items-center gap-1 text-xs text-gray-300 mb-1">
                <CalendarIcon class="h-3 w-3" />
                <span class="font-mono"
                  >{facebookEventsService.formatEventDate(event.startDate)}</span
                >
              </div>

              <!-- Heure -->
              <div class="flex items-center gap-1 text-xs text-gray-300 mb-1">
                <ClockIcon class="h-3 w-3" />
                <span class="font-mono"
                  >{facebookEventsService.formatEventTime(event.startDate)}</span
                >
              </div>

              <!-- Lieu -->
              <div class="flex items-center gap-1 text-xs text-gray-400 mb-1">
                <MapPinIcon class="h-3 w-3" />
                <span class="line-clamp-1 font-mono">{event.location}</span>
              </div>

              <!-- Participants -->
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <UsersIcon class="h-3 w-3" />
                <span class="font-mono">{event.attendees}</span>
                {#if event.interested > 0}
                  <span class="text-gray-500">•</span>
                  <span class="font-mono">{event.interested}</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>

      {#if events.length > 6}
        <div class="text-center pt-2">
          <span class="text-xs text-gray-400 font-mono">
            +{events.length - 6} autres événements
          </span>
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
</style>
