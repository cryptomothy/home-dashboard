import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const cityId = url.searchParams.get('cityId') || '90';

    console.log('🚗 API Communauto Simple: Récupération des véhicules pour CityId:', cityId);

    // URL simple sans paramètres de géolocalisation
    const apiUrl = `https://restapifrontoffice.reservauto.net/api/v2/Vehicle/FreeFloatingAvailability?CityId=${cityId}`;

    console.log("🚗 URL de l'API Communauto Simple:", apiUrl);

    // Headers très basiques
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    console.log('🚗 Réponse reçue:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Impossible de lire le contenu de l'erreur");
      console.error('🚗 Erreur HTTP détaillée:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log(`🚗 API Communauto Simple: ${data.totalNbVehicles} véhicules récupérés`);

    return json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('🚗 Erreur API Communauto Simple:', error);

    return json(
      {
        error: 'Erreur lors de la récupération des véhicules Communauto (version simple)',
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
