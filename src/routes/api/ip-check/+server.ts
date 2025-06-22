import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ALLOWED_IP_1, LOCAL_IP } from '$env/static/private';

// Liste des IPs autorisées (côté serveur uniquement)
const ALLOWED_IPS = [
  ALLOWED_IP_1,
  LOCAL_IP, // localhost
  // Ajoutez ici vos IPs autorisées
];

console.log('IPs autorisées:', ALLOWED_IPS);

// Fonction pour obtenir l'IP réelle du client
function getClientIp(request: Request): string {
  // Vérifier les headers proxy (pour les déploiements avec proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback - cette IP sera probablement celle du proxy
  return '127.0.0.1';
}

// Fonction pour vérifier si une IP est autorisée
function isIpAllowed(ip: string): boolean {
  return ALLOWED_IPS.includes(ip);
}

export const GET: RequestHandler = async ({ request }) => {
  try {
    const clientIp = getClientIp(request);
    console.log('IP client:', clientIp);
    const isAllowed = isIpAllowed(clientIp);

    // Ne pas exposer l'IP réelle dans la réponse pour des raisons de sécurité
    return json({
      allowed: isAllowed,
      // Optionnel : retourner un message d'erreur générique si non autorisé
      message: isAllowed ? 'Accès autorisé' : 'Accès refusé',
    });
  } catch (error) {
    console.error('Erreur lors de la vérification IP:', error);
    return json({ allowed: false, message: 'Erreur de vérification' }, { status: 500 });
  }
};
