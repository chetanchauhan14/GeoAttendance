import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ChartBar as BarChart3, Settings } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  const navigateToSection = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Geo-Attendance App</Text>
        <Text style={styles.subtitle}>
          Track your attendance with location-based verification
        </Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateToSection('/(tabs)')}
        >
          <MapPin size={32} color="#2196F3" />
          <Text style={styles.menuTitle}>Attendance</Text>
          <Text style={styles.menuDescription}>
            Mark your attendance with location verification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateToSection('/(tabs)/reports')}
        >
          <BarChart3 size={32} color="#4CAF50" />
          <Text style={styles.menuTitle}>Reports</Text>
          <Text style={styles.menuDescription}>
            View attendance summaries and detailed records
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateToSection('/(tabs)/admin')}
        >
          <Settings size={32} color="#FF9800" />
          <Text style={styles.menuTitle}>Admin</Text>
          <Text style={styles.menuDescription}>
            Manage users and attendance records
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ensure location permissions are enabled for accurate attendance tracking
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});