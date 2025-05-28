import { CacheService } from './cacheService';

const FAVORITES_KEY = 'weather-app-favorites';

export class StorageService {
  static getFavorites(): string[] {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static addFavorite(city: string): string[] {
    try {
      const favorites = this.getFavorites();
      const exists = favorites.some(fav => fav.toLowerCase() === city.toLowerCase());
      
      if (!exists) {
        favorites.push(city);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
      
      return favorites;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return this.getFavorites();
    }
  }

  static removeFavorite(city: string): string[] {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(fav => fav.toLowerCase() !== city.toLowerCase());
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      
      // Optional: Clean up cached data for removed favorites
      // Uncomment the line below if you want to remove cache when unfavoriting
      // CacheService.removeCachedData(city);
      
      return filtered;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return this.getFavorites();
    }
  }

  static isFavorite(city: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.toLowerCase() === city.toLowerCase());
  }

  /**
   * Clean up cached data for cities that are no longer in favorites
   */
  static cleanupUnfavoritedCache(): void {
    try {
      const favorites = this.getFavorites();
      const cachedCities = CacheService.getAllCachedCities();
      
      cachedCities.forEach(cachedCity => {
        // Skip coordinate-based cache entries
        if (cachedCity.startsWith('coords_')) return;
        
        const isFavorited = favorites.some(fav => fav.toLowerCase() === cachedCity);
        if (!isFavorited) {
          CacheService.removeCachedData(cachedCity);
        }
      });
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }
} 