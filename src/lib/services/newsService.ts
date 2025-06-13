import type { NewsArticle } from '$lib/types/news';

interface NewsAPIResponse {
	data: Array<{
		title: string;
		description: string;
		url: string;
		imageUrl: string;
		source: string;
		published_at: string;
	}>;
}

export class NewsService {
	private apiUrl = 'https://api.thenewsapi.com/v1/news/top';
	
	async getTopHeadlines(category: string = 'general', pageSize: number = 5): Promise<NewsArticle[]> {
		try {
			console.log(`📰 Récupération des actualités pour catégorie: ${category}...`);
			
			// Récupérer la clé API depuis les variables d'environnement
			const apiToken = import.meta.env.VITE_NEWS_API_TOKEN;
			
			console.log('Token API disponible:', apiToken ? 'Oui' : 'Non');
			
			if (!apiToken) {
				throw new Error('Token API The News API manquant. Veuillez ajouter VITE_NEWS_API_TOKEN dans le fichier .env');
			}
			
			// Construire l'URL avec des paramètres optimisés
			const url = new URL(`${this.apiUrl}`);
			url.searchParams.append('api_token', apiToken);
			url.searchParams.append('language', 'en');
			url.searchParams.append('locale', 'us');
			url.searchParams.append('categories', category);
			
			console.log('URL de requête:', url.toString());
			
			const response = await fetch(url);
			console.log('Statut de la réponse:', response.status);
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Erreur API:', errorText);
				throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
			}
			
			const responseText = await response.text();
			
			const data: NewsAPIResponse = JSON.parse(responseText);
			
			// Transformer les données pour correspondre à notre interface NewsArticle
			return data.data.map(article => {
        return {
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.imageUrl,
          source: article.source,
          publishedAt: article.published_at
        };
      });
			
		} catch (error) {
			console.error('Erreur lors de la récupération des actualités:', error);
			throw error;
		}
	}
	
	formatPublishDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
}

export const newsService = new NewsService();