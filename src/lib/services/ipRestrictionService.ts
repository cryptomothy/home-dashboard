// Service de vérification d'IP sécurisé
// Toute la logique de vérification se fait côté serveur

// Fonction pour vérifier l'accès via l'API sécurisée
export async function checkAccess(): Promise<boolean> {
  try {
    const response = await fetch('/api/ip-check');

    if (!response.ok) {
      console.error('Erreur lors de la vérification IP:', response.status);
      return false;
    }

    const data = await response.json();
    return data.allowed;
  } catch (error) {
    console.error("Erreur lors de la vérification d'accès:", error);
    return false;
  }
}

// Fonction pour obtenir le statut d'accès avec plus de détails
export async function getAccessStatus(): Promise<{ allowed: boolean; message: string }> {
  try {
    const response = await fetch('/api/ip-check');

    if (!response.ok) {
      return { allowed: false, message: 'Erreur de connexion' };
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la vérification d'accès:", error);
    return { allowed: false, message: 'Erreur de connexion' };
  }
}
