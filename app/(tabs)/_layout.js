import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TabLayout() {
  const { logout } = useAuth();

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#ff6347',
      headerTitleAlign: 'center', // Centers the title (Home, Search, Favorites)
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#ff6347" />
        </TouchableOpacity>
      )
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search', 
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="favorites" 
        options={{ 
          title: 'Favorites', 
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 15 }
});