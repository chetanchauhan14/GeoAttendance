import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { LocationStatus } from '../components/LocationStatus';
import { LocationStatus as LocationStatusType } from '../types/attendance';
import { checkUserLocation } from '../utils/locationUtils';
import { sessionStorageService } from '../utils/sessionStorageService';

export default function AttendancePage() {
  const navigate = useNavigate();
  const [locationStatus, setLocationStatus] = useState<LocationStatusType>({
    hasPermission: false,
    isInside: false,
    distance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [hasAutoMarked, setHasAutoMarked] = useState(false);

  useEffect(() => {
    checkLocationStatus();
    checkTodayAttendance();
  }, []);

  useEffect(() => {
    // Auto-save attendance when user enters the authorized zone
    if (locationStatus.isInside && locationStatus.currentLocation && !hasAutoMarked && !isLoading) {
      autoMarkAttendance();
    }
  }, [locationStatus.isInside, locationStatus.currentLocation, hasAutoMarked, isLoading]);

  const checkLocationStatus = async () => {
    setIsLoading(true);
    try {
      const status = await checkUserLocation();
      setLocationStatus(status);
    } catch (error) {
      console.error('Error checking location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const records = await sessionStorageService.getAttendanceRecords(
        sessionStorageService.getCurrentUserId(),
        startOfDay,
        endOfDay
      );
      
      if (records.length > 0) {
        setTodayAttendance(records[0]);
        setHasAutoMarked(true);
      }
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const autoMarkAttendance = async () => {
    if (todayAttendance) return; // Already marked today
    
    setIsMarkingAttendance(true);
    try {
      await sessionStorageService.markAttendance(
        sessionStorageService.getCurrentUserId(),
        'auto_geotagged',
        locationStatus.currentLocation
      );
      
      setHasAutoMarked(true);
      await checkTodayAttendance();
      
      alert('Attendance Auto-Marked: Your attendance has been automatically recorded as you entered the authorized zone.');
    } catch (error) {
      console.error('Error auto-marking attendance:', error);
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!locationStatus.isInside || !locationStatus.currentLocation) {
      alert('Cannot Mark Attendance: You must be within the authorized zone to mark attendance.');
      return;
    }

    setIsMarkingAttendance(true);
    try {
      await sessionStorageService.markAttendance(
        sessionStorageService.getCurrentUserId(),
        'auto_geotagged',
        locationStatus.currentLocation
      );
      
      alert('Success: Attendance marked successfully!');
      await checkTodayAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error: Failed to mark attendance. Please try again.');
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleManualAttendance = () => {
    alert('Manual Attendance: Manual attendance feature coming soon!');
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
        <h1 className="title">Mark Attendance</h1>
        <p className="subtitle">
          Ensure you're within the authorized zone to mark your attendance
        </p>
      </div>

      <LocationStatus status={locationStatus} isLoading={isLoading} />

      {todayAttendance && (
        <div className="card" style={{ backgroundColor: '#E8F5E8', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle size={24} color="#4CAF50" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2E7D32', margin: 0 }}>Attendance Marked Today</h3>
            <p style={{ fontSize: '14px', color: '#4CAF50', margin: '2px 0 0 0' }}>
              {new Date(todayAttendance.timestamp).toLocaleTimeString()} • {todayAttendance.type === 'auto_geotagged' ? 'Auto-marked' : 'Manual'}
            </p>
          </div>
        </div>
      )}

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={handleMarkAttendance}
          disabled={!locationStatus.isInside || isLoading || isMarkingAttendance || todayAttendance}
          className="button"
          style={{
            backgroundColor: (locationStatus.isInside && !todayAttendance) ? '#4CAF50' : '#BDBDBD',
            padding: '16px',
          }}
        >
          {isMarkingAttendance ? 'Marking...' : (todayAttendance ? 'Already Marked Today' : 'Mark Attendance')}
        </button>

        <button
          onClick={checkLocationStatus}
          disabled={isLoading}
          className="button button-outlined"
          style={{ padding: '16px' }}
        >
          Refresh Location
        </button>

        <button
          onClick={handleManualAttendance}
          className="button"
          style={{ background: 'none', color: '#2196F3', padding: '16px' }}
        >
          Manual Attendance Entry
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Authorized Location</h3>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
          Office premises within 100 meters radius
        </p>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
          Lat: 37.7749, Lng: -122.4194
        </p>
      </div>
    </div>
  );
}