import { AttendanceRecord, AttendanceSummary } from '../types/attendance';
import {
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  eachDayOfInterval,
  isWeekend,
  format,
  isSameDay,
  parseISO,
} from 'date-fns';

/**
 * Calculate working days in a given period (excluding weekends)
 */
export function getWorkingDays(startDate: Date, endDate: Date): number {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isWeekend(day)).length;
}

/**
 * Get attendance records for a specific date
 */
export function getAttendanceForDate(
  records: AttendanceRecord[],
  date: Date
): AttendanceRecord[] {
  return records.filter(record =>
    isSameDay(parseISO(record.timestamp), date)
  );
}

/**
 * Generate attendance summary for a period
 */
export function generateAttendanceSummary(
  records: AttendanceRecord[],
  startDate: Date,
  endDate: Date
): AttendanceSummary {
  const totalWorkingDays = getWorkingDays(startDate, endDate);
  const workingDays = eachDayOfInterval({ start: startDate, end: endDate })
    .filter(day => !isWeekend(day));

  const daysPresent = workingDays.filter(day =>
    getAttendanceForDate(records, day).length > 0
  ).length;

  const daysAbsent = totalWorkingDays - daysPresent;
  const attendancePercentage = totalWorkingDays > 0 
    ? (daysPresent / totalWorkingDays) * 100 
    : 0;

  return {
    totalWorkingDays,
    daysPresent,
    daysAbsent,
    attendancePercentage,
  };
}

/**
 * Get week-to-date summary
 */
export function getWTDSummary(records: AttendanceRecord[]): AttendanceSummary {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = now; // Current date, not end of week
  
  return generateAttendanceSummary(records, start, end);
}

/**
 * Get month-to-date summary
 */
export function getMTDSummary(records: AttendanceRecord[]): AttendanceSummary {
  const now = new Date();
  const start = startOfMonth(now);
  const end = now; // Current date, not end of month
  
  return generateAttendanceSummary(records, start, end);
}

/**
 * Get quarter-to-date summary
 */
export function getQTDSummary(records: AttendanceRecord[]): AttendanceSummary {
  const now = new Date();
  const start = startOfQuarter(now);
  const end = now; // Current date, not end of quarter
  
  return generateAttendanceSummary(records, start, end);
}

/**
 * Format attendance record for display
 */
export function formatAttendanceRecord(record: AttendanceRecord): {
  date: string;
  time: string;
  type: string;
  location: string;
  reason: string;
} {
  const timestamp = parseISO(record.timestamp);
  
  return {
    date: format(timestamp, 'MMM dd, yyyy'),
    time: format(timestamp, 'HH:mm'),
    type: record.type === 'auto_geotagged' ? 'Geotagged' : 'Manual',
    location: record.latitude && record.longitude 
      ? `${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}`
      : 'N/A',
    reason: record.reason || 'N/A',
  };
}

/**
 * Group attendance records by date
 */
export function groupRecordsByDate(records: AttendanceRecord[]): {
  [date: string]: AttendanceRecord[];
} {
  return records.reduce((groups, record) => {
    const date = format(parseISO(record.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as { [date: string]: AttendanceRecord[] });
}