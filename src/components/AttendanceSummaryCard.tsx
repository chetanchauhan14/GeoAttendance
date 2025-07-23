import React from 'react';
import { AttendanceSummary } from '../types/attendance';

interface AttendanceSummaryCardProps {
  title: string;
  summary: AttendanceSummary | null;
  isLoading?: boolean;
}

export function AttendanceSummaryCard({ title, summary, isLoading = false }: AttendanceSummaryCardProps) {
  if (isLoading || !summary) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#2196F3' }}>{title}</h3>
        <p style={{ fontSize: '16px', color: '#666', textAlign: 'center', paddingVertical: '32px' }}>
          {isLoading ? 'Loading...' : 'No data available'}
        </p>
      </div>
    );
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 75) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="card">
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#2196F3' }}>{title}</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{summary.daysPresent}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Present</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{summary.daysAbsent}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Absent</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{summary.totalWorkingDays}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Working Days</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid #E0E0E0' }}>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: getPercentageColor(summary.attendancePercentage) 
        }}>
          {summary.attendancePercentage.toFixed(1)}%
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Attendance</div>
      </div>
    </div>
  );
}