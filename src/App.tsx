import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeatherCard } from "./components/WeatherCard";
import { ForecastCard } from "./components/ForecastCard";
import { SearchBar } from "./components/SearchBar";
import { Favorites } from "./components/Favorites";
import { StorageService } from "./lib/storage";
import { Cloud, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { 
  useWeatherData, 
  useWeatherDataByCoords, 
  useCurrentPosition,
  usePrefetchWeather,
  useRefreshWeather
} from "./lib/weatherHooks";

function App() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [useLocation, setUseLocation] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasTriedLocation, setHasTriedLocation] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("current");

  // React Query hooks
  const { data: position, isLoading: locationLoading, error: locationError } = useCurrentPosition();
  const weatherByCity = useWeatherData(selectedCity);
  const weatherByCoords = useWeatherDataByCoords(
    useLocation && position ? { lat: position.latitude, lon: position.longitude } : null
  );
  const prefetchWeather = usePrefetchWeather();
  const refreshWeather = useRefreshWeather();

  // Determine which weather data to use
  const currentWeatherData = useLocation ? weatherByCoords : weatherByCity;
  const { currentWeather, forecast, isLoading, error } = currentWeatherData;

  useEffect(() => {
    setFavorites(StorageService.getFavorites());
    // Try to get user's current location first, fallback to London
    handleUseCurrentLocation();
  }, []);

  // Prefetch weather data for favorites
  useEffect(() => {
    favorites.forEach(city => {
      prefetchWeather.mutate(city);
    });
  }, [favorites, prefetchWeather]);

  const handleSearch = async (city: string) => {
    setUseLocation(false);
    setSelectedCity(city);
  };

  const handleUseCurrentLocation = async () => {
    setUseLocation(true);
    setSelectedCity(null);
    setHasTriedLocation(true);
  };

  // Fallback to London if location fails and we haven't tried location before
  useEffect(() => {
    if (locationError && !hasTriedLocation) {
      setHasTriedLocation(true);
      handleSearch("London");
    }
  }, [locationError, hasTriedLocation]);

  const handleToggleFavorite = (city: string) => {
    const isFavorite = StorageService.isFavorite(city);
    
    if (isFavorite) {
      const newFavorites = StorageService.removeFavorite(city);
      setFavorites(newFavorites);
    } else {
      const newFavorites = StorageService.addFavorite(city);
      setFavorites(newFavorites);
      // Prefetch weather data for newly added favorite
      prefetchWeather.mutate(city);
    }
  };

  const handleSelectFavorite = (city: string) => {
    // This function is kept for compatibility but no longer switches tabs
    // The modal will handle the detailed view
    handleSearch(city);
  };

  const handleRemoveFavorite = (city: string) => {
    const newFavorites = StorageService.removeFavorite(city);
    setFavorites(newFavorites);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    
    // Call refresh function
    refreshWeather();
    
    // Simulate loading time and show success
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setRefreshSuccess(false);
      }, 2000);
    }, 500);
  };

  // Create error message from query errors
  const errorMessage = (() => {
    if (locationError && useLocation) {
      return `Could not get your location: ${locationError.message}`;
    }
    if (error && selectedCity) {
      return `Could not find weather data for "${selectedCity}". Please check the city name and try again.`;
    }
    if (error) {
      return error.message;
    }
    return null;
  })();

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
          <SearchBar onSearch={handleSearch} loading={isLoading} />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 max-w-md mx-auto">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Loading State for Location */}
        {locationLoading && useLocation && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800">Getting your location...</p>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <WeatherCard
                weather={currentWeather || null}
                onToggleFavorite={handleToggleFavorite}
                onUseCurrentLocation={handleUseCurrentLocation}
                locationLoading={locationLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            {isLoading ? (
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
              onToggleFavorite={handleToggleFavorite}
            />
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="mt-4">
          <button
            onClick={handleRefresh}
            className={`flex items-center space-x-2 mx-auto px-4 py-2 text-sm rounded-lg transition-colors ${
              isRefreshing 
                ? 'text-gray-500 bg-gray-100 cursor-not-allowed' 
                : refreshSuccess
                ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
            }`}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Refreshing...</span>
              </>
            ) : refreshSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Data Refreshed!</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>

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
          <p className="mt-2 text-xs">
            ⚡ Enhanced with React Query for caching, retry, and background updates
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
