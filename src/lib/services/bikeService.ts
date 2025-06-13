// Types pour l'API àVélo
interface BikeStationResponse {
	last_updated: number;
	ttl: number;
	data: {
		stations: BikeStation[];
	};
}

interface BikeStation {
	station_id: string;
	num_bikes_available: number;
	num_bikes_available_types: {
		mechanical: number;
		ebike: number;
	};
	num_bikes_disabled: number;
	num_docks_available: number;
	num_docks_disabled: number;
	last_reported: number;
	is_charging_station: boolean;
	status: string;
	is_installed: number;
	is_renting: number;
	is_returning: number;
}

interface StationInfo {
	id: string;
	name: string;
	available: number;
	ebikes: number;
	total: number;
	docks_available: number;
	is_charging: boolean;
	status: string;
	last_updated: string;
}

class BikeService {
	private apiUrl = 'https://quebec.publicbikesystem.net/customer/ube/gbfs/v1/en/station_status';
	private stationNames: Record<string, string> = {
		'35': 'Place Roger-Lemelin',
		'66': 'Montmagny',
	};
	
	async getStationInfo(stationId: string): Promise<StationInfo | null> {
		try {
			console.log(`🚲 Récupération des infos pour la station ${stationId}...`);
			
			const response = await fetch(this.apiUrl);
			
			if (!response.ok) {
				throw new Error(`Erreur API àVélo: ${response.status}`);
			}
			
			const data: BikeStationResponse = await response.json();
			console.log('✅ Données àVélo récupérées avec succès');
			
			// Trouver la station spécifiée
			const station = data.data.stations.find(s => s.station_id === stationId);
			
			if (!station) {
				console.error(`Station ${stationId} non trouvée`);
				return null;
			}
			
			// Calculer le total des emplacements
			const total = station.num_bikes_available + station.num_bikes_disabled + station.num_docks_available;
			
			// Formater la date de dernière mise à jour
			const lastUpdated = new Date(station.last_reported * 1000).toLocaleTimeString('fr-CA', {
				hour: '2-digit',
				minute: '2-digit'
			});
			
			return {
				id: station.station_id,
				name: this.stationNames[station.station_id] || `Station ${station.station_id}`,
				available: station.num_bikes_available,
				ebikes: station.num_bikes_available_types.ebike,
				total: total,
				docks_available: station.num_docks_available,
				is_charging: station.is_charging_station,
				status: station.status,
				last_updated: lastUpdated
			};
			
		} catch (error) {
			console.error('Erreur lors de la récupération des données àVélo:', error);
			return null;
		}
	}
	
	async getSelectedStations(): Promise<StationInfo[]> {
		try {
			console.log('🚲 Récupération des stations sélectionnées...');
			
			const response = await fetch(this.apiUrl);
			
			if (!response.ok) {
				throw new Error(`Erreur API àVélo: ${response.status}`);
			}
			
			const data: BikeStationResponse = await response.json();
			
			// Récupérer uniquement les stations sélectionnées (66 et 35)
			const selectedIds = Object.keys(this.stationNames);
			const stations = data.data.stations
				.filter(s => selectedIds.includes(s.station_id))
				.map(station => {
					const total = station.num_bikes_available + station.num_bikes_disabled + station.num_docks_available;
					return {
						id: station.station_id,
						name: this.stationNames[station.station_id] || `Station ${station.station_id}`,
						available: station.num_bikes_available,
						ebikes: station.num_bikes_available_types.ebike,
						total: total,
						docks_available: station.num_docks_available,
						is_charging: station.is_charging_station,
						status: station.status,
						last_updated: new Date(station.last_reported * 1000).toLocaleTimeString('fr-CA', {
							hour: '2-digit',
							minute: '2-digit'
						})
					};
				});
				
			return stations;
			
		} catch (error) {
			console.error('Erreur lors de la récupération des stations sélectionnées:', error);
			return [];
		}
	}
}

export const bikeService = new BikeService();
export type { StationInfo }; 