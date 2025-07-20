import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Card, List, Searchbar } from 'react-native-paper';
import { User } from '@/types/attendance';
import { sessionStorageService } from '@/utils/sessionStorageService';
import { Users, UserPlus, Calendar, Clock } from 'lucide-react-native';

export default function AdminScreen() {
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
      Alert.alert('Error', 'Please fill in all fields');
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
      
      Alert.alert('Success', 'User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const handleMarkManualAttendance = (user: User) => {
    // TODO: Navigate to manual attendance screen with selected user
    Alert.alert('Manual Attendance', `Mark attendance for ${user.name}`);
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Access Denied</Text>
          <Text style={styles.subtitle}>
            You don't have admin privileges
          </Text>
        </View>
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>
            This section is only available to administrators.
            Please contact your system administrator for access.
          </Text>
          <Button
            mode="outlined"
            onPress={() => {/* TODO: Navigate back or to profile */}}
            style={styles.backButton}
          >
            Back to Attendance
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>
          Manage users and attendance records
        </Text>
      </View>

      <View style={styles.adminActions}>
        <Card style={styles.actionCard}>
          <View style={styles.cardContent}>
            <Users size={24} color="#2196F3" />
            <Text style={styles.cardTitle}>User Management</Text>
            <Text style={styles.cardSubtitle}>
              Total Users: {allUsers.length}
            </Text>
          </View>
        </Card>

        <Card style={styles.actionCard}>
          <View style={styles.cardContent}>
            <Calendar size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Attendance Records</Text>
            <Text style={styles.cardSubtitle}>
              View all attendance data
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Users</Text>
          <Button
            mode="contained"
            onPress={() => setShowUserForm(!showUserForm)}
            icon={() => <UserPlus size={16} color="#FFFFFF" />}
            style={styles.addButton}
          >
            Add User
          </Button>
        </View>

        {showUserForm && (
          <Card style={styles.formCard}>
            <View style={styles.formContent}>
              <Text style={styles.formTitle}>Create New User</Text>
              <TextInput
                label="Full Name"
                value={newUserName}
                onChangeText={setNewUserName}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Email Address"
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.formButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowUserForm(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateUser}
                  style={styles.createButton}
                >
                  Create User
                </Button>
              </View>
            </View>
          </Card>
        )}

        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <Card style={styles.usersCard}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <List.Item
                key={user.uid}
                title={user.name}
                description={`${user.email} • ${user.role}`}
                left={() => <List.Icon icon={() => <Users size={24} color="#666" />} />}
                right={() => (
                  <Button
                    mode="outlined"
                    onPress={() => handleMarkManualAttendance(user)}
                    style={styles.attendanceButton}
                  >
                    Mark Attendance
                  </Button>
                )}
                style={styles.userItem}
              />
            ))
          ) : (
            <View style={styles.emptyUsers}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noAccessText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    borderColor: '#2196F3',
  },
  adminActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  formCard: {
    marginBottom: 16,
    elevation: 2,
  },
  formContent: {
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    borderColor: '#666',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  usersCard: {
    elevation: 2,
  },
  userItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  attendanceButton: {
    borderColor: '#2196F3',
    marginRight: 8,
  },
  emptyUsers: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});