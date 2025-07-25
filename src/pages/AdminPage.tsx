import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Calendar } from 'lucide-react';
import { User, AuthorizedLocation } from '../types/attendance';
import { sessionStorageService } from '../utils/sessionStorageService';
import { getCurrentLocationStatus } from '../utils/locationUtils';


export default function AdminPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleFetchLocation = async () => {
    setFetchingLocation(true);
    try {
      const status = await getCurrentLocationStatus();
      if (
        status &&
        typeof status.latitude === 'number' &&
        typeof status.longitude === 'number'
      ) {
        setAuthLocation((prev) => ({
          ...prev,
          latitude: status.latitude,
          longitude: status.longitude,
        }));
        setAuthLocationMsg('Fetched current location!');
        setTimeout(() => setAuthLocationMsg(''), 2000);
      } else {
        setAuthLocationMsg('Unable to fetch location.');
        setTimeout(() => setAuthLocationMsg(''), 2000);
      }
    } catch (e) {
      setAuthLocationMsg('Error fetching location.');
      setTimeout(() => setAuthLocationMsg(''), 2000);
    } finally {
      setFetchingLocation(false);
    }
  };

  // State for authorized location form
  const [authLocation, setAuthLocation] = useState<AuthorizedLocation>({
    latitude: 12.933382651731844,
    longitude: 77.70289831523786,
    radius: 2000,
    name: 'Office Location',
  });
  const [authLocationMsg, setAuthLocationMsg] = useState<string>('');

  // Load current authorized location from sessionStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const handleAuthLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthLocation((prev) => ({
      ...prev,
      [name]: name === 'radius' || name === 'latitude' || name === 'longitude' ? Number(value) : value,
    }));
  };

  const handleSaveAuthLocation = () => {
    sessionStorageService.writeAuthorizedLocation(authLocation);
    setAuthLocationMsg('Authorized location updated!');
    setTimeout(() => setAuthLocationMsg(''), 2000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [user, users] = await Promise.all([
        sessionStorageService.getUser(),
        sessionStorageService.getAllUsers()
      ]);
      
      setCurrentUser(user);
      setAllUsers(users);
      const stored = sessionStorageService.readAuthorizedLocation(authLocation);
      setAuthLocation(stored);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Error: Please fill in all fields');
      return;
    }

    try {
      await sessionStorageService.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: 'employee'
      });

      setNewUserName('');
      setNewUserEmail('');
      setShowUserForm(false);
      loadData();
      console.log(currentUser);
      alert('Success: User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error: Failed to create user');
    }
  };

  const handleMarkManualAttendance = (user: User) => {
    alert(`Manual Attendance: Mark attendance for ${user.name}`);
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // const isAdmin = currentUser?.role === 'admin';

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }


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
        <h1 className="title">Admin Panel</h1>

        <p className="subtitle">
          Manage users and attendance records
        </p>
      </div>

      <div style={{ display: 'flex', padding: '16px', gap: '12px' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <Users size={24} color="#2196F3" style={{ margin: '0 auto 8px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '8px 0 4px' }}>User Management</h3>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            Total Users: {allUsers.length}
          </p>
        </div>

        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <Calendar size={24} color="#4CAF50" style={{ margin: '0 auto 8px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '8px 0 4px' }}>Attendance Records</h3>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            View all attendance data
          </p>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Authorized Location Form */}
        <div className="card" style={{ marginBottom: '16px', maxWidth: 500 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: 12 }}>Set Authorized Location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              name="name"
              placeholder="Location Name"
              value={authLocation.name}
              onChange={handleAuthLocationChange}
              className="input"
            />
            <input
              type="number"
              name="latitude"
              placeholder="Latitude"
              value={authLocation.latitude}
              onChange={handleAuthLocationChange}
              className="input"
              step="any"
            />
            <input
              type="number"
              name="longitude"
              placeholder="Longitude"
              value={authLocation.longitude}
              onChange={handleAuthLocationChange}
              className="input"
              step="any"
            />
            <input
              type="number"
              name="radius"
              placeholder="Radius (meters)"
              value={authLocation.radius}
              onChange={handleAuthLocationChange}
              className="input"
              min="1"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={handleFetchLocation} className="button button-outlined" type="button" disabled={fetchingLocation}>
                {fetchingLocation ? 'Fetching...' : 'Fetch Location'}
              </button>
              <button onClick={handleSaveAuthLocation} className="button" style={{ backgroundColor: '#2196F3' }}>
                Save Location
              </button>
            </div>
            {authLocationMsg && <span style={{ color: 'green', fontSize: 14 }}>{authLocationMsg}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>Users</h2>
          <button
            onClick={() => setShowUserForm(!showUserForm)}
            className="button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#4CAF50' }}
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>

        {showUserForm && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Create New User</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="input"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="input"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => setShowUserForm(false)}
                className="button button-outlined"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="button"
                style={{ backgroundColor: '#4CAF50' }}
              >
                Create User
              </button>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{ marginBottom: '16px' }}
        />

        <div className="card">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.uid} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #E0E0E0' }}>
                <Users size={24} color="#666" style={{ marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{user.name}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{user.email} • {user.role}</p>
                </div>
                <button
                  onClick={() => handleMarkManualAttendance(user)}
                  className="button button-outlined"
                  style={{ marginRight: '8px' }}
                >
                  Mark Attendance
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: '#666' }}>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}