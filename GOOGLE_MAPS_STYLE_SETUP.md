# Configuration des Styles Google Maps Personnalisés

Ce guide explique comment importer vos styles Google Maps personnalisés dans l'application WalkiWorki.

## Méthode 1 : Utiliser l'ID de Style (Recommandé)

### Étape 1 : Créer vos styles sur Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. Naviguez vers **APIs & Services** > **Maps Platform** > **Map Styles**
4. Cliquez sur **Create Map Style**
5. Personnalisez votre carte selon vos préférences
6. Sauvegardez et notez l'**ID de style** généré

### Étape 2 : Configurer l'application

1. Ajoutez votre ID de style dans le fichier `.env` :

```env
VITE_GOOGLE_MAPS_STYLE_ID=your_custom_map_style_id_here
```

2. L'application utilisera automatiquement votre style personnalisé

## Méthode 2 : Styles Inline (Actuel)

Si vous n'avez pas d'ID de style, l'application utilise les styles inline définis dans `src/lib/config/mapStyles.ts`.

### Personnaliser les styles inline

Vous pouvez modifier les styles directement dans le fichier `mapStyles.ts` :

```typescript
export const communautoMapStyles: google.maps.MapTypeStyle[] = [
  // Exemple : changer la couleur de fond
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }], // Couleur sombre
  },
  // Exemple : masquer les POI
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  // ... autres styles
];
```

## Méthode 3 : Importer un fichier JSON

Si vous avez exporté vos styles en JSON depuis Google Cloud Console :

1. Créez un fichier `src/lib/config/customMapStyles.json`
2. Collez votre JSON de styles
3. Modifiez `mapStyles.ts` pour importer ce fichier :

```typescript
import customStyles from './customMapStyles.json';

export function getMapStyles(): google.maps.MapTypeStyle[] {
  return customStyles;
}
```

## Priorité des Styles

L'application utilise cette priorité :

1. **ID de style personnalisé** (si `VITE_GOOGLE_MAPS_STYLE_ID` est défini)
2. **Styles inline** (définis dans `mapStyles.ts`)

## Types de Styles Disponibles

- **Feature Type** : `all`, `road`, `water`, `poi`, `transit`, etc.
- **Element Type** : `geometry`, `labels`, `labels.text.fill`, etc.
- **Stylers** : `color`, `visibility`, `lightness`, `saturation`, etc.

## Exemples de Styles

### Style Sombre Moderne

```typescript
{
  featureType: 'all',
  elementType: 'geometry',
  stylers: [{ color: '#1a1a1a' }]
}
```

### Masquer les POI

```typescript
{
  featureType: 'poi',
  elementType: 'all',
  stylers: [{ visibility: 'off' }]
}
```

### Texte Vert

```typescript
{
  featureType: 'all',
  elementType: 'labels.text.fill',
  stylers: [{ color: '#00ff88' }]
}
```

## Ressources Utiles

- [Google Maps Platform - Map Styles](https://developers.google.com/maps/documentation/javascript/style-reference)
- [Google Cloud Console - Map Styles](https://console.cloud.google.com/google/maps-apis/studio)
- [Style Reference](https://developers.google.com/maps/documentation/javascript/style-reference)
