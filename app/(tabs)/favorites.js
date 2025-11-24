import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext'; // Import Theme

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // Calculate width for 2 columns

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();
  const { colors, fontSizeMultiplier } = useTheme(); // Get theme values

  // This runs every time you open this tab to refresh the list
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (favorites.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2927/2927347.png' }} 
          style={{ width: 100, height: 100, opacity: 0.5, marginBottom: 20 }} 
        />
        <Text style={[styles.emptyText, { color: colors.text, fontSize: 20 * fontSizeMultiplier }]}>No favorites yet!</Text>
        <Text style={[styles.subText, { color: colors.subText, fontSize: 16 * fontSizeMultiplier }]}>Start building your cookbook.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text, fontSize: 24 * fontSizeMultiplier }]}>My Cookbook 📖</Text>
      <FlatList
        data={favorites}
        numColumns={2} // <--- MAKES IT A GRID
        keyExtractor={(item) => item.idMeal}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card }]} 
            onPress={() => router.push(`/recipe/${item.idMeal}`)}
          >
            <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
            <View style={styles.info}>
              <Text 
                style={[styles.name, { color: colors.text, fontSize: 14 * fontSizeMultiplier }]} 
                numberOfLines={2}
              >
                {item.strMeal}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontWeight: 'bold', marginBottom: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontWeight: 'bold' },
  subText: { marginTop: 10 },
  
  // Grid Card Styles
  card: { 
    width: CARD_WIDTH, 
    marginBottom: 15, 
    borderRadius: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
    overflow: 'hidden'
  },
  thumb: { width: '100%', height: 120 },
  info: { padding: 10, alignItems: 'center' },
  name: { fontWeight: 'bold', textAlign: 'center' }
});