import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();

    // Construire l'URL de destination
    const url = new URL(
      'https://www.bonjourquebec.com/fr-ca/quoi-faire/festivals-et-evenements/fetes-et-festivals',
    );
    url.searchParams.append('ajax_form', '1');
    url.searchParams.append('_wrapper_format', 'html');

    // Ajouter les paramètres de page s'ils existent
    const page = formData.get('page');
    if (page) {
      url.searchParams.append('page', page.toString());
    }

    console.log('🔍 Proxy - URL de destination:', url.toString());

    // Préparer les données pour la requête
    const requestFormData = new URLSearchParams();

    // Ajouter tous les champs du formulaire
    for (const [key, value] of formData.entries()) {
      if (value !== null && value !== undefined) {
        requestFormData.append(key, value.toString());
      }
    }

    // Faire la requête vers Bonjour Québec
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: requestFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Origin: 'https://www.bonjourquebec.com',
        Referer:
          'https://www.bonjourquebec.com/fr-ca/quoi-faire/festivals-et-evenements/fetes-et-festivals',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('✅ Proxy - Réponse récupérée avec succès');

    // Essayer de parser comme JSON, sinon retourner comme HTML
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('✅ Proxy - Réponse parsée comme JSON');
    } catch (e) {
      console.log('⚠️ Proxy - Réponse traitée comme HTML');
      responseData = { data: responseText };
    }

    // Retourner la réponse
    return json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('❌ Erreur dans le proxy:', error);
    return json({ error: 'Erreur lors de la récupération des données' }, { status: 500 });
  }
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
