import { useQueryClient } from '@tanstack/react-query';
import { weatherKeys } from './weatherHooks';
import { WeatherService } from './weatherService';

// Utility for background cache warming
export function useCacheWarming() {
  const queryClient = useQueryClient();

  const warmCache = async (cities: string[]) => {
    const promises = cities.map(city => [
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
    ]).flat();

    await Promise.allSettled(promises);
  };

  return { warmCache };
}

// Utility for cache inspection
export function useCacheInspector() {
  const queryClient = useQueryClient();

  const getCacheStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const weatherQueries = queries.filter(query => 
      query.queryKey[0] === 'weather'
    );

    return {
      totalQueries: queries.length,
      weatherQueries: weatherQueries.length,
      cachedData: weatherQueries.map(query => ({
        key: query.queryKey,
        dataUpdatedAt: query.state.dataUpdatedAt,
        isStale: query.isStale(),
        state: query.state.status,
      })),
    };
  };

  const clearWeatherCache = () => {
    queryClient.removeQueries({
      queryKey: weatherKeys.all,
    });
  };

  return { getCacheStats, clearWeatherCache };
}

// Hook for offline support and cache persistence
export function useOfflineSupport() {
  const queryClient = useQueryClient();

  const enableOfflineMode = () => {
    // Disable background refetching when offline
    queryClient.setDefaultOptions({
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        networkMode: 'offlineFirst',
      },
    });
  };

  const enableOnlineMode = () => {
    // Re-enable background refetching when online
    queryClient.setDefaultOptions({
      queries: {
        retry: 3,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        networkMode: 'online',
      },
    });
  };

  const isOnline = navigator.onLine;

  return { enableOfflineMode, enableOnlineMode, isOnline };
}

// Smart cache invalidation based on time and usage patterns
export function useSmartCacheInvalidation() {
  const queryClient = useQueryClient();

  const invalidateStaleData = () => {
    const now = Date.now();
    const cache = queryClient.getQueryCache();
    
    cache.getAll().forEach(query => {
      if (query.queryKey[0] === 'weather') {
        const lastUpdated = query.state.dataUpdatedAt || 0;
        const staleTime = 5 * 60 * 1000; // 5 minutes
        
        if (now - lastUpdated > staleTime) {
          queryClient.invalidateQueries({
            queryKey: query.queryKey,
          });
        }
      }
    });
  };

  const invalidateByPattern = (pattern: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        );
      },
    });
  };

  return { invalidateStaleData, invalidateByPattern };
} 