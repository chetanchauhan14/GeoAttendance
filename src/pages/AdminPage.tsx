import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Calendar } from 'lucide-react';
import { User } from '../types/attendance';
import { sessionStorageService } from '../utils/sessionStorageService';

export default function AdminPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [user, users] = await Promise.all([
        sessionStorageService.getUser(),
        sessionStorageService.getAllUsers()
      ]);
      
      setCurrentUser(user);
      setAllUsers(users);
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

  const isAdmin = currentUser?.role === 'admin';

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  if (!isAdmin) {
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
          <h1 className="title">Access Denied</h1>
          <p className="subtitle">
            You don't have admin privileges
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', minHeight: '50vh' }}>
          <p style={{ fontSize: '16px', color: '#666', textAlign: 'center', marginBottom: '24px', lineHeight: '24px' }}>
            This section is only available to administrators.
            Please contact your system administrator for access.
          </p>
          <button
            onClick={() => navigate('/attendance')}
            className="button button-outlined"
          >
            Back to Attendance
          </button>
        </div>
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