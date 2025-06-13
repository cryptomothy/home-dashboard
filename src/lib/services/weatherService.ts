// Types pour l'API OpenWeatherMap
interface OpenWeatherResponse {
	main: {
		temp: number;
		feels_like: number;
		humidity: number;
	};
	weather: Array<{
		main: string;
		description: string;
		icon: string;
	}>;
	wind: {
		speed: number;
	};
	sys: {
		sunrise: number;
		sunset: number;
	};
	uvi?: number;
}

interface OpenWeatherForecastResponse {
	list: Array<{
		dt: number;
		main: {
			temp: number;
			temp_min: number;
			temp_max: number;
		};
		weather: Array<{
			main: string;
			description: string;
			icon: string;
		}>;
		pop: number; // Probability of precipitation
		dt_txt: string;
	}>;
}

interface WeatherData {
	current: {
		temp: number;
		condition: string;
		humidity: number;
		windSpeed: number;
		uvIndex: number;
		airQuality: string;
		feelsLike: number;
	};
	today: {
		time: string;
		temp: number;
		icon: string;
	}[];
	tomorrow: {
		date: string;
		high: number;
		low: number;
		condition: string;
		icon: string;
		precipitation: number;
	};
	sun: {
		sunrise: string;
		sunset: string;
	};
}

class WeatherService {
	private apiKey: string;
	private baseUrl = 'https://api.openweathermap.org/data/2.5';
	
	constructor() {
		this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
	}

	private kelvinToCelsius(kelvin: number): number {
		return Math.round(kelvin - 273.15);
	}

	private formatTime(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleTimeString('fr-CA', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	private getWeatherIcon(iconCode: string): string {
		// Mapping des codes OpenWeatherMap vers nos icônes
		const iconMap: { [key: string]: string } = {
			'01d': 'sun', '01n': 'sun',
			'02d': 'cloud', '02n': 'cloud',
			'03d': 'cloud', '03n': 'cloud',
			'04d': 'cloud', '04n': 'cloud',
			'09d': 'rain', '09n': 'rain',
			'10d': 'rain', '10n': 'rain',
			'11d': 'rain', '11n': 'rain',
			'13d': 'snow', '13n': 'snow',
			'50d': 'cloud', '50n': 'cloud'
		};
		return iconMap[iconCode] || 'sun';
	}

	async getCurrentWeather(lat: number = 46.8139, lon: number = -71.2080): Promise<WeatherData> {
		// Si pas d'API key, retourner des données mockées
		if (!this.apiKey) {
			console.warn('Aucune clé API météo configurée, utilisation des données mockées');
			return this.getMockWeatherData();
		}

		console.log('🌤️ Tentative de récupération des données météo avec clé API:', this.apiKey.substring(0, 8) + '...');

		try {
			// Récupérer les données actuelles
			const currentUrl = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&lang=fr`;
			console.log('📡 URL de requête:', currentUrl.replace(this.apiKey, 'API_KEY_HIDDEN'));
			
			const currentResponse = await fetch(currentUrl);
			
			if (!currentResponse.ok) {
				const errorText = await currentResponse.text();
				console.error('❌ Réponse API météo:', {
					status: currentResponse.status,
					statusText: currentResponse.statusText,
					body: errorText
				});
				
				if (currentResponse.status === 401) {
					throw new Error('Clé API invalide ou pas encore activée');
				}
				throw new Error(`Erreur API météo actuelle: ${currentResponse.status} - ${errorText}`);
			}
			
			const currentData: OpenWeatherResponse = await currentResponse.json();
			console.log('✅ Données météo actuelles récupérées avec succès');

			// Vérifier que les données sont valides
			if (!currentData.main || !currentData.weather || !currentData.weather[0]) {
				throw new Error('Données météo actuelles invalides');
			}

			// Récupérer les prévisions
			const forecastUrl = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&lang=fr`;
			const forecastResponse = await fetch(forecastUrl);
			
			if (!forecastResponse.ok) {
				const errorText = await forecastResponse.text();
				console.error('❌ Réponse API prévisions:', {
					status: forecastResponse.status,
					statusText: forecastResponse.statusText,
					body: errorText
				});
				
				if (forecastResponse.status === 401) {
					console.error('🔑 Clé API météo invalide pour les prévisions');
					throw new Error('Clé API invalide');
				}
				throw new Error(`Erreur API prévisions: ${forecastResponse.status} - ${errorText}`);
			}
			
			const forecastData: OpenWeatherForecastResponse = await forecastResponse.json();
			console.log('✅ Prévisions météo récupérées avec succès');

			// Vérifier que les données de prévisions sont valides
			if (!forecastData.list || !Array.isArray(forecastData.list) || forecastData.list.length === 0) {
				throw new Error('Données de prévisions invalides');
			}

			// Traiter les données
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			// Prévisions pour aujourd'hui (prochaines 4 périodes de 3h)
			const todayForecasts = forecastData.list.slice(0, 4).map(item => ({
				time: new Date(item.dt * 1000).toLocaleTimeString('fr-CA', { hour: '2-digit' }) + 'h',
				temp: this.kelvinToCelsius(item.main.temp),
				icon: this.getWeatherIcon(item.weather[0]?.icon || '01d')
			}));

			// Prévisions pour demain
			const tomorrowForecasts = forecastData.list.filter(item => {
				const itemDate = new Date(item.dt * 1000);
				return itemDate.getDate() === tomorrow.getDate();
			});

			// Valeurs par défaut si pas de données pour demain
			let tomorrowHigh = 20;
			let tomorrowLow = 10;
			let tomorrowPrecip = 0;
			let tomorrowCondition = 'Inconnu';
			let tomorrowIcon = '01d';

			if (tomorrowForecasts.length > 0) {
				tomorrowHigh = Math.max(...tomorrowForecasts.map(f => this.kelvinToCelsius(f.main.temp_max || f.main.temp)));
				tomorrowLow = Math.min(...tomorrowForecasts.map(f => this.kelvinToCelsius(f.main.temp_min || f.main.temp)));
				tomorrowPrecip = Math.round(Math.max(...tomorrowForecasts.map(f => f.pop || 0)) * 100);
				tomorrowCondition = tomorrowForecasts[0].weather[0]?.description || 'Inconnu';
				tomorrowIcon = tomorrowForecasts[0].weather[0]?.icon || '01d';
			}

			console.log('🎉 Données météo traitées avec succès');

			return {
				current: {
					temp: this.kelvinToCelsius(currentData.main.temp),
					condition: currentData.weather[0].description,
					humidity: currentData.main.humidity,
					windSpeed: Math.round((currentData.wind?.speed || 0) * 3.6), // m/s vers km/h
					uvIndex: currentData.uvi || 0,
					airQuality: 'Bon', // Nécessiterait une API séparée
					feelsLike: this.kelvinToCelsius(currentData.main.feels_like)
				},
				today: todayForecasts,
				tomorrow: {
					date: 'Demain',
					high: tomorrowHigh,
					low: tomorrowLow,
					condition: tomorrowCondition,
					icon: this.getWeatherIcon(tomorrowIcon),
					precipitation: tomorrowPrecip
				},
				sun: {
					sunrise: this.formatTime(currentData.sys?.sunrise || 0),
					sunset: this.formatTime(currentData.sys?.sunset || 0)
				}
			};

		} catch (error) {
			console.error('Erreur lors de la récupération des données météo:', error);
			console.log('🔄 Utilisation des données mockées en fallback');
			return this.getMockWeatherData();
		}
	}

	private getMockWeatherData(): WeatherData {
		return {
			current: {
				temp: 22,
				condition: 'Ensoleillé',
				humidity: 65,
				windSpeed: 12,
				uvIndex: 6,
				airQuality: 'Bon',
				feelsLike: 25
			},
			today: [
				{ time: '12h', temp: 24, icon: 'sun' },
				{ time: '15h', temp: 26, icon: 'cloud' },
				{ time: '18h', temp: 23, icon: 'sun' },
				{ time: '21h', temp: 19, icon: 'cloud' }
			],
			tomorrow: {
				date: 'Demain',
				high: 28,
				low: 16,
				condition: 'Partiellement nuageux',
				icon: 'cloud',
				precipitation: 20
			},
			sun: {
				sunrise: '06:32',
				sunset: '19:45'
			}
		};
	}
}

export const weatherService = new WeatherService();
export type { WeatherData }; 