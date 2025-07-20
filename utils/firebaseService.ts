import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AttendanceRecord, User } from '@/types/attendance';

/**
 * Firebase service for handling all database operations
 */
export class FirebaseService {
  private static instance: FirebaseService;

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string {
    const user = auth().currentUser;
    return user?.uid || 'anonymous';
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

    await firestore().collection('users').doc(uid).set(user, { merge: true });
  }

  /**
   * Get user profile
   */
  async getUser(uid?: string): Promise<User | null> {
    const userId = uid || this.getCurrentUserId();
    const doc = await firestore().collection('users').doc(userId).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  /**
   * Get all users (for admin features)
   */
  async getAllUsers(): Promise<User[]> {
    const snapshot = await firestore().collection('users').get();
    return snapshot.docs.map(doc => doc.data() as User);
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
    const record: Omit<AttendanceRecord, 'id'> = {
      userId,
      timestamp: new Date().toISOString(),
      type,
      latitude: location?.latitude,
      longitude: location?.longitude,
      markedByUserId: this.getCurrentUserId(),
      reason,
      createdAt: new Date().toISOString(),
    };

    await firestore().collection('attendanceRecords').add(record);
  }

  /**
   * Get attendance records for a user within a date range
   */
  async getAttendanceRecords(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    const snapshot = await firestore()
      .collection('attendanceRecords')
      .where('userId', '==', userId)
      .where('timestamp', '>=', startDate.toISOString())
      .where('timestamp', '<=', endDate.toISOString())
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AttendanceRecord[];
  }

  /**
   * Get all attendance records for admin view
   */
  async getAllAttendanceRecords(
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    const snapshot = await firestore()
      .collection('attendanceRecords')
      .where('timestamp', '>=', startDate.toISOString())
      .where('timestamp', '<=', endDate.toISOString())
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AttendanceRecord[];
  }
}

export const firebaseService = FirebaseService.getInstance();