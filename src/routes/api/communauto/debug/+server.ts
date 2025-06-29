import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communautoService } from '$lib/services/communautoService';

export const GET: RequestHandler = async () => {
  try {
    console.log('🧪 Début des tests de debug API Communauto...');

    const results = await communautoService.testAllAPIs(90);

    return json({
      success: true,
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        mainWorking: results.main,
        simpleWorking: results.simple,
        http1Working: results.http1,
        recommended: results.simple ? 'simple' : results.http1 ? 'http1' : 'main',
      },
      message: 'Tests de debug terminés',
    });
  } catch (error) {
    console.error('🧪 Erreur lors des tests de debug:', error);

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
