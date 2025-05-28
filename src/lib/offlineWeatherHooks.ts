import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { CacheService, type CachedWeatherData } from './cacheService';
import { WeatherService, type CurrentWeather, type ForecastData } from './weatherService';
import { weatherKeys } from './weatherHooks';

export interface OfflineWeatherResult {
  currentWeather: CurrentWeather | null;
  forecast: ForecastData | null;
  isLoading: boolean;
  error: Error | null;
  isOffline: boolean;
  isCachedData: boolean;
  cacheAge?: number; // in minutes
  refetch: () => void;
}

/**
 * Enhanced hook that provides offline support for weather data by city
 */
export function useOfflineWeatherData(city: string | null): OfflineWeatherResult {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedData, setCachedData] = useState<CachedWeatherData | null>(null);
  const queryClient = useQueryClient();

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached data when offline or when city changes
  useEffect(() => {
    if (city && (isOffline || !navigator.onLine)) {
      const cached = CacheService.getCachedWeatherData(city);
      setCachedData(cached);
    }
  }, [city, isOffline]);

  // Online weather queries
  const currentWeatherQuery = useQuery({
    queryKey: weatherKeys.currentByCity(city || ''),
    queryFn: async () => {
      if (!city) throw new Error('City is required');
      const data = await WeatherService.getCurrentWeather(city);
      return data;
    },
    enabled: !!city && !isOffline,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const forecastQuery = useQuery({
    queryKey: weatherKeys.forecastByCity(city || ''),
    queryFn: async () => {
      if (!city) throw new Error('City is required');
      const data = await WeatherService.getForecast(city);
      return data;
    },
    enabled: !!city && !isOffline,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Cache successful online data
  useEffect(() => {
    if (city && currentWeatherQuery.data && forecastQuery.data && !isOffline) {
      CacheService.setCachedWeatherData(city, currentWeatherQuery.data, forecastQuery.data);
    }
  }, [city, currentWeatherQuery.data, forecastQuery.data, isOffline]);

  const refetch = () => {
    if (isOffline) {
      // When offline, try to get cached data
      if (city) {
        const cached = CacheService.getCachedWeatherData(city);
        setCachedData(cached);
      }
    } else {
      // When online, refetch from API
      currentWeatherQuery.refetch();
      forecastQuery.refetch();
    }
  };

  // Return appropriate data based on online/offline status
  if (isOffline || !navigator.onLine) {
    return {
      currentWeather: cachedData?.currentWeather || null,
      forecast: cachedData?.forecast || null,
      isLoading: false,
      error: cachedData ? null : new Error('No cached data available'),
      isOffline: true,
      isCachedData: !!cachedData,
      cacheAge: cachedData ? CacheService.getCacheAge(cachedData) : undefined,
      refetch,
    };
  }

  return {
    currentWeather: currentWeatherQuery.data || null,
    forecast: forecastQuery.data || null,
    isLoading: currentWeatherQuery.isLoading || forecastQuery.isLoading,
    error: currentWeatherQuery.error || forecastQuery.error || null,
    isOffline: false,
    isCachedData: false,
    refetch,
  };
}

/**
 * Enhanced hook that provides offline support for weather data by coordinates
 */
export function useOfflineWeatherDataByCoords(coords: { lat: number; lon: number } | null): OfflineWeatherResult {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedData, setCachedData] = useState<CachedWeatherData | null>(null);
  const queryClient = useQueryClient();

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Online weather queries
  const currentWeatherQuery = useQuery({
    queryKey: coords ? weatherKeys.currentByCoords(coords.lat, coords.lon) : [],
    queryFn: async () => {
      if (!coords) throw new Error('Coordinates are required');
      const data = await WeatherService.getCurrentWeatherByCoords(coords.lat, coords.lon);
      return data;
    },
    enabled: !!coords && !isOffline,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const forecastQuery = useQuery({
    queryKey: coords ? weatherKeys.forecastByCoords(coords.lat, coords.lon) : [],
    queryFn: async () => {
      if (!coords) throw new Error('Coordinates are required');
      const data = await WeatherService.getForecastByCoords(coords.lat, coords.lon);
      return data;
    },
    enabled: !!coords && !isOffline,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Cache successful online data using coordinates as city name
  useEffect(() => {
    if (coords && currentWeatherQuery.data && forecastQuery.data && !isOffline) {
      const cityKey = `coords_${coords.lat}_${coords.lon}`;
      CacheService.setCachedWeatherData(cityKey, currentWeatherQuery.data, forecastQuery.data);
    }
  }, [coords, currentWeatherQuery.data, forecastQuery.data, isOffline]);

  // Load cached data when offline
  useEffect(() => {
    if (coords && (isOffline || !navigator.onLine)) {
      const cityKey = `coords_${coords.lat}_${coords.lon}`;
      const cached = CacheService.getCachedWeatherData(cityKey);
      setCachedData(cached);
    }
  }, [coords, isOffline]);

  const refetch = () => {
    if (isOffline) {
      // When offline, try to get cached data
      if (coords) {
        const cityKey = `coords_${coords.lat}_${coords.lon}`;
        const cached = CacheService.getCachedWeatherData(cityKey);
        setCachedData(cached);
      }
    } else {
      // When online, refetch from API
      currentWeatherQuery.refetch();
      forecastQuery.refetch();
    }
  };

  // Return appropriate data based on online/offline status
  if (isOffline || !navigator.onLine) {
    return {
      currentWeather: cachedData?.currentWeather || null,
      forecast: cachedData?.forecast || null,
      isLoading: false,
      error: cachedData ? null : new Error('No cached data available'),
      isOffline: true,
      isCachedData: !!cachedData,
      cacheAge: cachedData ? CacheService.getCacheAge(cachedData) : undefined,
      refetch,
    };
  }

  return {
    currentWeather: currentWeatherQuery.data || null,
    forecast: forecastQuery.data || null,
    isLoading: currentWeatherQuery.isLoading || forecastQuery.isLoading,
    error: currentWeatherQuery.error || forecastQuery.error || null,
    isOffline: false,
    isCachedData: false,
    refetch,
  };
}

/**
 * Hook to check online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
} 