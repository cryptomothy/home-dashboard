<script lang="ts">
  import { onMount } from 'svelte';
  import {
    BusIcon,
    RefreshCwIcon,
    LoaderIcon,
    ClockIcon,
    MapPinIcon,
    ArrowUpDownIcon,
  } from 'lucide-svelte';
  import { getBusSchedule } from '$lib/services/rtcService';

  let schedules: Record<string, any> = {};
  let loading = true;
  let error = false;
  let timeoutError = false;
  let lastUpdated = new Date();
  let currentDirection: 'up' | 'down' = 'up';

  const buses = [
    {
      noParcours: '802',
      noArret: '3193',
      codeDirection: '2',
      direction: 'up',
    },
    {
      noParcours: '802',
      noArret: '1048',
      codeDirection: '3',
      direction: 'down',
    },
    {
      noParcours: '1',
      noArret: '3193',
      codeDirection: '1',
      direction: 'up',
    },
    {
      noParcours: '1',
      noArret: '1048',
      codeDirection: '0',
      direction: 'down',
    },
    {
      noParcours: '18',
      noArret: '2258',
      codeDirection: '2',
      direction: 'up',
    },
    {
      noParcours: '18',
      noArret: '1158',
      codeDirection: '3',
      direction: 'down',
    },
    {
      noParcours: '801',
      noArret: '1081',
      codeDirection: '3',
      direction: 'up',
    },
    {
      noParcours: '801',
      noArret: '1575',
      codeDirection: '2',
      direction: 'down',
    },
    {
      noParcours: '800',
      noArret: '1081',
      codeDirection: '3',
      direction: 'up',
    },
    {
      noParcours: '800',
      noArret: '1575',
      codeDirection: '2',
      direction: 'down',
    },
  ];

  async function loadSchedule() {
    try {
      loading = true;
      error = false;
      timeoutError = false;

      // Créer une promesse de timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });

      // Charger les horaires pour chaque bus en parallèle
      const schedulePromises = buses.map(async (bus) => {
        const key = `${bus.noParcours}-${bus.noArret}-${bus.codeDirection}`;
        try {
          const schedule = await getBusSchedule(
            bus.noParcours,
            bus.noArret,
            bus.codeDirection,
            formatDate(new Date()),
          );

          // Vérifier si les horaires sont valides
          if (schedule && schedule.horaires && Array.isArray(schedule.horaires)) {
            return { key, schedule };
          } else {
            console.error(`Données invalides pour le bus ${key}:`, schedule);
            return { key, error: true };
          }
        } catch (e) {
          console.error(`Erreur pour le bus ${key}:`, e);
          return { key, error: true };
        }
      });

      // Attendre soit que toutes les promesses soient résolues, soit que le timeout se déclenche
      const results = (await Promise.race([
        Promise.all(schedulePromises),
        timeoutPromise,
      ])) as any[];

      // Mettre à jour les horaires
      schedules = {};
      results.forEach(({ key, schedule, error }) => {
        if (!error && schedule) {
          schedules[key] = schedule;
        }
      });
      lastUpdated = new Date();
    } catch (e) {
      console.error('Erreur lors du chargement des horaires:', e);
      if ((e as Error).message === 'Timeout') {
        timeoutError = true;
      } else {
        error = true;
      }
    } finally {
      setTimeout(() => {
        loading = false;
      }, 1000);
    }
  }

  onMount(() => {
    loadSchedule();

    // Rafraîchir chaque 3 minutes
    const interval = setInterval(loadSchedule, 180000);

    return () => clearInterval(interval);
  });

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  function getBusKey(bus: (typeof buses)[0]): string {
    return `${bus.noParcours}-${bus.noArret}-${bus.codeDirection}`;
  }

  function formatDate(date: Date): string {
    return (
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0')
    );
  }

  function toggleDirection() {
    currentDirection = currentDirection === 'up' ? 'down' : 'up';
  }
</script>

<div class="col-span-8 glassmorphism rounded-2xl overflow-hidden tech-glow-blue">
  <div class="p-3 flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <BusIcon class="h-4 w-4 text-blue-400" />
        <span class="text-sm font-mono text-blue-300 uppercase tracking-wider">Horaires RTC</span>
      </div>
      <div class="flex items-center space-x-2">
        <button
          on:click={toggleDirection}
          class="hover:cursor-pointer flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
        >
          <ArrowUpDownIcon class="h-4 w-4 text-blue-400" />
          <span class="text-xs font-mono text-blue-300">
            Changer pour {currentDirection === 'up' ? 'basse ville' : 'haute ville'}
          </span>
        </button>
        <button
          on:click={loadSchedule}
          disabled={loading}
          class="hover:cursor-pointer p-1 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCwIcon class="h-3 w-3 text-blue-400 {loading ? 'animate-spin' : ''}" />
        </button>
      </div>
    </div>

    {#if loading || (Object.keys(schedules).length === 0 && !timeoutError)}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <LoaderIcon class="h-6 w-6 text-blue-400 animate-spin mx-auto mb-2" />
          <p class="text-xs text-gray-400 font-mono">Chargement des horaires...</p>
        </div>
      </div>
    {:else if timeoutError}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <p class="text-xs text-yellow-400 font-mono mb-2">
            Le chargement prend plus de temps que prévu
          </p>
          <button
            on:click={loadSchedule}
            class="hover:cursor-pointer px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all text-sm font-mono text-blue-300"
          >
            Réessayer
          </button>
        </div>
      </div>
    {:else if error}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <p class="text-xs text-red-400 font-mono mb-2">Erreur de chargement</p>
          <button
            on:click={loadSchedule}
            class="hover:cursor-pointer px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all text-sm font-mono text-blue-300"
          >
            Réessayer
          </button>
        </div>
      </div>
    {:else}
      <div>
        <div class="mb-3 flex items-center space-x-2">
          <svg
            class="h-4 w-4 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            {#if currentDirection === 'up'}
              <path d="M12 19V5M5 12l7-7 7 7" />
            {:else}
              <path d="M12 5v14M5 12l7 7 7-7" />
            {/if}
          </svg>
          <span class="text-sm font-mono text-blue-300 uppercase tracking-wider">
            Direction {currentDirection === 'up' ? 'haute ville' : 'basse ville'}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          {#each buses.filter((bus) => bus.direction === currentDirection) as bus}
            {#if schedules[getBusKey(bus)] && schedules[getBusKey(bus)].horaires}
              <div class="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <!-- Informations de l'arrêt -->
                <div class="mb-3">
                  <div class="flex items-center space-x-2 mb-1">
                    <MapPinIcon class="h-3 w-3 text-blue-400" />
                    <span class="text-xs text-blue-300 font-mono">
                      {schedules[getBusKey(bus)].arret?.description || 'Arrêt inconnu'}
                    </span>
                  </div>
                  <div class="text-xs text-gray-400 font-mono">
                    Ligne {schedules[getBusKey(bus)].parcours?.noParcours || '?'} - {schedules[
                      getBusKey(bus)
                    ].parcours?.descriptionDirection || 'Ligne inconnue'}
                  </div>
                </div>

                <!-- Horaires -->
                <div class="space-y-2">
                  {#each schedules[getBusKey(bus)].horaires.slice(0, 2) as horaire}
                    <div class="p-2 bg-blue-500/20 rounded-lg">
                      <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                          <ClockIcon class="h-3 w-3 text-blue-400" />
                          <span class="text-xs font-medium text-white"
                            >{formatTime(horaire.depart)}</span
                          >
                        </div>
                        <div class="text-xs text-blue-300 font-mono">
                          {horaire.departMinutes} min
                        </div>
                      </div>
                      <div class="text-xs text-gray-400 font-mono mt-1">
                        {horaire.nomDestination || 'Destination inconnue'}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
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
