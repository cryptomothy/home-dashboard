import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    console.log('🧪 Test de connectivité API Communauto...');

    const testUrl =
      'https://restapifrontoffice.reservauto.net/api/v2/Vehicle/FreeFloatingAvailability?CityId=90';

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'WalkiWorki-Test/1.0',
        Connection: 'close',
      },
      signal: AbortSignal.timeout(10000), // 10 secondes de timeout
    });

    console.log('🧪 Réponse test:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Impossible de lire l'erreur");
      return json(
        {
          success: false,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          timestamp: new Date().toISOString(),
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    return json({
      success: true,
      status: response.status,
      totalVehicles: data.totalNbVehicles || 0,
      timestamp: new Date().toISOString(),
      message: 'API Communauto accessible',
    });
  } catch (error) {
    console.error('🧪 Erreur test API Communauto:', error);

    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
};
