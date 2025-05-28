import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, Eye } from "lucide-react";
import { WeatherModal } from "./WeatherModal";

interface FavoritesProps {
  favorites: string[];
  onSelectCity: (city: string) => void;
  onRemoveFavorite: (city: string) => void;
  onToggleFavorite?: (city: string) => void;
}

export function Favorites({ favorites, onSelectCity, onRemoveFavorite, onToggleFavorite }: FavoritesProps) {
  const [selectedCityForModal, setSelectedCityForModal] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCityClick = (city: string) => {
    setSelectedCityForModal(city);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCityForModal(null);
  };

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
    <>
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
                className="group flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 hover:border-blue-200 transition-all duration-200 cursor-pointer"
                onClick={() => handleCityClick(city)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Eye className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                  <span className="font-medium group-hover:text-blue-600 transition-colors">
                    {city}
                  </span>
                  <Badge variant="outline" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the city selection
                    onRemoveFavorite(city);
                  }}
                  className="h-8 w-8 text-red-500 hover:text-red-700 opacity-70 group-hover:opacity-100 transition-opacity"
                  title={`Remove ${city} from favorites`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              💡 Click on any city to view detailed weather information in a popup
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weather Modal */}
      {selectedCityForModal && (
        <WeatherModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          cityName={selectedCityForModal}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </>
  );
} 