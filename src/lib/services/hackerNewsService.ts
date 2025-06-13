interface HNItem {
	id: number;
	title: string;
	url?: string;
	score: number;
	by: string;
	time: number;
	descendants: number;
}

interface HNStory {
	title: string;
	url: string;
	score: number;
	author: string;
	comments: number;
	publishedAt: Date;
}

export class HackerNewsService {
	private apiUrl = 'https://hacker-news.firebaseio.com/v0';
	
	async getTopStories(limit: number = 5): Promise<HNStory[]> {
		try {
			// Récupérer la liste des IDs des meilleures histoires
			const response = await fetch(`${this.apiUrl}/topstories.json`);
			if (!response.ok) {
				throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
			}
			
			const storyIds: number[] = await response.json();
			
			// Récupérer les détails des histoires (limité au nombre demandé)
			const stories = await Promise.all(
				storyIds.slice(0, limit).map(id => this.getItem(id))
			);
			
			// Filtrer les histoires sans URL (les "Ask HN" et "Show HN")
			return stories
				.filter(story => story.url)
				.map(story => ({
					title: story.title,
					url: story.url!,
					score: story.score,
					author: story.by,
					comments: story.descendants,
					publishedAt: new Date(story.time * 1000)
				}));
				
		} catch (error) {
			console.error('Erreur lors de la récupération des histoires HN:', error);
			throw error;
		}
	}
	
	private async getItem(id: number): Promise<HNItem> {
		const response = await fetch(`${this.apiUrl}/item/${id}.json`);
		if (!response.ok) {
			throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
		}
		return response.json();
	}
	
	formatPublishDate(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		
		if (diffMins < 60) {
			return `Il y a ${diffMins} min`;
		} else if (diffHours < 24) {
			return `Il y a ${diffHours}h`;
		} else if (diffDays === 1) {
			return 'Hier';
		} else {
			return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
		}
	}
}

export const hackerNewsService = new HackerNewsService(); 