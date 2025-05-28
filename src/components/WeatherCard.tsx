import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Wind, Droplets, Eye, Thermometer } from "lucide-react";
import { StorageService } from "@/lib/storage";
import type { CurrentWeather } from "@/lib/weatherService";

interface WeatherCardProps {
  weather: CurrentWeather | null;
  onToggleFavorite: (city: string) => void;
}

export function WeatherCard({ weather, onToggleFavorite }: WeatherCardProps) {
  if (!weather) return null;

  const isFavorite = StorageService.isFavorite(weather.name);

  const formatTemp = (temp: number): number => Math.round(temp);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{weather.name}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorite(weather.name)}
          className="h-8 w-8"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold">{formatTemp(weather.main.temp)}°C</p>
            <p className="text-sm text-muted-foreground">
              Feels like {formatTemp(weather.main.feels_like)}°C
            </p>
          </div>
          <div className="text-right">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-16 h-16"
            />
            <Badge variant="secondary" className="mt-1">
              {weather.weather[0].main}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span>{weather.wind.speed} m/s</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <span>{weather.main.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>{weather.visibility / 1000} km</span>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <span>{weather.main.pressure} hPa</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="capitalize">{weather.weather[0].description}</p>
          <p>High: {formatTemp(weather.main.temp_max)}°C / Low: {formatTemp(weather.main.temp_min)}°C</p>
        </div>
      </CardContent>
    </Card>
  );
} 