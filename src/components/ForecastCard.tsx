import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ForecastData } from "@/lib/weatherService";

interface ForecastCardProps {
  forecast: ForecastData | null;
}

interface DayStats {
  high: number;
  low: number;
  condition: {
    id: number;
    main: string;
    description: string;
    icon: string;
  };
  icon: string;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  if (!forecast || !forecast.list) return null;

  // Group forecast by day (OpenWeather returns forecast every 3 hours)
  const dailyForecasts = forecast.list.reduce((acc: Record<string, typeof forecast.list>, item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  // Get next 5 days
  const next5Days = Object.entries(dailyForecasts).slice(0, 5);

  const formatTemp = (temp: number): number => Math.round(temp);

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === tomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayStats = (dayForecasts: typeof forecast.list): DayStats => {
    const temps = dayForecasts.map(f => f.main.temp);
    const conditions = dayForecasts[Math.floor(dayForecasts.length / 2)]; // Middle forecast for the day
    
    return {
      high: Math.max(...temps),
      low: Math.min(...temps),
      condition: conditions.weather[0],
      icon: conditions.weather[0].icon
    };
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {next5Days.map(([date, dayForecasts]) => {
            const stats = getDayStats(dayForecasts);
            
            return (
              <div
                key={date}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-medium min-w-[80px]">
                    {getDayName(date)}
                  </span>
                  <img
                    src={`https://openweathermap.org/img/wn/${stats.icon}.png`}
                    alt={stats.condition.description}
                    className="w-8 h-8"
                  />
                  <div className="flex flex-col">
                    <Badge variant="outline" className="text-xs">
                      {stats.condition.main}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {stats.condition.description}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-right">
                  <span className="font-semibold">{formatTemp(stats.high)}°</span>
                  <span className="text-muted-foreground">{formatTemp(stats.low)}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 