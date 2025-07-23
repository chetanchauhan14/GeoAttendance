import { AttendanceRecord, User } from '../types/attendance';

/**
 * Session storage service for handling all data operations in the browser
 */
export class SessionStorageService {
  private static instance: SessionStorageService;
  private usersCache: User[] | null = null;
  private attendanceRecordsCache: AttendanceRecord[] | null = null;

  static getInstance(): SessionStorageService {
    if (!SessionStorageService.instance) {
      SessionStorageService.instance = new SessionStorageService();
    }
    return SessionStorageService.instance;
  }

  /**
   * Clear caches when data is modified
   */
  private clearCaches(): void {
    this.usersCache = null;
    this.attendanceRecordsCache = null;
  }

  /**
   * Get current user ID (generate a random one if not exists)
   */
  getCurrentUserId(): string {
    let userId = sessionStorage.getItem('currentUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('currentUserId', userId);
    }
    return userId;
  }

  /**
   * Create or update user profile
   */
  async createUser(userData: Omit<User, 'uid' | 'createdAt'>): Promise<void> {
    const uid = this.getCurrentUserId();
    const user: User = {
      ...userData,
      uid,
      createdAt: new Date().toISOString(),
    };

    const users = this.getAllUsersSync();
    const existingIndex = users.findIndex(u => u.uid === uid);
    
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    
    sessionStorage.setItem('users', JSON.stringify(users));
    this.clearCaches();
  }

  /**
   * Get user profile
   */
  async getUser(uid?: string): Promise<User | null> {
    const userId = uid || this.getCurrentUserId();
    const users = this.getAllUsersSync();
    const user = users.find(u => u.uid === userId);
    
    // Create default user if not exists
    if (!user && userId === this.getCurrentUserId()) {
      const defaultUser: User = {
        uid: userId,
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'employee',
        createdAt: new Date().toISOString(),
      };
      await this.createUser(defaultUser);
      return defaultUser;
    }
    
    return user || null;
  }

  /**
   * Get all users (for admin features)
   */
  async getAllUsers(): Promise<User[]> {
    return this.getAllUsersSync();
  }

  /**
   * Get all users synchronously
   */
  private getAllUsersSync(): User[] {
    // Use cache if available
    if (this.usersCache) {
      return this.usersCache;
    }

    const usersData = sessionStorage.getItem('users');
    if (!usersData) {
      // Create some demo users
      const demoUsers: User[] = [
        {
          uid: this.getCurrentUserId(),
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'employee',
          createdAt: new Date().toISOString(),
        },
        {
          uid: 'admin_user',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
        }
      ];
      sessionStorage.setItem('users', JSON.stringify(demoUsers));
      this.usersCache = demoUsers;
      return demoUsers;
    }
    
    this.usersCache = JSON.parse(usersData);
    return this.usersCache;
  }

  /**
   * Mark attendance
   */
  async markAttendance(
    userId: string,
    type: 'auto_geotagged' | 'manual',
    location?: { latitude: number; longitude: number },
    reason?: string
  ): Promise<void> {
    const record: AttendanceRecord = {
      id: 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId,
      timestamp: new Date().toISOString(),
      type,
      latitude: location?.latitude,
      longitude: location?.longitude,
      markedByUserId: this.getCurrentUserId(),
      reason,
      createdAt: new Date().toISOString(),
    };

    const records = this.getAllAttendanceRecordsSync();
    records.push(record);
    sessionStorage.setItem('attendanceRecords', JSON.stringify(records));
    this.clearCaches();
  }

  /**
   * Get attendance records for a user within a date range
   */
  async getAttendanceRecords(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    return new Promise((resolve) => {
      // Use setTimeout to prevent blocking the main thread
      setTimeout(() => {
        const allRecords = this.getAllAttendanceRecordsSync();
        
        const filteredRecords = allRecords
          .filter(record => {
            const recordDate = new Date(record.timestamp);
            return record.userId === userId &&
                   recordDate >= startDate &&
                   recordDate <= endDate;
          })
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        resolve(filteredRecords);
      }, 0);
    });
  }

  /**
   * Get all attendance records for admin view
   */
  async getAllAttendanceRecords(
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    return new Promise((resolve) => {
      // Use setTimeout to prevent blocking the main thread
      setTimeout(() => {
        const allRecords = this.getAllAttendanceRecordsSync();
        
        const filteredRecords = allRecords
          .filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate >= startDate && recordDate <= endDate;
          })
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        resolve(filteredRecords);
      }, 0);
    });
  }

  /**
   * Get all attendance records synchronously
   */
  private getAllAttendanceRecordsSync(): AttendanceRecord[] {
    // Use cache if available
    if (this.attendanceRecordsCache) {
      return this.attendanceRecordsCache;
    }

    const recordsData = sessionStorage.getItem('attendanceRecords');
    if (!recordsData) {
      // Start with empty records - no dummy data
      const emptyRecords: AttendanceRecord[] = [];
      sessionStorage.setItem('attendanceRecords', JSON.stringify(emptyRecords));
      this.attendanceRecordsCache = emptyRecords;
      return emptyRecords;
    }
    
    this.attendanceRecordsCache = JSON.parse(recordsData);
    return this.attendanceRecordsCache;
  }

  /**
   * Clear all data (for testing purposes)
   */
  clearAllData(): void {
    sessionStorage.removeItem('users');
    sessionStorage.removeItem('attendanceRecords');
    sessionStorage.removeItem('currentUserId');
    this.clearCaches();
  }
}

export const sessionStorageService = SessionStorageService.getInstance();