import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WeatherService } from './weatherService';

// Query keys for caching
export const weatherKeys = {
  all: ['weather'] as const,
  current: () => [...weatherKeys.all, 'current'] as const,
  currentByCity: (city: string) => [...weatherKeys.current(), city] as const,
  currentByCoords: (lat: number, lon: number) => [...weatherKeys.current(), 'coords', lat, lon] as const,
  forecast: () => [...weatherKeys.all, 'forecast'] as const,
  forecastByCity: (city: string) => [...weatherKeys.forecast(), city] as const,
  forecastByCoords: (lat: number, lon: number) => [...weatherKeys.forecast(), 'coords', lat, lon] as const,
  cities: () => [...weatherKeys.all, 'cities'] as const,
  citiesSearch: (query: string) => [...weatherKeys.cities(), query] as const,
};

// Hook for current weather by city
export function useCurrentWeather(city: string | null) {
  return useQuery({
    queryKey: weatherKeys.currentByCity(city || ''),
    queryFn: () => {
      if (!city) throw new Error('City is required');
      return WeatherService.getCurrentWeather(city);
    },
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for current weather by coordinates
export function useCurrentWeatherByCoords(coords: { lat: number; lon: number } | null) {
  return useQuery({
    queryKey: coords ? weatherKeys.currentByCoords(coords.lat, coords.lon) : [],
    queryFn: () => {
      if (!coords) throw new Error('Coordinates are required');
      return WeatherService.getCurrentWeatherByCoords(coords.lat, coords.lon);
    },
    enabled: !!coords,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for forecast by city
export function useForecast(city: string | null) {
  return useQuery({
    queryKey: weatherKeys.forecastByCity(city || ''),
    queryFn: () => {
      if (!city) throw new Error('City is required');
      return WeatherService.getForecast(city);
    },
    enabled: !!city,
    staleTime: 10 * 60 * 1000, // 10 minutes (forecast changes less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for forecast by coordinates
export function useForecastByCoords(coords: { lat: number; lon: number } | null) {
  return useQuery({
    queryKey: coords ? weatherKeys.forecastByCoords(coords.lat, coords.lon) : [],
    queryFn: () => {
      if (!coords) throw new Error('Coordinates are required');
      return WeatherService.getForecastByCoords(coords.lat, coords.lon);
    },
    enabled: !!coords,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for city search
export function useCitySearch(query: string) {
  return useQuery({
    queryKey: weatherKeys.citiesSearch(query),
    queryFn: () => WeatherService.searchCities(query),
    enabled: query.length >= 2, // Only search when query has at least 2 characters
    staleTime: 30 * 60 * 1000, // 30 minutes (city data doesn't change)
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

// Hook for getting user's current position
export function useCurrentPosition() {
  return useQuery({
    queryKey: ['geolocation', 'current'],
    queryFn: () => WeatherService.getCurrentPosition(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry geolocation requests
    refetchOnWindowFocus: false, // Don't refetch on window focus for geolocation
  });
}

// Combined hook for weather and forecast by city
export function useWeatherData(city: string | null) {
  const currentWeather = useCurrentWeather(city);
  const forecast = useForecast(city);

  return {
    currentWeather: currentWeather.data,
    forecast: forecast.data,
    isLoading: currentWeather.isLoading || forecast.isLoading,
    error: currentWeather.error || forecast.error,
    isError: currentWeather.isError || forecast.isError,
    refetch: () => {
      currentWeather.refetch();
      forecast.refetch();
    },
  };
}

// Combined hook for weather and forecast by coordinates
export function useWeatherDataByCoords(coords: { lat: number; lon: number } | null) {
  const currentWeather = useCurrentWeatherByCoords(coords);
  const forecast = useForecastByCoords(coords);

  return {
    currentWeather: currentWeather.data,
    forecast: forecast.data,
    isLoading: currentWeather.isLoading || forecast.isLoading,
    error: currentWeather.error || forecast.error,
    isError: currentWeather.isError || forecast.isError,
    refetch: () => {
      currentWeather.refetch();
      forecast.refetch();
    },
  };
}

// Mutation for prefetching weather data for favorites
export function usePrefetchWeather() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (city: string) => {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: weatherKeys.currentByCity(city),
          queryFn: () => WeatherService.getCurrentWeather(city),
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: weatherKeys.forecastByCity(city),
          queryFn: () => WeatherService.getForecast(city),
          staleTime: 10 * 60 * 1000,
        }),
      ]);
    },
  });
}

// Utility hook to invalidate all weather queries (useful for refresh)
export function useRefreshWeather() {
  const queryClient = useQueryClient();

  return () => {
    console.log('🔄 Refreshing weather data - invalidating all weather queries');
    queryClient.invalidateQueries({
      queryKey: weatherKeys.all,
    });
    console.log('✅ Weather queries invalidated - refetching should start automatically');
  };
} 