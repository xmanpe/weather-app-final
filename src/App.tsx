import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeatherCard } from "./components/WeatherCard";
import { ForecastCard } from "./components/ForecastCard";
import { SearchBar } from "./components/SearchBar";
import { Favorites } from "./components/Favorites";
import { WeatherService } from "./lib/weatherService";
import { StorageService } from "./lib/storage";
import { Cloud, AlertCircle } from "lucide-react";
import type { CurrentWeather, ForecastData } from "./lib/weatherService";

function App() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedLocation, setHasTriedLocation] = useState<boolean>(false);

  useEffect(() => {
    setFavorites(StorageService.getFavorites());
    // Try to get user's current location first, fallback to London
    handleUseCurrentLocation();
  }, []);

  const handleSearch = async (city: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const [weatherData, forecastData] = await Promise.all([
        WeatherService.getCurrentWeather(city),
        WeatherService.getForecast(city)
      ]);
      
      setCurrentWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError(`Could not find weather data for "${city}". Please check the city name and try again.`);
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);
    
    try {
      const position = await WeatherService.getCurrentPosition();
      const [weatherData, forecastData] = await Promise.all([
        WeatherService.getCurrentWeatherByCoords(position.latitude, position.longitude),
        WeatherService.getForecastByCoords(position.latitude, position.longitude)
      ]);
      
      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setHasTriedLocation(true);
    } catch (err) {
      console.error('Error getting current location weather:', err);
      setError(`Could not get your location: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback to London only if we haven't tried location before
      if (!hasTriedLocation) {
        setHasTriedLocation(true);
        handleSearch("London");
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleToggleFavorite = (city: string) => {
    const isFavorite = StorageService.isFavorite(city);
    
    if (isFavorite) {
      const newFavorites = StorageService.removeFavorite(city);
      setFavorites(newFavorites);
    } else {
      const newFavorites = StorageService.addFavorite(city);
      setFavorites(newFavorites);
    }
  };

  const handleSelectFavorite = (city: string) => {
    handleSearch(city);
  };

  const handleRemoveFavorite = (city: string) => {
    const newFavorites = StorageService.removeFavorite(city);
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2 pt-12">
            <Cloud className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Weather App</h1>
          </div>
          <p className="text-gray-600">
            Get current weather and 5-day forecast for any city
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <WeatherCard
                weather={currentWeather}
                onToggleFavorite={handleToggleFavorite}
                onUseCurrentLocation={handleUseCurrentLocation}
                locationLoading={locationLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              forecast && <ForecastCard forecast={forecast} />
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Favorites
              favorites={favorites}
              onSelectCity={handleSelectFavorite}
              onRemoveFavorite={handleRemoveFavorite}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Weather data provided by{" "}
            <a
              href="https://openweathermap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenWeatherMap
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
