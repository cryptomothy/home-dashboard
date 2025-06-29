<script lang="ts">
  import { onMount } from 'svelte';
  import { CUSTOM_MAP_STYLE_ID, getMapConfig, getMapStyles } from '$lib/config/mapStyles';

  let envVars: Record<string, string> = {};
  let mapConfig: any = {};
  let mapStyles: any = null;

  onMount(() => {
    // Récupérer toutes les variables d'environnement VITE_
    envVars = Object.keys(import.meta.env)
      .filter((key) => key.startsWith('VITE_'))
      .reduce(
        (acc, key) => {
          acc[key] = import.meta.env[key];
          return acc;
        },
        {} as Record<string, string>,
      );

    mapConfig = getMapConfig();
    mapStyles = getMapStyles();
  });
</script>

<svelte:head>
  <title>Debug Map Styles - WalkiWorki</title>
</svelte:head>

<div class="container mx-auto p-6 max-w-4xl">
  <h1 class="text-2xl font-bold mb-6 text-green-400">Debug Map Styles</h1>

  <div class="grid gap-6">
    <!-- Variables d'environnement -->
    <div class="bg-gray-800 rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-3 text-green-300">Variables d'environnement</h2>
      <div class="space-y-2">
        {#each Object.entries(envVars) as [key, value]}
          <div class="flex justify-between items-center">
            <span class="text-gray-300 font-mono text-sm">{key}:</span>
            <span class="text-gray-100 font-mono text-sm">
              {value ? value.substring(0, 20) + (value.length > 20 ? '...' : '') : 'undefined'}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Configuration de la carte -->
    <div class="bg-gray-800 rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-3 text-green-300">Configuration de la carte</h2>
      <pre class="text-xs text-gray-300 overflow-auto">{JSON.stringify(mapConfig, null, 2)}</pre>
    </div>

    <!-- Styles de la carte -->
    <div class="bg-gray-800 rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-3 text-green-300">Styles de la carte</h2>
      <div class="mb-2">
        <span class="text-gray-300">CUSTOM_MAP_STYLE_ID:</span>
        <span class="text-gray-100 font-mono ml-2">{CUSTOM_MAP_STYLE_ID || 'Non défini'}</span>
      </div>
      <div class="mb-2">
        <span class="text-gray-300">Styles utilisés:</span>
        <span class="text-gray-100 font-mono ml-2">
          {CUSTOM_MAP_STYLE_ID ? 'Style personnalisé' : 'Styles inline'}
        </span>
      </div>
      {#if mapStyles}
        <details class="mt-3">
          <summary class="text-gray-300 cursor-pointer">Voir les styles inline</summary>
          <pre class="text-xs text-gray-300 overflow-auto mt-2">{JSON.stringify(
              mapStyles,
              null,
              2,
            )}</pre>
        </details>
      {/if}
    </div>

    <!-- Instructions -->
    <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-3 text-blue-300">Instructions</h2>
      <div class="space-y-2 text-sm text-gray-300">
        <p>
          1. Vérifiez que <code class="bg-gray-700 px-1 rounded">VITE_GOOGLE_MAPS_STYLE_ID</code>
          est défini dans votre fichier <code class="bg-gray-700 px-1 rounded">.env</code>
        </p>
        <p>
          2. L'ID doit être au format: <code class="bg-gray-700 px-1 rounded"
            >xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code
          >
        </p>
        <p>
          3. Redémarrez le serveur de développement après avoir modifié le fichier <code
            class="bg-gray-700 px-1 rounded">.env</code
          >
        </p>
        <p>4. Vérifiez que votre style est bien publié sur Google Cloud Console</p>
      </div>
    </div>
  </div>
</div>
