# Guide de Dépannage - API Communauto

## Erreur 421 "Misdirected Request"

### Description

L'erreur HTTP 421 indique que la requête a été envoyée à un serveur incapable de la traiter. Cela peut être dû à plusieurs facteurs.

### Solutions implémentées

#### 1. **Système de retry automatique**

- L'API tente automatiquement 3 fois en cas d'erreur 421
- Délai progressif entre les tentatives (1s, 2s, 3s)
- Logs détaillés pour chaque tentative

#### 2. **Headers HTTP optimisés**

```typescript
headers: {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'WalkiWorki/1.0',
  'Connection': 'close', // Force la fermeture de la connexion
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
}
```

#### 3. **Timeout et gestion d'erreur**

- Timeout de 15 secondes pour éviter les requêtes qui traînent
- Gestion détaillée des erreurs avec logs complets
- Réponse d'erreur structurée avec timestamp

#### 4. **Configuration Vercel**

```json
{
  "functions": {
    "src/routes/api/communauto/+server.ts": {
      "maxDuration": 30
    }
  }
}
```

### Endpoint de test

Pour vérifier la connectivité :

```
GET /api/communauto/test
```

Réponse attendue :

```json
{
  "success": true,
  "status": 200,
  "totalVehicles": 123,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "API Communauto accessible"
}
```

### Diagnostic

#### 1. **Vérifier les logs Vercel**

```bash
# Dans les logs Vercel, chercher :
🚗 Tentative 1/3 pour l'API Communauto
🚗 Réponse reçue (tentative 1): 421 Misdirected Request
🚗 Erreur 421 détectée, nouvelle tentative dans 1 seconde...
```

#### 2. **Tester l'endpoint de test**

```bash
curl https://votre-app.vercel.app/api/communauto/test
```

#### 3. **Vérifier les paramètres**

- Assurez-vous que les paramètres de géolocalisation sont valides
- Vérifiez que le `cityId` est correct (90 pour Montréal)

### Solutions alternatives

#### 1. **Utiliser l'endpoint de test d'abord**

Si l'endpoint de test fonctionne mais pas l'API principale, le problème vient des paramètres.

#### 2. **Désactiver temporairement la géolocalisation**

Testez sans les paramètres `MaxLatitude`, `MinLatitude`, etc.

#### 3. **Vérifier la région Vercel**

Assurez-vous que votre déploiement Vercel est dans une région proche de l'API Communauto.

### Monitoring

#### Logs à surveiller

- `🚗 Tentative X/3 pour l'API Communauto`
- `🚗 Réponse reçue (tentative X):`
- `🚗 Erreur HTTP détaillée:`
- `🚗 Proxy Communauto: X véhicules récupérés`

#### Métriques importantes

- Taux de succès des requêtes
- Temps de réponse moyen
- Nombre de retries nécessaires

### Configuration avancée

#### Variables d'environnement

```env
# Si nécessaire, ajoutez des variables pour le debugging
DEBUG_COMMUNUTO=true
COMMUNUTO_TIMEOUT=15000
COMMUNUTO_MAX_RETRIES=3
```

#### Headers personnalisés

Si l'erreur persiste, essayez d'ajouter des headers spécifiques :

```typescript
headers: {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'WalkiWorki/1.0',
  'Connection': 'close',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'X-Requested-With': 'XMLHttpRequest',
}
```

### Contact et support

Si le problème persiste :

1. Vérifiez les logs Vercel complets
2. Testez l'endpoint de test
3. Vérifiez la documentation de l'API Communauto
4. Contactez le support Communauto si nécessaire
