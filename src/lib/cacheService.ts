import type { CurrentWeather, ForecastData } from './weatherService';

export interface CachedWeatherData {
  currentWeather: CurrentWeather;
  forecast: ForecastData;
  timestamp: number;
  cityName: string;
}

const CACHE_KEY_PREFIX = 'weather-cache-';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export class CacheService {
  /**
   * Store weather data in localStorage with timestamp
   */
  static setCachedWeatherData(cityName: string, currentWeather: CurrentWeather, forecast: ForecastData): void {
    try {
      const cacheData: CachedWeatherData = {
        currentWeather,
        forecast,
        timestamp: Date.now(),
        cityName: cityName.toLowerCase(),
      };
      
      const key = `${CACHE_KEY_PREFIX}${cityName.toLowerCase()}`;
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching weather data:', error);
    }
  }

  /**
   * Get cached weather data for a city
   */
  static getCachedWeatherData(cityName: string): CachedWeatherData | null {
    try {
      const key = `${CACHE_KEY_PREFIX}${cityName.toLowerCase()}`;
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;
      
      const data: CachedWeatherData = JSON.parse(cached);
      return data;
    } catch (error) {
      console.error('Error getting cached weather data:', error);
      return null;
    }
  }

  /**
   * Check if cached data is still fresh (not expired)
   */
  static isCacheDataFresh(cachedData: CachedWeatherData): boolean {
    const now = Date.now();
    return (now - cachedData.timestamp) < CACHE_EXPIRY_MS;
  }

  /**
   * Get the age of cached data in minutes
   */
  static getCacheAge(cachedData: CachedWeatherData): number {
    const now = Date.now();
    return Math.floor((now - cachedData.timestamp) / (1000 * 60));
  }

  /**
   * Remove cached data for a specific city
   */
  static removeCachedData(cityName: string): void {
    try {
      const key = `${CACHE_KEY_PREFIX}${cityName.toLowerCase()}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  }

  /**
   * Get all cached cities
   */
  static getAllCachedCities(): string[] {
    try {
      const cities: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          const cityName = key.replace(CACHE_KEY_PREFIX, '');
          cities.push(cityName);
        }
      }
      return cities;
    } catch (error) {
      console.error('Error getting cached cities:', error);
      return [];
    }
  }

  /**
   * Clear all cached weather data
   */
  static clearAllCache(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Check if the user is currently online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }
} 