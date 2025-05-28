interface WeatherData {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface MainWeatherInfo {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface WindInfo {
  speed: number;
  deg: number;
}

interface CloudsInfo {
  all: number;
}

interface SysInfo {
  type: number;
  id: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface CurrentWeather {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherData[];
  base: string;
  main: MainWeatherInfo;
  visibility: number;
  wind: WindInfo;
  clouds: CloudsInfo;
  dt: number;
  sys: SysInfo;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface ForecastItem {
  dt: number;
  main: MainWeatherInfo;
  weather: WeatherData[];
  clouds: CloudsInfo;
  wind: WindInfo;
  visibility: number;
  pop: number;
  dt_txt: string;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface CitySearchResult {
  name: string;
  local_names?: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export class WeatherService {
  static async getCurrentWeather(city: string): Promise<CurrentWeather> {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  static async getCurrentWeatherByCoords(lat: number, lon: number): Promise<CurrentWeather> {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current weather by coordinates:', error);
      throw error;
    }
  }

  static async getForecast(city: string): Promise<ForecastData> {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Forecast data not found');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  static async getForecastByCoords(lat: number, lon: number): Promise<ForecastData> {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Forecast data not found');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching forecast by coordinates:', error);
      throw error;
    }
  }

  static async searchCities(query: string): Promise<CitySearchResult[]> {
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Cities not found');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching cities:', error);
      throw error;
    }
  }

  static async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = 'Unknown location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }
} 