import { useNavigate } from 'react-router-dom';
import { MapPin, BarChart3, Settings } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const navigateToSection = (route: string) => {
    navigate(route);
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Geo-Attendance</h1>
        <p className="subtitle">
          Track your attendance with location-based verification
        </p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <div
          className="card"
          onClick={() => navigateToSection('/attendance')}
          style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
        >
          <MapPin size={32} color="#2196F3" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Attendance</h3>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '20px' }}>
            Mark your attendance with location verification
          </p>
        </div>

        <div
          className="card"
          onClick={() => navigateToSection('/reports')}
          style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
        >
          <BarChart3 size={32} color="#4CAF50" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Reports</h3>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '20px' }}>
            View attendance summaries and detailed records
          </p>
        </div>

        <div
          className="card"
          onClick={() => navigateToSection('/admin')}
          style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
        >
          <Settings size={32} color="#FF9800" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Admin</h3>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: '20px' }}>
            Manage users and attendance records
          </p>
        </div>
      </div>

      <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E0E0E0' }}>
        <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', lineHeight: '18px' }}>
          Ensure location permissions are enabled for accurate attendance tracking
        </p>
      </div>
    </div>
  );
}