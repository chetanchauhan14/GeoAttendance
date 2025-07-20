import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Locate as LocationOn, LocateOff as LocationOff, CircleCheck as CheckCircle, Carrot as Error } from 'lucide-react-native';
import { LocationStatus as LocationStatusType } from '@/types/attendance';
import { formatDistance } from '@/utils/locationUtils';

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
    
    if (isLoading) return <LocationOn size={iconSize} color={color} />;
    if (!status.hasPermission) return <LocationOff size={iconSize} color={color} />;
    if (status.isInside) return <CheckCircle size={iconSize} color={color} />;
    return <Error size={iconSize} color={color} />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Fetching location...';
    if (!status.hasPermission) return 'Location permission denied';
    if (status.isInside) return 'You are inside the authorized zone';
    return `You are outside the authorized zone. Distance: ${formatDistance(status.distance)}`;
  };

  return (
    <Card style={[styles.card, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getStatusIcon()}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          {status.currentLocation && (
            <Text style={styles.coordsText}>
              Lat: {status.currentLocation.latitude.toFixed(6)}, 
              Lng: {status.currentLocation.longitude.toFixed(6)}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
    borderLeftWidth: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 12,
    color: '#666',
  },
});