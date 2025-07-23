import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AttendanceSummary } from '@/types/attendance';
import { sessionStorageService } from '@/utils/sessionStorageService';
import { getWTDSummary, getMTDSummary, getQTDSummary } from '@/utils/reportGenerators';
import { ChartBar as BarChart3, FileText, Calendar, TrendingUp } from 'lucide-react-native';

export default function ReportsScreen() {
  const [wtdSummary, setWtdSummary] = useState<AttendanceSummary | null>(null);
  const [mtdSummary, setMtdSummary] = useState<AttendanceSummary | null>(null);
  const [qtdSummary, setQtdSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setIsLoading(true);
    try {
      const userId = sessionStorageService.getCurrentUserId();
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      // Get all records from session storage
      const allRecords = await sessionStorageService.getAttendanceRecords(
        userId,
        startOfYear,
        now
      );

      // Calculate summaries using the same data source
      setWtdSummary(getWTDSummary(allRecords));
      setMtdSummary(getMTDSummary(allRecords));
      setQtdSummary(getQTDSummary(allRecords));
    } catch (error) {
      console.error('Error loading summaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSummaries();
    setIsRefreshing(false);
  };

  const navigateToSummary = () => {
    router.push('/summary' as any);
  };

  const navigateToDetailedRecords = () => {
    router.push('/detailed-records' as any);
  };

  const getSummaryPreview = (summary: AttendanceSummary | null, title: string) => {
    if (!summary) return 'No data';
    return `${summary.daysPresent}/${summary.totalWorkingDays} days (${summary.attendancePercentage.toFixed(1)}%)`;
  };

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
          Overview of your attendance patterns
        </Text>
      </View>

      <View style={styles.quickSummary}>
        <Text style={styles.sectionTitle}>Quick Summary</Text>
        
        <Card style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Calendar size={20} color="#2196F3" />
              <Text style={styles.summaryLabel}>Week to Date:</Text>
              <Text style={styles.summaryValue}>
                {isLoading ? 'Loading...' : getSummaryPreview(wtdSummary, 'WTD')}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <TrendingUp size={20} color="#4CAF50" />
              <Text style={styles.summaryLabel}>Month to Date:</Text>
              <Text style={styles.summaryValue}>
                {isLoading ? 'Loading...' : getSummaryPreview(mtdSummary, 'MTD')}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <BarChart3 size={20} color="#FF9800" />
              <Text style={styles.summaryLabel}>Quarter to Date:</Text>
              <Text style={styles.summaryValue}>
                {isLoading ? 'Loading...' : getSummaryPreview(qtdSummary, 'QTD')}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>Detailed Reports</Text>
        
        <Button
          mode="contained"
          onPress={navigateToSummary}
          style={styles.navButton}
          contentStyle={styles.buttonContent}
          icon={() => <BarChart3 size={20} color="#FFFFFF" />}
        >
          View Summary Reports
        </Button>
        
        <Button
          mode="outlined"
          onPress={navigateToDetailedRecords}
          style={styles.navButton}
          contentStyle={styles.buttonContent}
          icon={() => <FileText size={20} color="#2196F3" />}
        >
          View Detailed Records
        </Button>
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
  quickSummary: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryCard: {
    elevation: 4,
  },
  summaryContent: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  navigationSection: {
    padding: 16,
    gap: 12,
  },
  navButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});