<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		CloudIcon, 
		SunIcon, 
		WindIcon, 
		EyeIcon, 
		SunriseIcon, 
		SunsetIcon,
		DropletsIcon,
		ZapIcon,
		CloudRainIcon,
		CloudSnowIcon,
		LoaderIcon
	} from 'lucide-svelte';
	import { weatherService, type WeatherData } from '$lib/services/weatherService';

	// État du composant
	let weatherData: WeatherData | null = null;
	let loading = true;
	let error = false;
	let lastUpdated = new Date();

	// Charger les données météo au montage du composant
	onMount(() => {
		loadWeatherData();
		
		// Rafraîchir toutes les heures (3600000 ms)
		const interval = setInterval(loadWeatherData, 3600000);
		
		// Nettoyer l'interval au démontage
		return () => clearInterval(interval);
	});
	
	async function loadWeatherData() {
		try {
			loading = true;
			error = false;
			weatherData = await weatherService.getCurrentWeather();
			lastUpdated = new Date();
			console.log('🌤️ Données météo rechargées à', lastUpdated.toLocaleTimeString());
		} catch (err) {
			console.error('Erreur lors du chargement des données météo:', err);
			error = true;
		} finally {
			setTimeout(() => {
				loading = false;
			}, 1000);
		}
	}

	function getWeatherIcon(iconType: string, size: string = 'h-3 w-3') {
		switch (iconType) {
			case 'sun':
				return SunIcon;
			case 'cloud':
				return CloudIcon;
			case 'rain':
				return CloudRainIcon;
			case 'snow':
				return CloudSnowIcon;
			default:
				return SunIcon;
		}
	}

	// Fonction pour rafraîchir manuellement les données
	function refreshWeather() {
		loadWeatherData();
	}
</script>

<div class="col-span-3 row-span-2 glassmorphism rounded-2xl overflow-hidden min-h-[320px] tech-glow">
	<div class="p-3 h-full flex flex-col">
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center space-x-2">
				<ZapIcon class="h-4 w-4 text-cyan-400" />
				<span class="text-sm font-mono text-cyan-300 uppercase tracking-wider">Météo</span>
			</div>
			<button 
				on:click={refreshWeather}
				disabled={loading}
				class="p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all disabled:opacity-50"
			>
				<LoaderIcon class="h-3 w-3 text-cyan-400 {loading ? 'animate-spin' : ''}" />
			</button>
		</div>
		
		{#if loading}
			<div class="flex-1 flex items-center justify-center">
				<div class="text-center">
					<LoaderIcon class="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-2" />
					<p class="text-xs text-gray-400 font-mono">Chargement...</p>
				</div>
			</div>
		{:else if error}
			<div class="flex-1 flex items-center justify-center">
				<div class="text-center">
					<p class="text-xs text-red-400 font-mono mb-2">Erreur de chargement</p>
					<button 
						on:click={refreshWeather}
						class="text-xs text-cyan-400 font-mono hover:text-cyan-300 transition-colors"
					>
						Réessayer
					</button>
				</div>
			</div>
		{:else if weatherData}
			<div class="flex-1 space-y-3">
				<!-- Conditions actuelles -->
				<div class="flex items-center justify-between">
					<div>
						<div class="text-3xl font-mono font-bold text-white">
							{weatherData.current.temp}<span class="text-cyan-400">°</span>
						</div>
						<p class="text-sm text-gray-300 font-mono capitalize">{weatherData.current.condition}</p>
						<p class="text-xs text-gray-400 font-mono">Ressenti {weatherData.current.feelsLike}°</p>
					</div>
					<div class="grid grid-cols-2 gap-2 text-xs font-mono">
						<div class="flex items-center space-x-1 bg-blue-500/20 rounded-lg p-1.5">
							<DropletsIcon class="h-3 w-3 text-blue-400" />
							<span class="text-blue-300">{weatherData.current.humidity}%</span>
						</div>
						<div class="flex items-center space-x-1 bg-gray-500/20 rounded-lg p-1.5">
							<WindIcon class="h-3 w-3 text-gray-400" />
							<span class="text-gray-300">{weatherData.current.windSpeed}</span>
						</div>
						<div class="flex items-center space-x-1 bg-yellow-500/20 rounded-lg p-1.5">
							<EyeIcon class="h-3 w-3 text-yellow-400" />
							<span class="text-yellow-300">UV{weatherData.current.uvIndex}</span>
						</div>
						<div class="flex items-center space-x-1 bg-green-500/20 rounded-lg p-1.5">
							<CloudIcon class="h-3 w-3 text-green-400" />
							<span class="text-green-300">{weatherData.current.airQuality}</span>
						</div>
					</div>
				</div>
				
				<!-- Lever/Coucher du soleil -->
				<div class="border-t border-cyan-500/30 pt-2">
					<div class="flex justify-between text-xs font-mono mb-2">
						<div class="flex items-center space-x-1 text-orange-300">
							<SunriseIcon class="h-3 w-3" />
							<span>{weatherData.sun.sunrise}</span>
						</div>
						<div class="flex items-center space-x-1 text-red-300">
							<SunsetIcon class="h-3 w-3" />
							<span>{weatherData.sun.sunset}</span>
						</div>
					</div>
				</div>
				
				<!-- Prévisions aujourd'hui -->
				<div>
					<h4 class="text-xs font-mono text-cyan-300 mb-2 uppercase tracking-wider">Aujourd'hui</h4>
					<div class="grid grid-cols-4 gap-1">
						{#each weatherData.today as forecast}
							<div class="text-center p-1.5 bg-gray-900/50 rounded-lg border border-gray-700/50">
								<div class="text-xs text-gray-400 font-mono">{forecast.time}</div>
								<svelte:component this={getWeatherIcon(forecast.icon)} class="h-5 w-5 mx-auto text-yellow-400 my-1" />
								<div class="text-xs font-mono text-white">{forecast.temp}°</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Prévisions demain -->
				<div class="border-t border-cyan-500/30 pt-2">
					<h4 class="text-xs font-mono text-cyan-300 mb-2 uppercase tracking-wider">Demain</h4>
					<div class="bg-cyan-500/10 rounded-lg border border-cyan-500/30 p-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-2">
								<svelte:component this={getWeatherIcon(weatherData.tomorrow.icon)} class="h-4 w-4 text-cyan-400" />
								<div>
									<p class="text-xs font-mono text-white capitalize">{weatherData.tomorrow.condition}</p>
									<p class="text-xs font-mono text-gray-400">Précip. {weatherData.tomorrow.precipitation}%</p>
								</div>
							</div>
							<div class="text-right">
								<div class="flex items-center space-x-1">
									<span class="text-sm font-mono font-bold text-white">{weatherData.tomorrow.high}°</span>
									<span class="text-xs font-mono text-gray-400">/{weatherData.tomorrow.low}°</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Dernière mise à jour -->
			<div class="mt-2 text-center">
				<p class="text-xs text-gray-500 font-mono">
					Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
				</p>
			</div>
		{/if}
	</div>
</div> 