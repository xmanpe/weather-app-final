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
} 