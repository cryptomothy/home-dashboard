import { PUBLIC_DEFAULT_LAT, PUBLIC_DEFAULT_LON } from '$env/static/public';

// Types pour l'API OpenMeteo
interface OpenMeteoCurrentResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  current_units: {
    temperature_2m: string;
    apparent_temperature: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
  };
}

interface OpenMeteoForecastResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    sunrise: string[];
    sunset: string[];
  };
  daily_units: {
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_probability_max: string;
    sunrise: string;
    sunset: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
  hourly_units: {
    temperature_2m: string;
    precipitation_probability: string;
  };
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
    hourly: {
      time: string;
      temp: number;
      icon: string;
      precipitation: number;
    }[];
  };
  sun: {
    sunrise: string;
    sunset: string;
  };
}

class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';

  constructor() {
    // OpenMeteo ne nécessite pas de clé API
  }

  private getWeatherIcon(weatherCode: number): string {
    // Mapping des codes WMO (World Meteorological Organization) vers nos icônes
    // https://open-meteo.com/en/docs
    if (weatherCode === 0) return 'sun'; // Ciel dégagé
    if (weatherCode >= 1 && weatherCode <= 3) return 'cloud'; // Partiellement nuageux
    if (weatherCode >= 45 && weatherCode <= 48) return 'cloud'; // Brouillard
    if (weatherCode >= 51 && weatherCode <= 55) return 'rain'; // Bruine
    if (weatherCode >= 56 && weatherCode <= 57) return 'rain'; // Bruine verglaçante
    if (weatherCode >= 61 && weatherCode <= 65) return 'rain'; // Pluie
    if (weatherCode >= 66 && weatherCode <= 67) return 'rain'; // Pluie verglaçante
    if (weatherCode >= 71 && weatherCode <= 75) return 'snow'; // Neige
    if (weatherCode >= 77 && weatherCode <= 77) return 'snow'; // Grains de neige
    if (weatherCode >= 80 && weatherCode <= 82) return 'rain'; // Averses de pluie
    if (weatherCode >= 85 && weatherCode <= 86) return 'snow'; // Averses de neige
    if (weatherCode >= 95 && weatherCode <= 95) return 'rain'; // Orage
    if (weatherCode >= 96 && weatherCode <= 99) return 'rain'; // Orage avec grêle
    return 'sun';
  }

  private getWeatherCondition(weatherCode: number): string {
    // Mapping des codes WMO vers les descriptions en français
    const conditions: { [key: number]: string } = {
      0: 'Ciel dégagé',
      1: 'Peu nuageux',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard givrant',
      51: 'Bruine légère',
      53: 'Bruine modérée',
      55: 'Bruine dense',
      56: 'Bruine verglaçante légère',
      57: 'Bruine verglaçante dense',
      61: 'Pluie légère',
      63: 'Pluie modérée',
      65: 'Pluie forte',
      66: 'Pluie verglaçante légère',
      67: 'Pluie verglaçante forte',
      71: 'Neige légère',
      73: 'Neige modérée',
      75: 'Neige forte',
      77: 'Grains de neige',
      80: 'Averses de pluie légères',
      81: 'Averses de pluie modérées',
      82: 'Averses de pluie violentes',
      85: 'Averses de neige légères',
      86: 'Averses de neige fortes',
      95: 'Orage',
      96: 'Orage avec grêle légère',
      99: 'Orage avec grêle forte',
    };
    return conditions[weatherCode] || 'Inconnu';
  }

  private formatTime(timeString: string): string {
    return new Date(timeString).toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async getCurrentWeather(
    lat: number = parseFloat(PUBLIC_DEFAULT_LAT),
    lon: number = parseFloat(PUBLIC_DEFAULT_LON),
  ): Promise<WeatherData | null> {
    console.log('🌤️ Tentative de récupération des données météo avec OpenMeteo');

    try {
      // Construire l'URL pour OpenMeteo
      const url = `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,sunrise,sunset&timezone=auto&forecast_days=2`;

      console.log('📡 URL de requête OpenMeteo:', url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Réponse API OpenMeteo:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Erreur API OpenMeteo: ${response.status} - ${errorText}`);
      }

      const data: OpenMeteoCurrentResponse & OpenMeteoForecastResponse = await response.json();
      console.log('✅ Données météo OpenMeteo récupérées avec succès', data);

      // Vérifier que les données sont valides
      if (!data.current || !data.hourly || !data.daily) {
        throw new Error('Données météo OpenMeteo invalides');
      }

      // Traiter les données actuelles
      const current = data.current;
      const currentTime = new Date();

      // Prévisions pour aujourd'hui (prochaines 4 heures)
      const todayForecasts = [];
      const currentHourIndex = data.hourly.time.findIndex((time) => {
        const forecastTime = new Date(time);
        return forecastTime > currentTime;
      });

      if (currentHourIndex !== -1) {
        // Prendre les 4 prochaines heures à partir de l'heure actuelle
        for (let i = 0; i < 4 && currentHourIndex + i < data.hourly.time.length; i++) {
          const hourIndex = currentHourIndex + i;
          const forecastTime = new Date(data.hourly.time[hourIndex]);
          const hour = forecastTime.getHours();

          todayForecasts.push({
            time: `${hour.toString().padStart(2, '0')}h`,
            temp: Math.round(data.hourly.temperature_2m[hourIndex]),
            icon: this.getWeatherIcon(data.hourly.weather_code[hourIndex]),
          });
        }
      }

      // Prévisions pour demain
      const tomorrowData = {
        high: Math.round(data.daily.temperature_2m_max[1]),
        low: Math.round(data.daily.temperature_2m_min[1]),
        precipitation: data.daily.precipitation_probability_max[1],
        condition: this.getWeatherCondition(data.daily.weather_code[1]),
        icon: this.getWeatherIcon(data.daily.weather_code[1]),
      };

      // Prévisions horaires pour demain
      const tomorrowHourly = [];
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowStart = new Date(tomorrowDate);
      tomorrowStart.setHours(8, 0, 0, 0); // Commencer à 8h du matin
      const tomorrowEnd = new Date(tomorrowDate);
      tomorrowEnd.setHours(22, 59, 59, 999); // Finir à 22h59

      // Filtrer les prévisions horaires pour demain (8h-22h)
      for (let i = 0; i < data.hourly.time.length; i++) {
        const forecastTime = new Date(data.hourly.time[i]);
        if (forecastTime >= tomorrowStart && forecastTime <= tomorrowEnd) {
          const hour = forecastTime.getHours();

          tomorrowHourly.push({
            time: `${hour.toString().padStart(2, '0')}h`,
            temp: Math.round(data.hourly.temperature_2m[i]),
            icon: this.getWeatherIcon(data.hourly.weather_code[i]),
            precipitation: data.hourly.precipitation_probability[i],
          });
        }
      }

      console.log('🎉 Données météo OpenMeteo traitées avec succès');

      return {
        current: {
          temp: Math.round(current.temperature_2m),
          condition: this.getWeatherCondition(current.weather_code),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m * 3.6), // m/s vers km/h
          uvIndex: 0, // OpenMeteo ne fournit pas l'UV dans la version gratuite
          airQuality: 'Bon', // Nécessiterait une API séparée
          feelsLike: Math.round(current.apparent_temperature),
        },
        today: todayForecasts,
        tomorrow: {
          date: 'Demain',
          high: tomorrowData.high,
          low: tomorrowData.low,
          condition: tomorrowData.condition,
          icon: tomorrowData.icon,
          precipitation: tomorrowData.precipitation,
          hourly: tomorrowHourly,
        },
        sun: {
          sunrise: this.formatTime(data.daily.sunrise[0]),
          sunset: this.formatTime(data.daily.sunset[0]),
        },
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo OpenMeteo:', error);
      console.log('🔄 Utilisation des données mockées en fallback');
      return null;
    }
  }
}

export const weatherService = new WeatherService();
export type { WeatherData };
