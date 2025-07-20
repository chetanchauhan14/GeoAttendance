# React Native Geo-Attendance & Reporting App

A comprehensive React Native application for Android that enables personal and manual attendance tracking based on geotagging, along with comprehensive reporting features.

## Features

### 🎯 Core Functionality
- **Geotagged Self-Attendance**: Mark attendance only when within authorized location zones
- **Manual Attendance Entry**: Add attendance manually with reasons and timestamps
- **Admin Management**: Administrators can manage users and mark attendance for others
- **Comprehensive Reporting**: WTD, MTD, and QTD attendance summaries with detailed records

### 📱 User Experience
- **Real-time Location Tracking**: GPS-based location verification with distance calculations
- **Intuitive Navigation**: Tab-based interface with attendance, reports, and admin sections
- **Material Design UI**: Clean, modern interface with proper loading states and feedback
- **Role-based Access**: Different features available based on user roles (employee/admin)

### 🔧 Technical Features
- **Firebase Integration**: Scalable backend with Firestore for data storage
- **Permission Handling**: Graceful location permission requests and status management
- **Offline Support**: Local data handling with sync capabilities
- **Performance Optimized**: Efficient location tracking and data queries

## Project Structure

```
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation configuration
│   │   ├── index.tsx            # Main attendance screen
│   │   ├── reports.tsx          # Reports and analytics screen
│   │   └── admin.tsx            # Admin panel for user management
│   └── _layout.tsx              # Root layout with providers
├── components/
│   ├── LocationStatus.tsx       # Location status display component
│   ├── AttendanceSummaryCard.tsx # Summary cards for reports
│   └── AttendanceRecordItem.tsx # Individual attendance record display
├── utils/
│   ├── locationUtils.ts         # Location services and calculations
│   ├── firebaseService.ts       # Firebase database operations
│   └── reportGenerators.ts     # Report generation and calculations
├── types/
│   └── attendance.ts            # TypeScript type definitions
└── hooks/
    └── useFrameworkReady.ts     # Framework initialization hook
```

## Setup Instructions

### 1. Dependencies Installation
The following dependencies are required and will be installed automatically:

```json
{
  "@react-native-community/geolocation": "latest",
  "@react-native-firebase/app": "latest",
  "@react-native-firebase/firestore": "latest",
  "@react-native-firebase/auth": "latest",
  "react-native-paper": "latest",
  "date-fns": "latest",
  "react-native-vector-icons": "latest"
}
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add an Android app to your project
3. Download the `google-services.json` file
4. Place it in the `android/app/` directory
5. Enable Firestore Database and Authentication in Firebase Console

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Attendance records - users can read their own, admins can read all
    match /attendanceRecords/{recordId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Location Configuration

Update the `AUTHORIZED_LOCATION` in `utils/locationUtils.ts` with your office coordinates:

```typescript
export const AUTHORIZED_LOCATION: AuthorizedLocation = {
  latitude: YOUR_OFFICE_LATITUDE,
  longitude: YOUR_OFFICE_LONGITUDE,
  radius: 100, // meters
  name: 'Your Office Location'
};
```

### 4. Android Permissions

The app automatically handles location permissions, but ensure your `android/app/src/main/AndroidManifest.xml` includes:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## Key Components

### LocationStatus Component
Displays real-time location status with visual indicators:
- Green: Inside authorized zone
- Orange: Outside authorized zone with distance
- Red: Location permission denied
- Yellow: Fetching location

### AttendanceSummaryCard Component
Shows attendance statistics:
- Days present/absent
- Working days total
- Attendance percentage with color coding

### AttendanceRecordItem Component
Individual attendance record display:
- Date and time information
- Type badges (GEO/MANUAL)
- Location coordinates for geotagged entries
- Reason for manual entries

## Data Models

### User Schema
```typescript
{
  uid: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  createdAt: string;
}
```

### AttendanceRecord Schema
```typescript
{
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
```

## Usage Examples

### Marking Geo-tagged Attendance
1. Open the app on the Attendance tab
2. Wait for location to be fetched
3. Ensure you're within the authorized zone (green status)
4. Tap "Mark Attendance" button
5. Receive confirmation message

### Viewing Reports
1. Navigate to Reports tab
2. View WTD, MTD, QTD summaries
3. Select different time periods
4. Search through detailed records
5. Pull to refresh for latest data

### Admin Functions
1. Access Admin tab (requires admin role)
2. View all users in the system
3. Create new user accounts
4. Mark attendance for other users
5. Access comprehensive attendance data

## Troubleshooting

### Location Issues
- Ensure GPS is enabled on device
- Grant location permissions when prompted
- Check if device has good GPS signal
- Verify authorized location coordinates are correct

### Firebase Issues
- Verify `google-services.json` is properly placed
- Check Firebase Console for project configuration
- Ensure Firestore security rules allow your operations
- Verify internet connectivity

### Performance Tips
- Location checks are cached for 10 seconds
- Attendance records are paginated for large datasets
- Use pull-to-refresh for data updates
- Background location tracking is disabled to save battery

## Future Enhancements

- [ ] Push notifications for attendance reminders
- [ ] Offline attendance marking with sync
- [ ] Advanced reporting with charts and graphs
- [ ] Multiple authorized locations support
- [ ] Attendance policies and rules engine
- [ ] Export reports to PDF/CSV
- [ ] Face recognition for additional security
- [ ] Team attendance overview for managers

## Development

### Running the App
```bash
npm run dev
```

### Building for Production
```bash
npm run build:web
```

### Code Structure Guidelines
- Keep components under 200 lines
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Add comprehensive comments for complex logic

## License

This project is licensed under the MIT License - see the LICENSE file for details.