# Sécurité - Restriction d'IP

## Problème de sécurité identifié

L'ancienne implémentation présentait plusieurs vulnérabilités :

1. **Exposition des IPs autorisées** : Les variables `VITE_*` sont automatiquement exposées au navigateur
2. **Logique côté client** : Toute la vérification se faisait côté client et pouvait être contournée
3. **Fallback visible** : L'IP de fallback était également exposée

## Solution implémentée

### 1. API sécurisée côté serveur

Création d'un endpoint `/api/ip-check` qui :

- Vérifie l'IP côté serveur uniquement
- Utilise les headers proxy pour obtenir l'IP réelle
- Ne retourne que le statut d'accès (pas l'IP réelle)

### 2. Variables d'environnement sécurisées

- **Avant** : `VITE_LOCAL_IP` (exposée au navigateur)
- **Après** : `LOCAL_IP` (côté serveur uniquement via `$env/static/private`)

### 3. Service client simplifié

Le service côté client ne fait plus que :

- Appeler l'API sécurisée
- Retourner le statut d'accès

## Configuration

### Variables d'environnement

```bash
# .env (ne pas commiter)
LOCAL_IP=127.0.0.1
ALLOWED_IP_1=192.168.1.100
ALLOWED_IP_2=10.0.0.50
```

**Important** : Dans SvelteKit, les variables d'environnement côté serveur sont automatiquement disponibles via `$env/static/private` sans configuration supplémentaire.

### Ajout d'IPs autorisées

Pour ajouter de nouvelles IPs autorisées, modifiez le fichier `src/routes/api/ip-check/+server.ts` :

```typescript
import { LOCAL_IP } from '$env/static/private';

const ALLOWED_IPS = [
  LOCAL_IP || '127.0.0.1',
  '192.168.1.100', // Votre IP
  '10.0.0.50', // Autre IP
];
```

## Avantages de sécurité

1. **IPs masquées** : Les IPs autorisées ne sont plus visibles côté client
2. **Vérification serveur** : Impossible de contourner côté client
3. **Headers proxy** : Support des déploiements avec proxy/reverse proxy
4. **Messages génériques** : Pas d'information sensible dans les réponses

## Migration

Si vous aviez des IPs dans `VITE_LOCAL_IP`, déplacez-les vers `LOCAL_IP` dans votre fichier `.env`.

## Débogage

Pour vérifier que les variables d'environnement sont bien chargées, regardez les logs du serveur. Vous devriez voir :

```
IPs autorisées: ['127.0.0.1', 'votre.ip.ici']
```
