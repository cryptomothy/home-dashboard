# Résolution de l'erreur 421 Misdirected Request sur Vercel

## Problème

L'API Communauto retourne une erreur 421 "Misdirected Request" lors du déploiement sur Vercel. Cette erreur est souvent liée à des problèmes de configuration HTTP/2 ou de proxy.

## Solutions mises en place

### 1. Endpoint principal amélioré (`/api/communauto`)

- Ajout de headers HTTP/1.1 pour forcer la compatibilité
- Système de retry amélioré avec délais progressifs
- Gestion spécifique de l'erreur 421

### 2. Endpoint de fallback (`/api/communauto/fallback`)

- Approche alternative avec headers minimaux
- Cache désactivé pour éviter les problèmes de proxy
- Configuration simplifiée

### 3. Services de proxy externes (Nouvelles solutions)

#### A. Proxy externe (`/api/communauto/proxy`)

- Utilise `api.allorigins.win` comme proxy
- Contourne complètement le problème HTTP/2 de Vercel
- Parse automatiquement la réponse JSON

#### B. CORS Proxy (`/api/communauto/cors-proxy`)

- Utilise `cors-anywhere.herokuapp.com`
- Gère les problèmes de CORS
- Headers spécifiques pour le proxy

#### C. Public Proxy (`/api/communauto/public-proxy`)

- Utilise `thingproxy.freeboard.io`
- Service de proxy public gratuit
- Configuration simple et fiable

### 4. Endpoint de test (`/api/communauto/test-all`)

- Teste différentes approches simultanément
- Permet d'identifier la meilleure méthode
- Utile pour le debugging

### 5. Configuration Vercel améliorée

- Utilisation de `@sveltejs/adapter-vercel` au lieu de `adapter-auto`
- Configuration spécifique pour Node.js 18.x
- Headers CORS configurés pour tous les endpoints

## Headers ajoutés pour éviter l'erreur 421

```javascript
{
  'User-Agent': 'Mozilla/5.0 (compatible; WalkiWorki/1.0)',
  'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'close',
  'Upgrade-Insecure-Requests': '1',
  'DNT': '1',
}
```

## Endpoints disponibles

1. **Principal**: `/api/communauto` - Version améliorée avec retry
2. **Fallback**: `/api/communauto/fallback` - Version alternative simple
3. **Proxy externe**: `/api/communauto/proxy` - Via api.allorigins.win
4. **CORS Proxy**: `/api/communauto/cors-proxy` - Via cors-anywhere
5. **Public Proxy**: `/api/communauto/public-proxy` - Via thingproxy
6. **HTTP/1.1**: `/api/communauto/http1` - Version avec headers HTTP/1.1
7. **Simple**: `/api/communauto/simple` - Version basique
8. **Test**: `/api/communauto/test-all` - Tests multiples

## Utilisation recommandée

### Ordre de priorité pour tester :

1. **Premier essai**: `/api/communauto/public-proxy` (le plus fiable)
2. **Deuxième essai**: `/api/communauto/proxy` (via allorigins)
3. **Troisième essai**: `/api/communauto/cors-proxy` (via cors-anywhere)
4. **Fallback**: `/api/communauto/fallback` (version locale)
5. **Debugging**: `/api/communauto/test-all` (pour diagnostiquer)

## Services de proxy utilisés

### 1. thingproxy.freeboard.io

- **Avantages**: Gratuit, fiable, pas de limite
- **URL**: `https://thingproxy.freeboard.io/fetch/{url}`

### 2. api.allorigins.win

- **Avantages**: Rapide, bien maintenu
- **URL**: `https://api.allorigins.win/get?url={url}`
- **Note**: Retourne les données dans `response.contents`

### 3. cors-anywhere.herokuapp.com

- **Avantages**: Spécialisé CORS
- **URL**: `https://cors-anywhere.herokuapp.com/{url}`
- **Note**: Peut nécessiter une activation

## Monitoring

Tous les endpoints incluent des logs détaillés pour faciliter le debugging :

- Tentatives de requête
- Codes de statut HTTP
- Erreurs détaillées
- Temps de réponse
- URLs des proxies utilisés

## Déploiement

Après déploiement sur Vercel avec l'adapter Vercel spécifique :

1. Tester `/api/communauto/public-proxy` en premier
2. Si ça ne fonctionne pas, essayer les autres endpoints
3. Utiliser `/api/communauto/test-all` pour diagnostiquer

## Configuration SvelteKit

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs18.x',
      external: ['restapifrontoffice.reservauto.net'],
    }),
  },
};
```
