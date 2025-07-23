import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AttendanceRecordItem } from '../components/AttendanceRecordItem';
import { AttendanceRecord } from '../types/attendance';
import { sessionStorageService } from '../utils/sessionStorageService';
import { startOfMonth, startOfWeek, startOfQuarter } from 'date-fns';

type ReportPeriod = 'week' | 'month' | 'quarter';

export default function DetailedRecordsPage() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
  const [detailedRecords, setDetailedRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredRecords = detailedRecords.filter(record =>
    searchQuery === '' ||
    record.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="title">Detailed Records</h1>
        <p className="subtitle">
          View your attendance history by period
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', marginBottom: '16px', backgroundColor: 'white', borderRadius: '8px', padding: '4px' }}>
          {(['week', 'month', 'quarter'] as ReportPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: selectedPeriod === period ? '#2196F3' : 'transparent',
                color: selectedPeriod === period ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              This {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{ marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Records
          </h2>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {isLoading ? 'Loading...' : `${filteredRecords.length} records found`}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ fontSize: '16px', color: '#666' }}>Loading records...</p>
            </div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <AttendanceRecordItem key={record.id} record={record} />
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                No attendance records found for this period.
              </p>
              <button
                onClick={() => navigate('/attendance')}
                className="button button-outlined"
              >
                Mark Attendance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}