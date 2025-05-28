import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2 } from "lucide-react";

interface FavoritesProps {
  favorites: string[];
  onSelectCity: (city: string) => void;
  onRemoveFavorite: (city: string) => void;
}

export function Favorites({ favorites, onSelectCity, onRemoveFavorite }: FavoritesProps) {
  if (!favorites || favorites.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>Favorites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            No favorite cities yet. Add some by clicking the heart icon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          <span>Favorites</span>
          <Badge variant="secondary">{favorites.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {favorites.map((city) => (
            <div
              key={city}
              className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 transition-colors"
            >
              <Button
                variant="ghost"
                className="flex-1 justify-start h-auto p-2"
                onClick={() => onSelectCity(city)}
              >
                <span className="font-medium">{city}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveFavorite(city)}
                className="h-8 w-8 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 