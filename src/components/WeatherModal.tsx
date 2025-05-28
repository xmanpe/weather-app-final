import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Wind, 
  Droplets, 
  Eye, 
  Loader2,
  Cloud,
  Gauge
} from "lucide-react";
import { OfflineWarning } from "./OfflineWarning";
import { StorageService } from "@/lib/storage";
import { useOfflineWeatherData } from "@/lib/offlineWeatherHooks";
import type { ForecastData } from "@/lib/weatherService";

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  onToggleFavorite?: (city: string) => void;
}

export function WeatherModal({ isOpen, onClose, cityName, onToggleFavorite }: WeatherModalProps) {
  // Use offline weather hook instead of manual fetching
  const { 
    currentWeather, 
    forecast, 
    isLoading: loading, 
    error, 
    isOffline, 
    isCachedData, 
    cacheAge 
  } = useOfflineWeatherData(isOpen ? cityName : null);

  const formatTemp = (temp: number): number => Math.round(temp);

  const isFavorite = currentWeather ? StorageService.isFavorite(currentWeather.name) : false;

  // Group forecast by day
  const getDailyForecasts = () => {
    if (!forecast?.list) return [];
    
    const dailyForecasts = forecast.list.reduce((acc: Record<string, typeof forecast.list>, item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    return Object.entries(dailyForecasts).slice(0, 5);
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === tomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayStats = (dayForecasts: ForecastData['list']) => {
    const temps = dayForecasts.map(f => f.main.temp);
    const conditions = dayForecasts[Math.floor(dayForecasts.length / 2)];
    
    return {
      high: Math.max(...temps),
      low: Math.min(...temps),
      condition: conditions.weather[0],
      icon: conditions.weather[0].icon
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              <span>{cityName}</span>
            </span>
            {currentWeather && onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(currentWeather.name)}
                className="h-8 w-8"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
                  }`}
                />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Offline Warning */}
        <OfflineWarning 
          isOffline={isOffline}
          isCachedData={isCachedData}
          cacheAge={cacheAge}
          className="mb-4"
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Loading weather data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error.message || 'An error occurred'}</p>
          </div>
        ) : currentWeather ? (
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {/* Current Weather Card */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{formatTemp(currentWeather.main.temp)}°C</p>
                      <p className="text-sm text-muted-foreground">
                        Feels like {formatTemp(currentWeather.main.feels_like)}°C
                      </p>
                    </div>
                    <div className="text-right">
                      <img
                        src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                        alt={currentWeather.weather[0].description}
                        className="w-16 h-16"
                      />
                      <Badge variant="secondary" className="mt-1">
                        {currentWeather.weather[0].main}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <span>{currentWeather.wind.speed} m/s</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <span>{currentWeather.main.humidity}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{currentWeather.visibility / 1000} km</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span>{currentWeather.main.pressure} hPa</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="capitalize">{currentWeather.weather[0].description}</p>
                    <p>High: {formatTemp(currentWeather.main.temp_max)}°C / Low: {formatTemp(currentWeather.main.temp_min)}°C</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecast" className="space-y-4">
              {forecast && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">5-Day Forecast</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {getDailyForecasts().map(([date, dayForecasts]) => {
                        const stats = getDayStats(dayForecasts);
                        
                        return (
                          <div
                            key={date}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center space-x-4">
                              <span className="font-medium min-w-[60px] text-sm">
                                {getDayName(date)}
                              </span>
                              <img
                                src={`https://openweathermap.org/img/wn/${stats.icon}.png`}
                                alt={stats.condition.description}
                                className="w-8 h-8"
                              />
                              <div className="flex flex-col">
                                <Badge variant="outline" className="text-xs mb-1">
                                  {stats.condition.main}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-right text-sm">
                              <span className="font-semibold">{formatTemp(stats.high)}°</span>
                              <span className="text-muted-foreground">{formatTemp(stats.low)}°</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
} 