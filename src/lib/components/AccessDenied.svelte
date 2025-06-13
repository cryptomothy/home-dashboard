<script lang="ts">
	import { ShieldAlertIcon } from 'lucide-svelte';
	
	export let ip: string;
</script>

<div class="min-h-screen flex items-center justify-center bg-black p-4">
	<div class="glassmorphism rounded-2xl p-8 max-w-md w-full text-center">
		<div class="flex justify-center mb-6">
			<ShieldAlertIcon class="h-16 w-16 text-red-400" />
		</div>
		<h1 class="text-2xl font-bold text-white mb-4">Accès Refusé</h1>
		<p class="text-gray-400 mb-6">
			Votre adresse IP n'est pas autorisée à accéder à cette application.
			Veuillez contacter l'administrateur pour obtenir l'accès.
		</p>
		<div class="text-sm text-gray-500 font-mono">
			Votre IP actuelle : <span class="text-orange-400">{ip}</span>
		</div>
	</div>
</div> 