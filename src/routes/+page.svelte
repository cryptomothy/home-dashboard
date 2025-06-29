<script lang="ts">
  import { onMount } from 'svelte';
  import WeatherWidget from '$lib/components/dashboard/WeatherWidget.svelte';
  import CryptoWidget from '$lib/components/dashboard/CryptoWidget.svelte';
  import BikeWidget from '$lib/components/dashboard/BikeWidget.svelte';
  import NewsWidget from '$lib/components/dashboard/NewsWidget.svelte';
  import HackerNewsWidget from '$lib/components/dashboard/HackerNewsWidget.svelte';
  import AccessDenied from '$lib/components/AccessDenied.svelte';
  import { checkAccess, getAccessStatus } from '$lib/services/ipRestrictionService';
  import BusWidget from '$lib/components/dashboard/BusWidget.svelte';
  import TodoWidget from '$lib/components/dashboard/TodoWidget.svelte';
  import BonjourQuebecWidget from '$lib/components/dashboard/BonjourQuebecWidget.svelte';
  import MapWidget from '$lib/components/dashboard/MapWidget.svelte';
  import WidgetSettingsModal from '$lib/components/WidgetSettingsModal.svelte';

  import { Settings2Icon } from 'lucide-svelte';

  let hasAccess = false;
  let loading = true;
  let accessMessage = '';
  let showSettings = false;

  let availableWidgets = [
    {
      name: 'weather',
      active: true,
      component: WeatherWidget,
    },
    {
      name: 'todo',
      active: true,
      component: TodoWidget,
    },
    {
      name: 'bike',
      active: true,
      component: BikeWidget,
    },
    {
      name: 'bus',
      active: true,
      component: BusWidget,
    },
    {
      name: 'map',
      active: true,
      component: MapWidget,
    },
    {
      name: 'bonjourQuebec',
      active: true,
      component: BonjourQuebecWidget,
    },
    {
      name: 'crypto',
      active: false,
      component: CryptoWidget,
    },
    {
      name: 'news',
      active: false,
      component: NewsWidget,
    },
    {
      name: 'hackerNews',
      active: false,
      component: HackerNewsWidget,
    },
  ];

  onMount(async () => {
    const accessStatus = await getAccessStatus();
    hasAccess = accessStatus.allowed;
    accessMessage = accessStatus.message;

    setTimeout(() => {
      loading = false;
    }, 2000);
  });

  function handleWidgetUpdate(event: CustomEvent) {
    availableWidgets = event.detail;
  }

  function handleSettingsClose() {
    showSettings = false;
  }

  // Current time
  let currentTime = new Date();
  setInterval(() => {
    currentTime = new Date();
  }, 1000);
</script>

<svelte:head>
  <title>Tableau de bord</title>
</svelte:head>

{#if loading}
  <div class="min-h-screen flex items-center justify-center bg-black">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400 mx-auto mb-4"
      ></div>
      <p class="text-gray-400 font-mono">Vérification de l'accès...</p>
    </div>
  </div>
{:else if !hasAccess}
  <AccessDenied message={accessMessage} />
{:else}
  <div class="min-h-screen overflow-hidden relative">
    <div class="relative z-10 h-full p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div
              class="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
              style="animation-delay: 0.5s;"
            ></div>
            <div
              class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              style="animation-delay: 1s;"
            ></div>
          </div>
          <div>
            <p class="text-sm text-cyan-300/70 font-mono">
              {currentTime.toLocaleDateString('fr-CA', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button
            on:click={() => (showSettings = true)}
            class="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
          >
            <Settings2Icon class="h-4 w-4 text-purple-400" />
          </button>
          <div class="text-right">
            <p
              class="text-3xl font-mono font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent"
            >
              {currentTime.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="h-[calc(100%-100px)] grid grid-cols-8 auto-rows-min gap-3 content-start">
        {#each availableWidgets as widget}
          {#if widget.active}
            <widget.component />
          {/if}
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if showSettings}
  <WidgetSettingsModal
    {availableWidgets}
    on:update={handleWidgetUpdate}
    on:close={handleSettingsClose}
  />
{/if}
