import { Stack, useRouter } from 'expo-router'; // Removed Slot, added Stack
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

const RootLayoutNav = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is on the login screen, redirect to tabs
        // We check the current segment to avoid loops could be added, 
        // but this logic works fine for this simple app.
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

  // CHANGED: Use Stack instead of Slot to enable "Back" history
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="recipe/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider> 
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}