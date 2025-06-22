# 📅 Configuration API Facebook Events

## 🚀 Vue d'ensemble

Ce widget utilise l'API Graph de Facebook pour récupérer les événements locaux dans un rayon de 10km autour de votre position.

## 📋 Prérequis

1. **Compte Facebook développeur** : [developers.facebook.com](https://developers.facebook.com)
2. **Application Facebook** créée
3. **Token d'accès** avec les permissions appropriées

## 🔧 Configuration étape par étape

### 1. Créer une application Facebook

1. Allez sur [developers.facebook.com](https://developers.facebook.com)
2. Cliquez sur "Créer une application"
3. Sélectionnez "Consommateur" ou "Autre"
4. Remplissez les informations de base

### 2. Configurer les permissions

Dans votre application Facebook :

1. **Ajoutez le produit "Graph API"**
2. **Configurez les permissions** :
   - `public_profile` (par défaut)
   - `pages_read_engagement` (pour les événements publics)
   - `pages_show_list` (optionnel)

### 3. Obtenir un token d'accès

#### Option A : Token utilisateur (recommandé pour les tests)

```bash
# Remplacez YOUR_APP_ID par votre ID d'application
https://www.facebook.com/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=https://developers.facebook.com/tools/explorer/&scope=public_profile,pages_read_engagement
```

#### Option B : Token de page (pour les événements de pages spécifiques)

1. Allez dans "Outils" > "Graph API Explorer"
2. Sélectionnez votre application
3. Cliquez sur "Générer un token d'accès"
4. Sélectionnez les permissions nécessaires

### 4. Configurer les variables d'environnement

Créez ou modifiez votre fichier `.env` à la racine du projet :

```bash
# Facebook API
VITE_FACEBOOK_ACCESS_TOKEN=votre_token_ici
```

### 5. Personnaliser la localisation (optionnel)

Par défaut, le widget utilise les coordonnées de Québec. Pour changer :

1. **Modifiez le service** (`src/lib/services/facebookEventsService.ts`)
2. **Changez les coordonnées par défaut** :

```typescript
private defaultLocation = {
  lat: 46.8139, // Votre latitude
  lng: -71.208, // Votre longitude
  distance: 10000 // Rayon en mètres (10km)
};
```

## 🔍 Test de l'API

### Test direct avec curl

```bash
curl "https://graph.facebook.com/v18.0/search?type=event&center=46.8139,-71.208&distance=10000&since=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)&fields=id,name,description,start_time,place,cover,attending_count,interested_count&access_token=VOTRE_TOKEN"
```

### Test dans le navigateur

```
https://graph.facebook.com/v18.0/search?type=event&center=46.8139,-71.208&distance=10000&fields=id,name,start_time,place&access_token=VOTRE_TOKEN
```

## 🛠️ Dépannage

### Problèmes courants

#### 1. **Erreur 400 - Bad Request**

- Vérifiez que votre token est valide
- Assurez-vous que les permissions sont correctes

#### 2. **Aucun événement retourné**

- Vérifiez les coordonnées géographiques
- Augmentez le rayon de recherche
- Vérifiez qu'il y a des événements publics dans la zone

#### 3. **Erreur 403 - Forbidden**

- Votre token n'a pas les bonnes permissions
- L'application n'est pas approuvée pour les permissions demandées

#### 4. **Limite de requêtes dépassée**

- Facebook limite les requêtes par heure
- Utilisez le cache ou réduisez la fréquence des requêtes

### Logs de débogage

Le service affiche des logs détaillés dans la console :

- 📅 Tentative de récupération
- 📡 URL de requête (token masqué)
- ✅ Succès ou ❌ erreurs
- 🔄 Fallback vers données mockées

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne commitez jamais votre token** dans Git
2. **Utilisez des variables d'environnement**
3. **Limitez les permissions** au minimum nécessaire
4. **Régénérez régulièrement** votre token

### Variables d'environnement

```bash
# .env (ne pas commiter)
VITE_FACEBOOK_ACCESS_TOKEN=votre_token_secret

# .env.example (peut être commité)
VITE_FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
```

## 📊 Fonctionnalités du widget

### Données affichées

- ✅ Titre de l'événement
- ✅ Date et heure
- ✅ Lieu
- ✅ Catégorie
- ✅ Nombre de participants
- ✅ Distance depuis votre position
- ✅ Image de couverture (si disponible)

### Fallback

Si l'API Facebook n'est pas disponible :

- Utilisation de données mockées réalistes
- Événements fictifs pour Québec
- Interface fonctionnelle même sans token

## 🎨 Personnalisation

### Couleurs par catégorie

Modifiez `getCategoryColor()` dans le widget pour changer les couleurs :

```typescript
const colors: Record<string, string> = {
  Musique: 'bg-purple-500/20 text-purple-400',
  Art: 'bg-pink-500/20 text-pink-400',
  // Ajoutez vos catégories...
};
```

### Taille du widget

Le widget utilise `col-span-4 row-span-2` par défaut. Modifiez dans `EventsWidget.svelte`.

## 📱 Utilisation

1. **Activez le widget** dans les paramètres du dashboard
2. **Configurez votre token** Facebook
3. **Personnalisez** la localisation si nécessaire
4. **Profitez** des événements locaux !

---

💡 **Astuce** : Pour des événements plus précis, vous pouvez aussi utiliser l'API de pages spécifiques en ajoutant leur ID dans la configuration.
