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

    console.log('🚗 Fallback Communauto: Récupération des véhicules pour CityId:', cityId);
    if (geoParams.length > 0) {
      console.log('🚗 Paramètres géolocalisation:', geoParams.join(', '));
    }

    console.log("🚗 URL de l'API Communauto Fallback:", apiUrl);

    // Approche alternative avec des headers très basiques
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'WalkiWorki/1.0',
        'Accept-Language': 'fr-CA,fr;q=0.9',
        'Cache-Control': 'no-cache',
      },
      // Désactiver le cache pour éviter les problèmes de proxy
      cache: 'no-store',
    });

    console.log('🚗 Réponse reçue Fallback:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Impossible de lire le contenu de l'erreur");
      console.error('🚗 Erreur HTTP détaillée Fallback:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log(`🚗 Fallback Communauto: ${data.totalNbVehicles} véhicules récupérés`);

    return json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('🚗 Erreur Fallback Communauto:', error);

    return json(
      {
        error: 'Erreur lors de la récupération des véhicules Communauto (Fallback)',
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
