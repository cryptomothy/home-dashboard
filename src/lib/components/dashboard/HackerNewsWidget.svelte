<script lang="ts">
	import { onMount } from 'svelte';
	import { hackerNewsService } from '$lib/services/hackerNewsService';
	import { 
		TerminalIcon,
		RefreshCwIcon,
		LoaderIcon,
		ExternalLinkIcon,
		MessageCircleIcon
	} from 'lucide-svelte';
	
	let stories: any[] = [];
	let loading = true;
	let error = false;
	let lastUpdated = new Date();
	
	async function loadStories() {
		try {
			loading = true;
			error = false;
			stories = await hackerNewsService.getTopStories(3);
			lastUpdated = new Date();
		} catch (e) {
			console.error('Erreur lors du chargement des histoires:', e);
			error = true;
		} finally {
			setTimeout(() => {
				loading = false;
			}, 1000);
		}
	}
	
	function openUrl(url: string) {
		window.open(url, '_blank', 'noopener,noreferrer');
	}
	
	onMount(() => {
		loadStories();
		
		// Rafraîchir chaque demi-heure (1800000 ms)
		const interval = setInterval(loadStories, 1800000);
		
		// Nettoyer l'interval au démontage
		return () => clearInterval(interval);
	});
</script>

<div class="col-span-4 glassmorphism rounded-2xl overflow-hidden tech-glow-orange">
	<div class="p-3 flex flex-col">
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center space-x-2">
				<TerminalIcon class="h-4 w-4 text-orange-400" />
				<span class="text-sm font-mono text-orange-300 uppercase tracking-wider">Hacker News</span>
			</div>
			<button 
				on:click={loadStories}
				disabled={loading}
				class="p-1 rounded-lg bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 transition-all disabled:opacity-50"
			>
				<RefreshCwIcon class="h-3 w-3 text-orange-400 {loading ? 'animate-spin' : ''}" />
			</button>
		</div>
		
		{#if loading || stories.length === 0}
			<div class="flex items-center justify-center py-8">
				<div class="text-center">
					<LoaderIcon class="h-6 w-6 text-orange-400 animate-spin mx-auto mb-2" />
					<p class="text-xs text-gray-400 font-mono">Chargement des actualités...</p>
				</div>
			</div>
		{:else if error && stories.length === 0}
			<div class="flex items-center justify-center py-8">
				<div class="text-center">
					<p class="text-xs text-red-400 font-mono mb-2">Erreur de chargement</p>
					<button 
						on:click={loadStories}
						class="text-xs text-orange-400 font-mono hover:text-orange-300 transition-colors"
					>
						Réessayer
					</button>
				</div>
			</div>
		{:else}
			<!-- Stories -->
			<div class="space-y-2">
				{#each stories as story}
					<div 
						class="p-2 bg-orange-500/10 rounded-lg border border-orange-500/30 hover:border-orange-400/50 transition-all cursor-pointer"
						on:click={() => openUrl(story.url)}
					>
						<div class="flex justify-between items-start mb-1">
							<p class="text-xs font-medium text-white leading-tight">{story.title}</p>
							<ExternalLinkIcon class="h-3 w-3 text-orange-400 flex-shrink-0 ml-1 mt-0.5" />
						</div>
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center space-x-1">
								<MessageCircleIcon class="h-3 w-3 text-orange-400" />
								<span class="text-orange-300 font-mono">{story.score}pts • {story.comments} commentaires</span>
							</div>
							<span class="text-gray-400 font-mono">@{story.author}</span>
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