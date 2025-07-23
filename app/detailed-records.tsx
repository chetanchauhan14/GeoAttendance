import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, Searchbar, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AttendanceRecordItem } from '@/components/AttendanceRecordItem';
import { AttendanceRecord } from '@/types/attendance';
import { sessionStorageService } from '@/utils/sessionStorageService';
import { startOfMonth, startOfWeek, startOfQuarter } from 'date-fns';
import { ArrowLeft } from 'lucide-react-native';

type ReportPeriod = 'week' | 'month' | 'quarter';

export default function DetailedRecordsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
  const [detailedRecords, setDetailedRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadDetailedRecords();
  }, [selectedPeriod]);

  const loadDetailedRecords = async () => {
    setIsLoading(true);
    try {
      const userId = sessionStorageService.getCurrentUserId();
      const now = new Date();
      let startDate: Date;

      switch (selectedPeriod) {
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        case 'quarter':
          startDate = startOfQuarter(now);
          break;
      }

      // Get records from session storage - same source as summary
      const records = await sessionStorageService.getAttendanceRecords(
        userId,
        startDate,
        now
      );
      
      console.log(`Detailed Records - ${selectedPeriod} records:`, records.length);
      console.log('Detailed Records - Date range:', startDate, 'to', now);
      
      setDetailedRecords(records);
    } catch (error) {
      console.error('Error loading detailed records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDetailedRecords();
    setIsRefreshing(false);
  };

  const goBack = () => {
    router.back();
  };

  const filteredRecords = detailedRecords.filter(record =>
    searchQuery === '' ||
    record.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={goBack}
          style={styles.backButton}
          icon={() => <ArrowLeft size={20} color="#FFFFFF" />}
        >
          Back
        </Button>
        <Text style={styles.title}>Detailed Records</Text>
        <Text style={styles.subtitle}>
          View your attendance history by period
        </Text>
      </View>

      <View style={styles.content}>
        <SegmentedButtons
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value as ReportPeriod)}
          buttons={[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'quarter', label: 'This Quarter' },
          ]}
          style={styles.periodSelector}
        />

        <Searchbar
          placeholder="Search records..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.recordsHeader}>
          <Text style={styles.recordsTitle}>
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Records
          </Text>
          <Text style={styles.recordsCount}>
            {isLoading ? 'Loading...' : `${filteredRecords.length} records found`}
          </Text>
        </View>

        <View style={styles.recordsList}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>Loading records...</Text>
            </View>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <AttendanceRecordItem key={record.id} record={record} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No attendance records found for this period.
              </Text>
              <Button
                mode="outlined"
                onPress={() => router.push('/(tabs)' as any)}
                style={styles.emptyButton}
              >
                Mark Attendance
              </Button>
            </View>
          )}
        </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
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
  content: {
    padding: 16,
  },
  periodSelector: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recordsCount: {
    fontSize: 14,
    color: '#666',
  },
  recordsList: {
    gap: 8,
  },
  loadingState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    borderColor: '#2196F3',
  },
});