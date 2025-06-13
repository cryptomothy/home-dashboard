<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		NewspaperIcon,
		RefreshCwIcon,
		LoaderIcon,
		ExternalLinkIcon,
		GlobeIcon
	} from 'lucide-svelte';
	import { newsService } from '$lib/services/newsService';
	import type { NewsArticle } from '$lib/types/news';

	// État du composant
	let articles: NewsArticle[] = [];
	let loading = true;
	let error = false;
	let lastUpdated = new Date();

	// Charger les données au montage du composant
	onMount(() => {
		loadNewsData();
		
		// Rafraîchir chaque demi-heure (1800000 ms)
		const interval = setInterval(loadNewsData, 1800000);
		
		// Nettoyer l'interval au démontage
		return () => clearInterval(interval);
	});

	async function loadNewsData() {
		try {
			loading = true;
			error = false;
			
			articles = await newsService.getTopHeadlines('general', 5);
			lastUpdated = new Date();
			
			console.log('📰 Actualités rechargées à', lastUpdated.toLocaleTimeString());
		} catch (err) {
			console.error('Erreur lors du chargement des actualités:', err);
			error = true;
		} finally {
			setTimeout(() => {
				loading = false;
			}, 1000);
		}
	}

	// Fonction pour rafraîchir manuellement
	function refreshNews() {
		loadNewsData();
	}
	
	// Ouvrir le lien dans un nouvel onglet
	function openArticle(url: string) {
		window.open(url, '_blank', 'noopener,noreferrer');
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
		
		if (diffInHours < 1) {
			const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
			return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
		} else if (diffInHours < 24) {
			return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
		} else {
			return date.toLocaleDateString('fr-FR', {
				day: 'numeric',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit'
			});
		}
	}
</script>

<div class="col-span-4 glassmorphism rounded-2xl overflow-hidden tech-glow-cyan">
	<div class="p-3 flex flex-col">
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center space-x-2">
				<NewspaperIcon class="h-4 w-4 text-cyan-400" />
				<span class="text-sm font-mono text-cyan-300 uppercase tracking-wider">Actualités</span>
			</div>
			<button 
				on:click={refreshNews}
				disabled={loading}
				class="p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
			>
				<RefreshCwIcon class="h-3 w-3 text-cyan-400 {loading ? 'animate-spin' : ''}" />
			</button>
		</div>
		
		{#if loading || articles.length === 0}
			<div class="flex items-center justify-center py-8">
				<div class="text-center">
					<LoaderIcon class="h-6 w-6 text-cyan-400 animate-spin mx-auto mb-2" />
					<p class="text-xs text-gray-400 font-mono">Chargement des actualités...</p>
				</div>
			</div>
		{:else if error && articles.length === 0}
			<div class="flex items-center justify-center py-8">
				<div class="text-center">
					<p class="text-xs text-red-400 font-mono mb-2">Erreur de chargement</p>
					<button 
						on:click={refreshNews}
						class="text-xs text-cyan-400 font-mono hover:text-cyan-300 transition-colors"
					>
						Réessayer
					</button>
				</div>
			</div>
		{:else}
			<!-- Articles -->
			<div class="space-y-2">
				{#each articles as article}
					<div 
						class="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer"
						on:click={() => openArticle(article.url)}
					>
						<div class="flex justify-between items-start mb-1">
							<p class="text-xs font-medium text-white leading-tight">{article.title}</p>
							<ExternalLinkIcon class="h-3 w-3 text-cyan-400 flex-shrink-0 ml-1 mt-0.5" />
						</div>
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center space-x-1">
								<GlobeIcon class="h-3 w-3 text-cyan-400" />
								<span class="text-cyan-300 font-mono">{article.source}</span>
							</div>
							<span class="text-gray-400 font-mono">{formatDate(article.publishedAt)}</span>
						</div>
					</div>
				{/each}
			</div>
			
			<!-- Dernière mise à jour -->
			<div class="mt-3 text-center">
				<p class="text-xs text-gray-500 font-mono">
					Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
				</p>
			</div>
		{/if}
	</div>
</div> 