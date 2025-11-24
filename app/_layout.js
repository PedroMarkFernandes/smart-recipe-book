import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext'; // <--- IMPORT THIS

const RootLayoutNav = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return <Slot />;
};

export default function Layout() {
  return (
    // WRAP EVERYTHING IN THEME PROVIDER
    <AuthProvider>
      <ThemeProvider> 
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}