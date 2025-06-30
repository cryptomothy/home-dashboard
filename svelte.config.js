import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // Utiliser l'adapter Vercel spécifique pour une meilleure compatibilité
    adapter: adapter({
      // Configuration pour éviter les problèmes HTTP/2
      runtime: 'nodejs18.x',
      // Forcer HTTP/1.1 si possible
      external: ['restapifrontoffice.reservauto.net'],
    }),
  },
};

export default config;
