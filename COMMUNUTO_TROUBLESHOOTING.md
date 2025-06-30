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
// Version simplifiée (recommandée)
headers: {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; WalkiWorki/1.0)',
}

// Version HTTP/1.1 (alternative)
headers: {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; WalkiWorki/1.0)',
  'Connection': 'close',
  'Upgrade-Insecure-Requests': '1',
  'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
}
```

#### 3. **Timeout et gestion d'erreur**

- Timeout de 15 secondes pour éviter les requêtes qui traînent
- Gestion détaillée des erreurs avec logs complets
- Réponse d'erreur structurée avec timestamp

#### 4. **Configuration Vercel**

```json
{
  "headers": [
    {
      "source": "/api/communauto",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Endpoints de test

#### 1. **Test de connectivité basique**

```
GET /api/communauto/test
```

#### 2. **API simple (sans géolocalisation)**

```
GET /api/communauto/simple?cityId=90
```

#### 3. **API HTTP/1.1 (headers complets)**

```
GET /api/communauto/http1?cityId=90
```

#### 4. **Debug complet (teste toutes les versions)**

```
GET /api/communauto/debug
```

Réponse du debug :

```json
{
  "success": true,
  "results": {
    "main": false,
    "simple": true,
    "http1": true,
    "details": {
      "main": "Error: Erreur HTTP: 421 Misdirected Request",
      "simple": "OK",
      "http1": "OK"
    }
  },
  "summary": {
    "mainWorking": false,
    "simpleWorking": true,
    "http1Working": true,
    "recommended": "simple"
  }
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

#### 2. **Tester l'endpoint de debug**

```bash
curl https://votre-app.vercel.app/api/communauto/debug
```

#### 3. **Tester les différentes versions**

```bash
# Test API simple
curl https://votre-app.vercel.app/api/communauto/simple

# Test API HTTP/1.1
curl https://votre-app.vercel.app/api/communauto/http1
```

### Solutions alternatives

#### 1. **Utiliser l'API simple**

Si l'API principale échoue, utilisez `/api/communauto/simple` qui a des headers minimaux.

#### 2. **Utiliser l'API HTTP/1.1**

Si l'API simple échoue, utilisez `/api/communauto/http1` qui force HTTP/1.1.

#### 3. **Désactiver temporairement la géolocalisation**

Testez sans les paramètres `MaxLatitude`, `MinLatitude`, etc. pour voir si le problème vient de la recherche par rayon de 1km.

#### 4. **Vérifier la région Vercel**

Assurez-vous que votre déploiement Vercel est dans une région proche de l'API Communauto.

### Monitoring

#### Logs à surveiller

- `🚗 Tentative X/3 pour l'API Communauto`
- `🚗 Réponse reçue (tentative X):`
- `🚗 Erreur HTTP détaillée:`
- `🚗 Proxy Communauto: X véhicules récupérés`
- `🧪 Résultats des tests API Communauto:`

#### Métriques importantes

- Taux de succès des requêtes
- Temps de réponse moyen
- Nombre de retries nécessaires
- Version d'API qui fonctionne le mieux

### Configuration avancée

#### Variables d'environnement

```env
# Si nécessaire, ajoutez des variables pour le debugging
DEBUG_COMMUNUTO=true
COMMUNUTO_TIMEOUT=15000
COMMUNUTO_MAX_RETRIES=3
COMMUNUTO_USE_SIMPLE_API=true
```

#### Headers personnalisés

Si l'erreur persiste, essayez d'ajouter des headers spécifiques :

```typescript
headers: {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; WalkiWorki/1.0)',
  'Connection': 'close',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'X-Requested-With': 'XMLHttpRequest',
}
```

### Recommandations

1. **Commencez par l'endpoint de debug** pour identifier quelle version fonctionne
2. **Utilisez l'API simple** si l'API principale échoue
3. **Vérifiez les logs Vercel** pour des détails sur les erreurs
4. **Testez localement** d'abord si possible

### Contact et support

Si le problème persiste :

1. Vérifiez les logs Vercel complets
2. Testez l'endpoint de debug
3. Vérifiez la documentation de l'API Communauto
4. Contactez le support Communauto si nécessaire
