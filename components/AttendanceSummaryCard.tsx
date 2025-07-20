import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { AttendanceSummary } from '@/types/attendance';

interface AttendanceSummaryCardProps {
  title: string;
  summary: AttendanceSummary;
  isLoading?: boolean;
}

export function AttendanceSummaryCard({ title, summary, isLoading = false }: AttendanceSummaryCardProps) {
  if (isLoading) {
    return (
      <Card style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Card>
    );
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 75) return '#FF9800';
    return '#F44336';
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.daysPresent}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.daysAbsent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.totalWorkingDays}</Text>
            <Text style={styles.statLabel}>Working Days</Text>
          </View>
        </View>
        <View style={styles.percentageContainer}>
          <Text 
            style={[
              styles.percentage, 
              { color: getPercentageColor(summary.attendancePercentage) }
            ]}
          >
            {summary.attendancePercentage.toFixed(1)}%
          </Text>
          <Text style={styles.percentageLabel}>Attendance</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2196F3',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  percentageContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  percentage: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  percentageLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 32,
  },
});