import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const cityId = url.searchParams.get('cityId') || '90';
  const baseUrl = `https://restapifrontoffice.reservauto.net/api/v2/Vehicle/FreeFloatingAvailability?CityId=${cityId}`;

  const results = {
    timestamp: new Date().toISOString(),
    cityId,
    tests: {} as Record<string, any>,
  };

  // Test 1: Approche simple
  try {
    console.log('🧪 Test 1: Approche simple');
    const response1 = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    results.tests.simple = {
      status: response1.status,
      statusText: response1.statusText,
      success: response1.ok,
      data: response1.ok ? await response1.json() : null,
    };
  } catch (error) {
    results.tests.simple = {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      success: false,
    };
  }

  // Test 2: Headers HTTP/1.1
  try {
    console.log('🧪 Test 2: Headers HTTP/1.1');
    const response2 = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; WalkiWorki/1.0)',
        'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'close',
        'Upgrade-Insecure-Requests': '1',
        DNT: '1',
      },
    });

    results.tests.http1 = {
      status: response2.status,
      statusText: response2.statusText,
      success: response2.ok,
      data: response2.ok ? await response2.json() : null,
    };
  } catch (error) {
    results.tests.http1 = {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      success: false,
    };
  }

  // Test 3: Cache désactivé
  try {
    console.log('🧪 Test 3: Cache désactivé');
    const response3 = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'WalkiWorki/1.0',
        'Accept-Language': 'fr-CA,fr;q=0.9',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    });

    results.tests.noCache = {
      status: response3.status,
      statusText: response3.statusText,
      success: response3.ok,
      data: response3.ok ? await response3.json() : null,
    };
  } catch (error) {
    results.tests.noCache = {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      success: false,
    };
  }

  // Test 4: Timeout court
  try {
    console.log('🧪 Test 4: Timeout court');
    const response4 = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    results.tests.timeout = {
      status: response4.status,
      statusText: response4.statusText,
      success: response4.ok,
      data: response4.ok ? await response4.json() : null,
    };
  } catch (error) {
    results.tests.timeout = {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      success: false,
    };
  }

  console.log('🧪 Résultats des tests:', results);

  return json(results, {
    headers: {
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
