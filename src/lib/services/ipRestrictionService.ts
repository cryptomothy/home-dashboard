// Liste des IPs autorisées
const ALLOWED_IPS = [
  '198.58.233.16', // localhost
  // Ajoutez ici vos IPs autorisées
];

// Fonction pour vérifier si une IP est autorisée
export function isIpAllowed(ip: string): boolean {
  return ALLOWED_IPS.includes(ip);
}

// Fonction pour obtenir l'IP du client
export async function getClientIp(): Promise<string> {
  try {
    // Utilisation de plusieurs services pour plus de fiabilité
    const responses = await Promise.allSettled([fetch('https://api.ipify.org?format=json')]);

    // Parcourir les réponses pour trouver la première qui fonctionne
    for (const response of responses) {
      if (response.status === 'fulfilled') {
        const data = await response.value.json();
        return data.ip || data;
      }
    }

    throw new Error('Aucun service IP disponible');
  } catch (error) {
    console.error("Erreur lors de la récupération de l'IP:", error);
    return '198.58.233.16'; // Fallback sur localhost en cas d'erreur
  }
}

// Fonction pour vérifier l'accès
export async function checkAccess(): Promise<boolean> {
  const clientIp = await getClientIp();
  console.log('IP du client:', clientIp); // Pour le débogage
  return isIpAllowed(clientIp);
}
