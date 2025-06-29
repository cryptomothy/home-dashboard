import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'WalkiWorki/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
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

    return json(
      {
        error: 'Erreur lors de la récupération des véhicules Communauto',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
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
