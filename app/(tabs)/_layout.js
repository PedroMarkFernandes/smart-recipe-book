import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; // Import Theme

export default function TabLayout() {
  const { logout } = useAuth();
  const { colors } = useTheme(); // Get colors from our new ThemeContext

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: colors.tint,
      // Apply dynamic background and border colors
      tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerTitleAlign: 'center',
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={colors.tint} />
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
      {/* NEW SETTINGS TAB */}
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings', 
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 15 }
});