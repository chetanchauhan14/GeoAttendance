import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AttendanceSummaryCard } from '@/components/AttendanceSummaryCard';
import { AttendanceSummary } from '@/types/attendance';
import { sessionStorageService } from '@/utils/sessionStorageService';
import { getWTDSummary, getMTDSummary, getQTDSummary } from '@/utils/reportGenerators';
import { ArrowLeft } from 'lucide-react-native';

export default function SummaryScreen() {
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
      
      // Get all records from session storage - same source as detailed records
      const allRecords = await sessionStorageService.getAttendanceRecords(
        userId,
        startOfYear,
        now
      );

      console.log('Summary - Total records loaded:', allRecords.length);
      
      // Calculate summaries using the same data source
      const wtd = getWTDSummary(allRecords);
      const mtd = getMTDSummary(allRecords);
      const qtd = getQTDSummary(allRecords);
      
      console.log('Summary - WTD:', wtd);
      console.log('Summary - MTD:', mtd);
      console.log('Summary - QTD:', qtd);
      
      setWtdSummary(wtd);
      setMtdSummary(mtd);
      setQtdSummary(qtd);
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

  const goBack = () => {
    router.back();
  };

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
        <Text style={styles.title}>Attendance Summary</Text>
        <Text style={styles.subtitle}>
          Week, Month, and Quarter to Date reports
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

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Summary Information</Text>
        <Text style={styles.infoText}>
          • Week to Date: Monday to current date{'\n'}
          • Month to Date: 1st of month to current date{'\n'}
          • Quarter to Date: Start of quarter to current date{'\n'}
          • Working days exclude weekends (Saturday & Sunday)
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
  summaryContainer: {
    padding: 8,
  },
  infoSection: {
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
    lineHeight: 20,
  },
});