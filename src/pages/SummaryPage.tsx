import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AttendanceSummaryCard } from '../components/AttendanceSummaryCard';
import { AttendanceSummary } from '../types/attendance';
import { sessionStorageService } from '../utils/sessionStorageService';
import { getWTDSummary, getMTDSummary, getQTDSummary } from '../utils/reportGenerators';

export default function SummaryPage() {
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

      console.log('Summary - Total records loaded:', allRecords.length);
      
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
        <h1 className="title">Attendance Summary</h1>
        <p className="subtitle">
          Week, Month, and Quarter to Date reports
        </p>
      </div>

      <div style={{ padding: '8px' }}>
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
      </div>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Summary Information</h3>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: '20px', margin: 0 }}>
          • Week to Date: Monday to current date<br/>
          • Month to Date: 1st of month to current date<br/>
          • Quarter to Date: Start of quarter to current date<br/>
          • Working days exclude weekends (Saturday & Sunday)
        </p>
      </div>
    </div>
  );
}