import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Fonction pour faire une requête avec retry
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚗 Tentative ${attempt}/${maxRetries} pour l'API Communauto`);

      const response = await fetch(url, {
        ...options,
        // Ajouter un timeout pour éviter les requêtes qui traînent
        signal: AbortSignal.timeout(15000), // 15 secondes de timeout
      });

      console.log(`🚗 Réponse reçue (tentative ${attempt}):`, response.status, response.statusText);

      // Si c'est une erreur 421, on réessaie
      if (response.status === 421 && attempt < maxRetries) {
        console.log(`🚗 Erreur 421 détectée, nouvelle tentative dans 1 seconde...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      return response;
    } catch (error) {
      console.error(`🚗 Erreur lors de la tentative ${attempt}:`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      // Attendre avant de réessayer
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Toutes les tentatives ont échoué');
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    const cityId = url.searchParams.get('cityId') || '90';

    // Paramètres de géolocalisation optionnels
    const maxLatitude = url.searchParams.get('MaxLatitude');
    const minLatitude = url.searchParams.get('MinLatitude');
    const maxLongitude = url.searchParams.get('MaxLongitude');
    const minLongitude = url.searchParams.get('MinLongitude');

    // Construire l'URL de base
    let apiUrl = `https://restapifrontoffice.reservauto.net/api/v2/Vehicle/FreeFloatingAvailability?CityId=${cityId}`;

    // Ajouter les paramètres de géolocalisation s'ils sont fournis
    const geoParams = [];
    if (maxLatitude) geoParams.push(`MaxLatitude=${maxLatitude}`);
    if (minLatitude) geoParams.push(`MinLatitude=${minLatitude}`);
    if (maxLongitude) geoParams.push(`MaxLongitude=${maxLongitude}`);
    if (minLongitude) geoParams.push(`MinLongitude=${minLongitude}`);

    if (geoParams.length > 0) {
      apiUrl += `&${geoParams.join('&')}`;
    }

    console.log('🚗 Proxy Communauto: Récupération des véhicules pour CityId:', cityId);
    if (geoParams.length > 0) {
      console.log('🚗 Paramètres géolocalisation:', geoParams.join(', '));
    }

    console.log("🚗 URL de l'API Communauto:", apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Impossible de lire le contenu de l'erreur");
      console.error('🚗 Erreur HTTP détaillée:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log(`🚗 Proxy Communauto: ${data.totalNbVehicles} véhicules récupérés`);

    return json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache de 30 secondes
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('🚗 Erreur proxy Communauto:', error);

    // Retourner une réponse d'erreur plus détaillée
    return json(
      {
        error: 'Erreur lors de la récupération des véhicules Communauto',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString(),
        url: url.toString(),
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  }
};
