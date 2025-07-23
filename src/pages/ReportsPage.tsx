import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, FileText, Calendar, TrendingUp } from 'lucide-react';
import { AttendanceSummary } from '../types/attendance';
import { sessionStorageService } from '../utils/sessionStorageService';
import { getWTDSummary, getMTDSummary, getQTDSummary } from '../utils/reportGenerators';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [wtdSummary, setWtdSummary] = useState<AttendanceSummary | null>(null);
  const [mtdSummary, setMtdSummary] = useState<AttendanceSummary | null>(null);
  const [qtdSummary, setQtdSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setIsLoading(true);
    try {
      const userId = sessionStorageService.getCurrentUserId();
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      const allRecords = await sessionStorageService.getAttendanceRecords(
        userId,
        startOfYear,
        now
      );

      setWtdSummary(getWTDSummary(allRecords));
      setMtdSummary(getMTDSummary(allRecords));
      setQtdSummary(getQTDSummary(allRecords));
    } catch (error) {
      console.error('Error loading summaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSummaryPreview = (summary: AttendanceSummary | null, title: string) => {
    if (!summary) return 'No data';
    return `${summary.daysPresent}/${summary.totalWorkingDays} days (${summary.attendancePercentage.toFixed(1)}%)`;
  };

  return (
    <div className="container">
      <div className="header">
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="title">Attendance Reports</h1>
        <p className="subtitle">
          Overview of your attendance patterns
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Quick Summary</h2>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
            <Calendar size={20} color="#2196F3" />
            <span style={{ fontSize: '14px', color: '#666', flex: 1 }}>Week to Date:</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              {isLoading ? 'Loading...' : getSummaryPreview(wtdSummary, 'WTD')}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
            <TrendingUp size={20} color="#4CAF50" />
            <span style={{ fontSize: '14px', color: '#666', flex: 1 }}>Month to Date:</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              {isLoading ? 'Loading...' : getSummaryPreview(mtdSummary, 'MTD')}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#FF9800" />
            <span style={{ fontSize: '14px', color: '#666', flex: 1 }}>Quarter to Date:</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              {isLoading ? 'Loading...' : getSummaryPreview(qtdSummary, 'QTD')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Detailed Reports</h2>
        
        <button
          onClick={() => navigate('/summary')}
          className="button"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <BarChart3 size={20} />
          View Summary Reports
        </button>
        
        <button
          onClick={() => navigate('/detailed-records')}
          className="button button-outlined"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <FileText size={20} />
          View Detailed Records
        </button>
      </div>
    </div>
  );
}