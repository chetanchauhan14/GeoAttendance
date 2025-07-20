import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { MapPin, User, Clock } from 'lucide-react-native';
import { AttendanceRecord } from '@/types/attendance';
import { formatAttendanceRecord } from '@/utils/reportGenerators';

interface AttendanceRecordItemProps {
  record: AttendanceRecord;
}

export function AttendanceRecordItem({ record }: AttendanceRecordItemProps) {
  const formatted = formatAttendanceRecord(record);
  const isGeotagged = record.type === 'auto_geotagged';

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>{formatted.date}</Text>
          <Text style={styles.time}>{formatted.time}</Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Clock size={16} color="#666" />
            <Text style={styles.detailText}>Type: {formatted.type}</Text>
          </View>
          
          {isGeotagged && (
            <View style={styles.detailItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.detailText}>Location: {formatted.location}</Text>
            </View>
          )}
          
          {record.reason && (
            <View style={styles.detailItem}>
              <User size={16} color="#666" />
              <Text style={styles.detailText}>Reason: {formatted.reason}</Text>
            </View>
          )}
        </View>
        
        <View style={[styles.typeBadge, isGeotagged ? styles.geoBadge : styles.manualBadge]}>
          <Text style={[styles.badgeText, isGeotagged ? styles.geoBadgeText : styles.manualBadgeText]}>
            {isGeotagged ? 'GEO' : 'MANUAL'}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
  },
  content: {
    padding: 16,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  geoBadge: {
    backgroundColor: '#E8F5E8',
  },
  manualBadge: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  geoBadgeText: {
    color: '#4CAF50',
  },
  manualBadgeText: {
    color: '#FF9800',
  },
});