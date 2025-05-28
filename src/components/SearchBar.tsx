import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Wind, Droplets, Thermometer } from "lucide-react";
import { WeatherService } from "@/lib/weatherService";
import type { CurrentWeather, CitySearchResult } from "@/lib/weatherService";

interface SearchResult {
  city: CitySearchResult;
  weather: CurrentWeather | null;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowResults(false);
      setQuery("");
    }
  };

  const handleCitySelect = (cityName: string) => {
    onSearch(cityName);
    setShowResults(false);
    setQuery("");
  };

  const formatTemp = (temp: number): number => Math.round(temp);

  // Function to get unique cities
  const getUniqueCities = (cities: CitySearchResult[]): CitySearchResult[] => {
    const uniqueCities = cities.filter((city, index, self) => 
      index === self.findIndex(c => 
        c.name.toLowerCase() === city.name.toLowerCase() && 
        c.country === city.country
      )
    );
    return uniqueCities.slice(0, 3);
  };

  // Debounced search function
  useEffect(() => {
    if (query.length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const cities = await WeatherService.searchCities(query);
          const uniqueCities = getUniqueCities(cities);
          
          const searchResultsWithWeather = await Promise.all(
            uniqueCities.map(async (city) => {
              try {
                const weather = await WeatherService.getCurrentWeather(city.name);
                return { city, weather };
              } catch (error) {
                console.error(`Failed to get weather for ${city.name}:`, error);
                return { city, weather: null };
              }
            })
          );
          
          setSearchResults(searchResultsWithWeather);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Handle clicks outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Background Overlay */}
      {showResults && (searchResults.length > 0 || isSearching) && (
        <div className="fixed inset-0 bg-black/20 z-40" />
      )}
      
      <div ref={containerRef} className="relative w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            type="text"
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            disabled={loading}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Search Results Dropdown */}
        {showResults && (searchResults.length > 0 || isSearching) && (
          <Card className="absolute top-full py-0 mt-2 w-full z-50 max-h-96 overflow-y-auto shadow-lg border">
            <CardContent className="p-0">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : (
                <div className="space-y-0">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.city.name}-${result.city.country}-${result.city.lat}-${result.city.lon}`}
                      className={`p-4 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${
                        index === 0 ? 'rounded-t-lg' : ''
                      } ${index === searchResults.length - 1 ? 'rounded-b-lg' : ''}`}
                      onClick={() => handleCitySelect(result.city.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{result.city.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {result.city.country}
                            </Badge>
                            {result.city.state && (
                              <Badge variant="secondary" className="text-xs">
                                {result.city.state}
                              </Badge>
                            )}
                          </div>
                          
                          {result.weather ? (
                            <>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-3xl font-bold">
                                    {formatTemp(result.weather.main.temp)}°C
                                  </span>
                                  <img
                                    src={`https://openweathermap.org/img/wn/${result.weather.weather[0].icon}.png`}
                                    alt={result.weather.weather[0].description}
                                    className="w-12 h-12"
                                  />
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary" className="mb-1">
                                    {result.weather.weather[0].main}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {result.weather.weather[0].description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div className="flex items-center space-x-1">
                                  <Thermometer className="h-3 w-3 text-muted-foreground" />
                                  <span>Feels {formatTemp(result.weather.main.feels_like)}°C</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Wind className="h-3 w-3 text-muted-foreground" />
                                  <span>{result.weather.wind.speed} m/s</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Droplets className="h-3 w-3 text-muted-foreground" />
                                  <span>{result.weather.main.humidity}%</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Weather data unavailable
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
} 