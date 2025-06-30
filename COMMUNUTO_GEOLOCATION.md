# Fonctionnalité de Géolocalisation Communauto

Cette fonctionnalité permet d'afficher les véhicules Communauto dans un rayon de 1km autour de votre position.

## Comment ça fonctionne

### 1. Calcul de la zone de recherche

L'API Communauto accepte les paramètres suivants pour filtrer les véhicules par zone géographique :

- `MaxLatitude` : Latitude maximale
- `MinLatitude` : Latitude minimale
- `MaxLongitude` : Longitude maximale
- `MinLongitude` : Longitude minimale

### 2. Calcul du rayon

Pour afficher les véhicules dans un rayon de 1km :

1. **Calcul de la zone rectangulaire** : On calcule une zone rectangulaire qui englobe le cercle de 1km
2. **Requête à l'API** : On envoie les coordonnées de cette zone à l'API Communauto
3. **Filtrage précis** : On filtre ensuite les résultats pour ne garder que les véhicules dans le rayon exact de 1km

### 3. Utilisation dans l'interface

Dans le widget carte Communauto :

- Cliquez sur le bouton **Navigation** (icône de boussole) pour activer la recherche par proximité
- L'application demandera l'autorisation d'accéder à votre géolocalisation
- Un cercle bleu de 1km sera affiché autour de votre position
- Seuls les véhicules dans ce rayon seront affichés
- Les distances sont calculées et affichées dans les tooltips des marqueurs

## Fonctions utilitaires

### `calculateBoundingBox(centerLat, centerLng, radiusKm)`

Calcule les coordonnées d'une zone rectangulaire autour d'un point central.

```typescript
const boundingBox = calculateBoundingBox(45.5017, -73.5673, 1);
// Retourne : { minLatitude, maxLatitude, minLongitude, maxLongitude }
```

### `calculateDistance(lat1, lng1, lat2, lng2)`

Calcule la distance entre deux points en kilomètres (formule de Haversine).

```typescript
const distance = calculateDistance(45.5017, -73.5673, 45.5117, -73.5773);
// Retourne la distance en km
```

## Méthodes du service Communauto

### `getVehiclesInArea(cityId, maxLat, minLat, maxLng, minLng)`

Récupère les véhicules dans une zone géographique spécifique.

### `getVehiclesInRadius(cityId, centerLat, centerLng, radiusKm)`

Récupère les véhicules dans un rayon autour d'un point central.

```typescript
const nearbyVehicles = await communautoService.getVehiclesInRadius(
  90, // cityId pour Montréal
  45.5017, // latitude du centre
  -73.5673, // longitude du centre
  1, // rayon en km
);
```

## Exemple d'utilisation

```typescript
// 1. Obtenir la position de l'utilisateur
const userLocation = await getUserLocation();

// 2. Récupérer les véhicules dans un rayon de 1km
const vehicles = await communautoService.getVehiclesInRadius(
  90, // Montréal
  userLocation.lat,
  userLocation.lng,
  1, // 1km
);

// 3. Afficher les véhicules sur la carte
vehicles.forEach((vehicle) => {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    vehicle.vehicleLocation.latitude,
    vehicle.vehicleLocation.longitude,
  );
  console.log(`Véhicule #${vehicle.vehicleNb} à ${distance.toFixed(1)}km`);
});
```

## Paramètres de l'API

L'endpoint `/api/communauto` accepte maintenant ces paramètres :

```
GET /api/communauto?cityId=90&MaxLatitude=45.52&MinLatitude=45.48&MaxLongitude=-73.55&MinLongitude=-73.59
```

## Notes techniques

- **Précision** : La formule de Haversine est utilisée pour calculer les distances exactes
- **Performance** : L'API Communauto filtre d'abord par zone rectangulaire, puis on filtre précisément par rayon
- **Cache** : Les résultats sont mis en cache pendant 30 secondes
- **Géolocalisation** : Utilise l'API Geolocation du navigateur avec haute précision

## Sécurité

- L'autorisation de géolocalisation est demandée explicitement à l'utilisateur
- Les coordonnées ne sont pas stockées et ne quittent pas le navigateur
- L'API proxy ne conserve pas les positions des utilisateurs
