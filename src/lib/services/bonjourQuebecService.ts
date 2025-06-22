// Types pour les événements de Bonjour Québec
export interface BonjourQuebecEvent {
  id: string;
  title: string;
  url: string;
  image: string;
  dates: string;
  category: string;
  region: string;
}

export interface BonjourQuebecResponse {
  events: BonjourQuebecEvent[];
  totalResults: number;
  currentPage: number;
}

class BonjourQuebecService {
  private baseUrl =
    'https://www.bonjourquebec.com/fr-ca/quoi-faire/festivals-et-evenements/fetes-et-festivals';

  async getEvents(
    filters: {
      season?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
    } = {},
  ): Promise<BonjourQuebecResponse> {
    try {
      console.log('📅 Récupération des événements Bonjour Québec...');

      console.log('🔍 Filters:', filters);

      // Préparer les données du formulaire
      const formData = new FormData();
      formData.append('form_id', 'tq_search_search_form');

      if (filters.season) {
        formData.append('filters[level1][dates][inputs][seasons][input]', filters.season);
      }

      if (filters.startDate) {
        formData.append('filters[level1][dates][inputs][custom][dates][start]', filters.startDate);
      }

      if (filters.endDate) {
        formData.append('filters[level1][dates][inputs][custom][dates][end]', filters.endDate);
      }

      if (filters.page !== undefined) {
        formData.append('page', filters.page.toString());
      }

      formData.append('filters[level1][regions][inputs][quebec]', '1');

      console.log('📡 Utilisation du proxy local pour contourner CORS');

      // Utiliser notre proxy local
      const response = await fetch('/api/bonjour-quebec', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ Données JSON récupérées avec succès, parsing en cours...');

      // Extraire le HTML de la propriété data qui contient un textarea
      let html = '';
      if (responseData.data && typeof responseData.data === 'string') {
        // La propriété data contient le HTML directement
        html = responseData.data;
        console.log('✅ HTML extrait de la propriété data');
      } else if (Array.isArray(responseData)) {
        // Chercher l'objet avec command "insert" qui contient le HTML
        const insertObject = responseData.find((obj) => obj.command === 'insert' && obj.data);
        if (insertObject) {
          html = insertObject.data;
          console.log('✅ HTML extrait de l\'objet "insert"');
        } else {
          console.warn('⚠️ Aucun objet avec command "insert" trouvé dans la réponse');
          return { events: [], totalResults: 0, currentPage: 0 };
        }
      } else {
        console.warn('⚠️ Structure de réponse inattendue:', responseData);
        return { events: [], totalResults: 0, currentPage: 0 };
      }

      // Si le HTML est dans un textarea, l'extraire
      if (html.includes('<textarea>')) {
        const textareaMatch = html.match(/<textarea>([\s\S]*?)<\/textarea>/);
        if (textareaMatch) {
          const textareaContent = textareaMatch[1];
          console.log('✅ Contenu du textarea extrait');

          // Essayer de parser le contenu du textarea comme JSON
          try {
            const jsonData = JSON.parse(textareaContent);
            console.log('✅ JSON du textarea parsé avec succès');

            // Chercher l'objet avec command "insert" qui contient le HTML
            if (Array.isArray(jsonData)) {
              const insertObject = jsonData.find((obj) => obj.command === 'insert' && obj.data);
              if (insertObject) {
                html = insertObject.data;
                console.log('✅ HTML extrait de l\'objet "insert" dans le JSON du textarea');
              } else {
                console.warn(
                  '⚠️ Aucun objet avec command "insert" trouvé dans le JSON du textarea',
                );
                return { events: [], totalResults: 0, currentPage: 0 };
              }
            } else {
              console.warn("⚠️ Le JSON du textarea n'est pas un array");
              return { events: [], totalResults: 0, currentPage: 0 };
            }
          } catch (parseError) {
            console.error('❌ Erreur lors du parsing du JSON du textarea:', parseError);
            return { events: [], totalResults: 0, currentPage: 0 };
          }
        }
      }

      return this.parseEventsFromHtml(html);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements Bonjour Québec:', error);
      throw error;
    }
  }

  private parseEventsFromHtml(htmlString: string): BonjourQuebecResponse {
    // Créer un DOM parser pour analyser le HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const events: BonjourQuebecEvent[] = [];
    const eventElements = doc.querySelectorAll('.tq-fiche--mini-fiche');

    eventElements.forEach((element) => {
      const linkElement = element.querySelector('.tq-fiche--mini-fiche__link') as HTMLAnchorElement;
      const imageElement = element.querySelector('img') as HTMLImageElement;
      const metaElement = element.querySelector('.tq-fiche--mini-fiche__meta span');
      const categoryElement = element.querySelector('.tq-fiche--mini-fiche__category');
      const regionElement = element.querySelector('.tq-fiche--mini-fiche__region');

      if (linkElement) {
        const event: BonjourQuebecEvent = {
          id: element.getAttribute('data-element-id') || this.generateId(),
          title: linkElement.textContent?.trim() || 'Titre non disponible',
          url: linkElement.href || '#',
          image:
            imageElement?.src ||
            'https://www.bonjourquebec.com/themes/custom/tq_glider/images/fiches/default_images/evenement.png?width=260&height=300&crop=1',
          dates: metaElement?.textContent?.trim() || 'Dates non disponibles',
          category: categoryElement?.textContent?.trim() || 'Événement',
          region: regionElement?.textContent?.trim() || 'Région non spécifiée',
        };
        events.push(event);
      }
    });

    // Extraire le nombre total de résultats
    const totalResultsElement = doc.querySelector('.search-results--header--count');
    let totalResults = 0;
    if (totalResultsElement) {
      const match = totalResultsElement.textContent?.match(/(\d+)/);
      totalResults = match ? parseInt(match[1]) : 0;
    }

    // Déterminer la page courante
    const currentPageElement = doc.querySelector('.pager__item--active .pager__link');
    let currentPage = 0;
    if (currentPageElement) {
      const pageMatch = currentPageElement.getAttribute('data-pageId');
      currentPage = pageMatch ? parseInt(pageMatch) : 0;
    }

    console.log(`✅ ${events.length} événements parsés sur ${totalResults} total`);

    return {
      events,
      totalResults,
      currentPage,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Méthode utilitaire pour formater les dates
  formatEventDates(datesString: string): string {
    // Nettoyer et formater les dates
    // Remplacer les espaces multiples par un seul espace
    let formatted = datesString.replace(/\s+/g, ' ').trim();

    // Ajouter des tirets entre les jours (ex: "27 29 juin" -> "27 - 29 juin")
    // Pattern: chiffre + espace + chiffre + espace + mois
    formatted = formatted.replace(/(\d+)\s+(\d+)\s+([a-zA-ZÀ-ÿ]+)/g, '$1 - $2 $3');

    // Ajouter des tirets entre les dates de différents mois (ex: "14 juin 5 oct. 2025" -> "14 juin - 5 oct. 2025")
    // Pattern: jour + mois + espace + jour + mois (avec année optionnelle)
    formatted = formatted.replace(
      /(\d+\s+[a-zA-ZÀ-ÿ]+\.?)\s+(\d+\s+[a-zA-ZÀ-ÿ]+\.?(?:\s+\d{4})?)/g,
      '$1 - $2',
    );

    // Normaliser les tirets existants
    formatted = formatted.replace(/\s+-\s+/g, ' - ');

    // Nettoyer les espaces multiples restants
    formatted = formatted.replace(/\s+/g, ' ').trim();

    return formatted;
  }

  // Méthode pour obtenir les événements d'été (par défaut)
  async getSummerEvents(): Promise<BonjourQuebecResponse> {
    return this.getEvents({
      season: 'summer',
      startDate: new Date()
        .toLocaleDateString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .split('-')
        .reverse()
        .join('-'),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('fr-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .split('-')
        .reverse()
        .join('-'),
    });
  }
}

export const bonjourQuebecService = new BonjourQuebecService();
