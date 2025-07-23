export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  timestamp: string;
  type: 'auto_geotagged' | 'manual';
  latitude?: number;
  longitude?: number;
  markedByUserId: string;
  reason?: string;
  createdAt: string;
}

export interface AuthorizedLocation {
  latitude: number;
  longitude: number;
  radius: number; // in meters
  name: string;
}

export interface LocationStatus {
  hasPermission: boolean;
  isInside: boolean;
  distance: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface AttendanceSummary {
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  attendancePercentage: number;
}