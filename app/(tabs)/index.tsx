import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { LocationStatus } from '@/components/LocationStatus';
import { LocationStatus as LocationStatusType } from '@/types/attendance';
import { getCurrentLocationStatus } from '@/utils/locationUtils';
import { sessionStorageService } from '@/utils/sessionStorageService';
import { CircleCheck as CheckCircle, Clock } from 'lucide-react-native';

export default function AttendanceScreen() {
  const [locationStatus, setLocationStatus] = useState<LocationStatusType>({
    hasPermission: false,
    isInside: false,
    distance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [hasAutoMarked, setHasAutoMarked] = useState(false);

  useEffect(() => {
    checkLocationStatus();
    checkTodayAttendance();
  }, []);

  useEffect(() => {
    // Auto-save attendance when user enters the authorized zone
    if (locationStatus.isInside && locationStatus.currentLocation && !hasAutoMarked && !isLoading) {
      autoMarkAttendance();
    }
  }, [locationStatus.isInside, locationStatus.currentLocation, hasAutoMarked, isLoading]);

  const checkLocationStatus = async () => {
    setIsLoading(true);
    try {
      const status = await getCurrentLocationStatus();
      setLocationStatus(status);
    } catch (error) {
      console.error('Error checking location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const records = await sessionStorageService.getAttendanceRecords(
        sessionStorageService.getCurrentUserId(),
        startOfDay,
        endOfDay
      );
      
      if (records.length > 0) {
        setTodayAttendance(records[0]);
        setHasAutoMarked(true);
      }
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const autoMarkAttendance = async () => {
    if (todayAttendance) return; // Already marked today
    
    setIsMarkingAttendance(true);
    try {
      await sessionStorageService.markAttendance(
        sessionStorageService.getCurrentUserId(),
        'auto_geotagged',
        locationStatus.currentLocation
      );
      
      setHasAutoMarked(true);
      await checkTodayAttendance();
      
      Alert.alert(
        'Attendance Auto-Marked',
        'Your attendance has been automatically recorded as you entered the authorized zone.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error auto-marking attendance:', error);
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!locationStatus.isInside || !locationStatus.currentLocation) {
      Alert.alert(
        'Cannot Mark Attendance',
        'You must be within the authorized zone to mark attendance.'
      );
      return;
    }

    setIsMarkingAttendance(true);
    try {
      await sessionStorageService.markAttendance(
        sessionStorageService.getCurrentUserId(),
        'auto_geotagged',
        locationStatus.currentLocation
      );
      
      Alert.alert(
        'Success',
        'Attendance marked successfully!',
        [{ text: 'OK' }]
      );
      await checkTodayAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert(
        'Error',
        'Failed to mark attendance. Please try again.'
      );
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleManualAttendance = () => {
    // TODO: Navigate to manual attendance screen
    Alert.alert('Manual Attendance', 'Manual attendance feature coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mark Attendance</Text>
        <Text style={styles.subtitle}>
          Ensure you're within the authorized zone to mark your attendance
        </Text>
      </View>

      <LocationStatus status={locationStatus} isLoading={isLoading} />

      {todayAttendance && (
        <Card style={styles.attendanceStatusCard}>
          <View style={styles.statusContent}>
            <CheckCircle size={24} color="#4CAF50" />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>Attendance Marked Today</Text>
              <Text style={styles.statusSubtitle}>
                {new Date(todayAttendance.timestamp).toLocaleTimeString()} • {todayAttendance.type === 'auto_geotagged' ? 'Auto-marked' : 'Manual'}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleMarkAttendance}
          disabled={!locationStatus.isInside || isLoading || isMarkingAttendance || todayAttendance}
          loading={isMarkingAttendance}
          style={[
            styles.attendanceButton,
            (locationStatus.isInside && !todayAttendance) ? styles.enabledButton : styles.disabledButton
          ]}
          contentStyle={styles.buttonContent}
        >
          {todayAttendance ? 'Already Marked Today' : 'Mark Attendance'}
        </Button>

        <Button
          mode="outlined"
          onPress={checkLocationStatus}
          disabled={isLoading}
          style={styles.refreshButton}
          contentStyle={styles.buttonContent}
        >
          Refresh Location
        </Button>

        <Button
          mode="text"
          onPress={handleManualAttendance}
          style={styles.manualButton}
          contentStyle={styles.buttonContent}
        >
          Manual Attendance Entry
        </Button>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Authorized Location</Text>
        <Text style={styles.infoText}>
          Office premises within 100 meters radius
        </Text>
        <Text style={styles.infoText}>
          Lat: 37.7749, Lng: -122.4194
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  attendanceButton: {
    borderRadius: 8,
  },
  enabledButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  refreshButton: {
    borderRadius: 8,
    borderColor: '#2196F3',
  },
  manualButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  attendanceStatusCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#E8F5E8',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statusText: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
});