interface RtcSchedule {
  depart: string;
  departMinutes: number;
  ntr: boolean;
  annule: boolean;
  nomDestination: string;
}

interface RtcResponse {
  parcours: {
    noParcours: string;
    description: string;
    codeDirection: string;
    descriptionDirection: string;
    codeTypeService: number;
    accessible: boolean;
  };
  arret: {
    noArret: string;
    nom: string;
    description: string;
    latitude: number;
    longitude: number;
    accessible: boolean;
  };
  arretNonDesservi: boolean;
  descenteSeulement: boolean;
  typeParcours: string;
  horaires: RtcSchedule[];
}

export async function getBusSchedule(
  noParcours: string = '802',
  noArret: string = '1048',
  codeDirection: string = '3',
  date: string = '20250612',
): Promise<RtcResponse> {
  try {
    const response = await fetch(
      `https://wssiteweb.rtcquebec.ca/api/v2/horaire/BorneVirtuelle_ArretParcours/?noParcours=${noParcours}&noArret=${noArret}&codeDirection=${codeDirection}&date=${date}`,
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error);
    throw error;
  }
}
