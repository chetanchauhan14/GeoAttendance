import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, Searchbar, SegmentedButtons } from 'react-native-paper';
import { AttendanceSummaryCard } from '@/components/AttendanceSummaryCard';
import { AttendanceRecordItem } from '@/components/AttendanceRecordItem';
import { AttendanceRecord, AttendanceSummary } from '@/types/attendance';
import { sessionStorageService } from '@/utils/sessionStorageService';
import { getWTDSummary, getMTDSummary, getQTDSummary } from '@/utils/reportGenerators';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

type ReportPeriod = 'week' | 'month' | 'quarter';

export default function ReportsScreen() {
  const [wtdSummary, setWtdSummary] = useState<AttendanceSummary>({
    totalWorkingDays: 0,
    daysPresent: 0,
    daysAbsent: 0,
    attendancePercentage: 0
  });
  const [mtdSummary, setMtdSummary] = useState<AttendanceSummary>({
    totalWorkingDays: 0,
    daysPresent: 0,
    daysAbsent: 0,
    attendancePercentage: 0
  });
  const [qtdSummary, setQtdSummary] = useState<AttendanceSummary>({
    totalWorkingDays: 0,
    daysPresent: 0,
    daysAbsent: 0,
    attendancePercentage: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
  const [detailedRecords, setDetailedRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadReports();
      loadDetailedRecords();
    }, [selectedPeriod])
  );

  useEffect(() => {
    loadDetailedRecords();
  }, [selectedPeriod]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const userId = sessionStorageService.getCurrentUserId();
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      // Get all records for the year to calculate summaries
      const allRecords = await sessionStorageService.getAttendanceRecords(
        userId,
        startOfYear,
        now
      );

      // Calculate summaries
      setWtdSummary(getWTDSummary(allRecords));
      setMtdSummary(getMTDSummary(allRecords));
      setQtdSummary(getQTDSummary(allRecords));
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetailedRecords = async () => {
    try {
      const userId = sessionStorageService.getCurrentUserId();
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
          break;
      }

      const records = await sessionStorageService.getAttendanceRecords(
        userId,
        startDate,
        endDate
      );
      setDetailedRecords(records);
    } catch (error) {
      console.error('Error loading detailed records:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadReports();
    await loadDetailedRecords();
    setIsRefreshing(false);
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
        <Text style={styles.title}>Attendance Reports</Text>
        <Text style={styles.subtitle}>
          Track your attendance patterns and history
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <AttendanceSummaryCard
          title="Week to Date"
          summary={wtdSummary}
          isLoading={isLoading}
        />
        <AttendanceSummaryCard
          title="Month to Date"
          summary={mtdSummary}
          isLoading={isLoading}
        />
        <AttendanceSummaryCard
          title="Quarter to Date"
          summary={qtdSummary}
          isLoading={isLoading}
        />
      </View>

      <View style={styles.detailedSection}>
        <Text style={styles.sectionTitle}>Detailed Records</Text>
        
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

        <View style={styles.recordsList}>
          {filteredRecords.length > 0 ? (
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
                onPress={() => {/* Navigate to attendance screen */}}
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
  summaryContainer: {
    padding: 8,
  },
  detailedSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  periodSelector: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  recordsList: {
    gap: 8,
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