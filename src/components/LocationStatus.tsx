import { Locate, LocateOff, CheckCircle, AlertCircle } from 'lucide-react';
import { LocationStatus as LocationStatusType } from '../types/attendance';
import { formatDistance } from '../utils/locationUtils';

interface LocationStatusProps {
  status: LocationStatusType;
  isLoading: boolean;
}

export function LocationStatus({ status, isLoading }: LocationStatusProps) {
  const getStatusColor = () => {
    if (isLoading) return '#FFA726';
    if (!status.hasPermission) return '#F44336';
    if (status.isInside) return '#4CAF50';
    return '#FF9800';
  };

  const getStatusIcon = () => {
    const iconSize = 24;
    const color = getStatusColor();
    
    if (isLoading) return <Locate size={iconSize} color={color} />;
    if (!status.hasPermission) return <LocateOff size={iconSize} color={color} />;
    if (status.isInside) return <CheckCircle size={iconSize} color={color} />;
    return <AlertCircle size={iconSize} color={color} />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Fetching location...';
    if (!status.hasPermission) return 'Location permission denied';
    if (status.isInside) return 'You are inside the authorized zone';
    return `You are outside the authorized zone. Distance: ${formatDistance(status.distance)}`;
  };

  return (
    <div className="card" style={{ borderLeft: `4px solid ${getStatusColor()}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div>
        {getStatusIcon()}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '16px', fontWeight: '600', color: getStatusColor(), margin: '0 0 4px 0' }}>
          {getStatusText()}
        </p>
        {status.currentLocation && (
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            Lat: {status.currentLocation.latitude.toFixed(6)}, 
            Lng: {status.currentLocation.longitude.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}