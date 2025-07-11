import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { XMLParser } from 'fast-xml-parser';

// Fonction pour parser le XML Communauto et le transformer en JSON
function parseCommunautoXML(xmlText: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: true,
    parseTagValue: true,
  });

  const result = parser.parse(xmlText);

  // Extraire les données principales
  const root = result.VehicleFreeFloatingAvailabilityListDTO;
  const vehicles = root.Vehicles.VehicleFreeFloatingAvailabilityDTO;

  // Transformer les véhicules en format plus simple
  const transformedVehicles = Array.isArray(vehicles) ? vehicles : [vehicles];

  const parsedData = {
    totalNbVehicles: parseInt(root.TotalNbVehicles),
    vehicles: transformedVehicles.map((vehicle: any) => ({
      id: vehicle.VehicleId,
      number: vehicle.VehicleNb,
      cityId: vehicle.CityId,
      location: {
        latitude: vehicle.VehicleLocation.Latitude,
        longitude: vehicle.VehicleLocation.Longitude,
      },
      bodyTypeId: vehicle.VehicleBodyTypeId,
      typeId: vehicle.VehicleTypeId,
      propulsionTypeId: vehicle.VehiclePropulsionTypeId,
      transmissionTypeId: vehicle.VehicleTransmissionTypeId,
      tireTypeId: vehicle.VehicleTireTypeId,
      accessories: vehicle.VehicleAccessories?.int || [],
      energyLevel: vehicle.EnergyLevelPercentage,
      satisfiesFilters: vehicle.SatisfiesFilters,
      displayZone: vehicle.DisplayZone,
    })),
    cachingInfo: {
      durationInSec: root.CachingInfo.CachingDurationInSec,
      servedFromCache: root.CachingInfo.ServedFromCache,
      hashCode: root.CachingInfo.HashCode,
    },
  };

  return parsedData;
}

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const GET: RequestHandler = async ({ url }) => {
  try {
    const cityId = url.searchParams.get('cityId') || '90';

    // Paramètres de géolocalisation optionnels
    const maxLatitude = url.searchParams.get('MaxLatitude');
    const minLatitude = url.searchParams.get('MinLatitude');
    const maxLongitude = url.searchParams.get('MaxLongitude');
    const minLongitude = url.searchParams.get('MinLongitude');

    // Construire l'URL de base
    let apiUrl = `https://restapifrontoffice.reservauto.net/api/v2/Vehicle/FreeFloatingAvailability?CityId=${cityId}`;

    // Ajouter les paramètres de géolocalisation s'ils sont fournis
    const geoParams = [];
    if (maxLatitude) geoParams.push(`MaxLatitude=${maxLatitude}`);
    if (minLatitude) geoParams.push(`MinLatitude=${minLatitude}`);
    if (maxLongitude) geoParams.push(`MaxLongitude=${maxLongitude}`);
    if (minLongitude) geoParams.push(`MinLongitude=${minLongitude}`);

    if (geoParams.length > 0) {
      apiUrl += `&${geoParams.join('&')}`;
    }

    console.log('🚗 Proxy Communauto: Récupération des véhicules pour CityId:', cityId);
    if (geoParams.length > 0) {
      console.log('🚗 Paramètres géolocalisation:', geoParams.join(', '));
    }

    console.log("🚗 URL de l'API Communauto:", apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/xml, application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Impossible de lire le contenu de l'erreur");
      console.error('🚗 Erreur HTTP détaillée:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/xml')) {
      // Traitement du XML
      const xmlText = await response.text();
      console.log('🚗 Réponse XML reçue, longueur:', xmlText.length);

      // Parser le XML et le transformer en JSON
      data = parseCommunautoXML(xmlText);
      console.log(`🚗 Proxy Communauto: ${data.totalNbVehicles} véhicules parsés depuis XML`);
    } else {
      // Traitement du JSON
      data = await response.json();
      console.log(`🚗 Proxy Communauto: ${data.totalNbVehicles || 'N/A'} véhicules récupérés`);
    }

    return json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('🚗 Erreur proxy Communauto:', error);

    // Retourner une réponse d'erreur plus détaillée
    return json(
      {
        error: 'Erreur lors de la récupération des véhicules Communauto',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString(),
        url: url.toString(),
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  }
};
