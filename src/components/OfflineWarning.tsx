import { AlertTriangle, WifiOff, Clock } from 'lucide-react';

interface OfflineWarningProps {
  isOffline: boolean;
  isCachedData: boolean;
  cacheAge?: number; // in minutes
  className?: string;
}

export function OfflineWarning({ 
  isOffline, 
  isCachedData, 
  cacheAge, 
  className = "" 
}: OfflineWarningProps) {
  if (!isOffline && !isCachedData) {
    return null;
  }

  const formatCacheAge = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    return `${hours}h ${remainingMinutes}m ago`;
  };

  if (isOffline && !isCachedData) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <WifiOff className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-red-800 font-medium">You're offline</p>
            <p className="text-red-700 text-sm">No cached data available for this location</p>
          </div>
        </div>
      </div>
    );
  }

  if (isOffline && isCachedData) {
    return (
      <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <WifiOff className="h-5 w-5 text-orange-600" />
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-orange-800 font-medium">You're offline</p>
            <p className="text-orange-700 text-sm">
              Showing cached data from {cacheAge !== undefined ? formatCacheAge(cacheAge) : 'earlier'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // This would be for when we're online but showing stale cached data (future feature)
  if (isCachedData && cacheAge !== undefined && cacheAge > 30) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-yellow-800 font-medium">Data may be outdated</p>
            <p className="text-yellow-700 text-sm">
              Last updated {formatCacheAge(cacheAge)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 