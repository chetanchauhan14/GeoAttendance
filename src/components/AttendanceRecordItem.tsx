import React from 'react';
import { MapPin, User, Clock } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';
import { formatAttendanceRecord } from '../utils/reportGenerators';

interface AttendanceRecordItemProps {
  record: AttendanceRecord;
}

export function AttendanceRecordItem({ record }: AttendanceRecordItemProps) {
  const formatted = formatAttendanceRecord(record);
  const isGeotagged = record.type === 'auto_geotagged';

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>{formatted.date}</h3>
        <span style={{ fontSize: '14px', color: '#666' }}>{formatted.time}</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#666" />
          <span style={{ fontSize: '14px', color: '#666', flex: 1 }}>Type: {formatted.type}</span>
        </div>
        
        {isGeotagged && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#666" />
            <span style={{ fontSize: '14px', color: '#666', flex: 1 }}>Location: {formatted.location}</span>
          </div>
        )}
        
        {record.reason && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} color="#666" />
            <span style={{ fontSize: '14px', color: '#666', flex: 1 }}>Reason: {formatted.reason}</span>
          </div>
        )}
      </div>
      
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '16px',
        padding: '4px 8px',
        borderRadius: '12px',
        backgroundColor: isGeotagged ? '#E8F5E8' : '#FFF3E0',
      }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 'bold',
          color: isGeotagged ? '#4CAF50' : '#FF9800',
        }}>
          {isGeotagged ? 'GEO' : 'MANUAL'}
        </span>
      </div>
    </div>
  );
}