<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ActivityIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    LoaderIcon,
    RefreshCwIcon,
  } from 'lucide-svelte';
  import { cryptoService, type CryptoData } from '$lib/services/cryptoService';

  // État du composant
  let cryptoData: CryptoData[] = [];
  let loading = true;
  let error = false;
  let lastUpdated = new Date();

  // Charger les données crypto au montage du composant
  onMount(() => {
    loadCryptoData();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadCryptoData, 900000);

    // Nettoyer l'interval au démontage
    return () => clearInterval(interval);
  });

  async function loadCryptoData() {
    try {
      loading = true;
      error = false;
      cryptoData = await cryptoService.getCryptoPrices();
      lastUpdated = new Date();
      console.log('💰 Données crypto rechargées à', lastUpdated.toLocaleTimeString());
    } catch (err) {
      console.error('Erreur lors du chargement des données crypto:', err);
      error = true;
    } finally {
      setTimeout(() => {
        loading = false;
      }, 1000);
    }
  }

  // Fonction pour rafraîchir manuellement
  async function refreshCrypto() {
    await loadCryptoData();
  }
</script>

<div class="col-span-4 glassmorphism rounded-2xl overflow-hidden tech-glow-green">
  <div class="p-3 flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <ActivityIcon class="h-4 w-4 text-green-400" />
        <span class="text-sm font-mono text-green-300 uppercase tracking-wider">Cryptomonnaies</span
        >
      </div>
      <button
        on:click={refreshCrypto}
        disabled={loading}
        class="p-1 rounded-lg bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
      >
        <RefreshCwIcon class="h-3 w-3 text-green-400 {loading ? 'animate-spin' : ''}" />
      </button>
    </div>

    {#if loading || cryptoData.length === 0}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <LoaderIcon class="h-6 w-6 text-green-400 animate-spin mx-auto mb-2" />
          <p class="text-xs text-gray-400 font-mono">Chargement des prix...</p>
        </div>
      </div>
    {:else if error && cryptoData.length === 0}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <p class="text-xs text-red-400 font-mono mb-2">Erreur de chargement</p>
          <button
            on:click={refreshCrypto}
            class="text-xs text-green-400 font-mono hover:text-green-300 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-2 gap-3">
        {#each cryptoData as crypto}
          <div class="p-3 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
            <div class="mb-2">
              <p class="text-sm font-mono font-bold text-white">{crypto.symbol}</p>
              <p class="text-xs text-green-300 font-mono">{crypto.name}</p>
            </div>

            <div class="mb-2">
              <p class="text-lg font-mono font-bold text-white">
                {cryptoService.formatPrice(crypto.price)}
              </p>
            </div>

            <div class="flex items-center justify-center space-x-1">
              {#if crypto.isUp}
                <TrendingUpIcon class="h-3 w-3 text-green-400" />
                <span class="text-xs text-green-400 font-mono">
                  {cryptoService.formatChange(crypto.change24h)}
                </span>
              {:else}
                <TrendingDownIcon class="h-3 w-3 text-red-400" />
                <span class="text-xs text-red-400 font-mono">
                  {cryptoService.formatChange(crypto.change24h)}
                </span>
              {/if}
            </div>

            <p class="text-xs text-gray-400 font-mono mt-1">24h</p>
          </div>
        {/each}
      </div>

      <div class="mt-2 text-center">
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
